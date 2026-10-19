// Package testutil runs integration tests against a real Postgres in a
// Docker container (via testcontainers-go).
//
// A test package starts one Env in TestMain. The container's migrated
// database is used as a template: each test gets its own copy (CREATE
// DATABASE ... TEMPLATE), so tests are isolated from each other and can run
// in parallel even though resolvers open their own transactions.
package testutil

import (
	"context"
	"crypto/rand"
	"fmt"
	"net/url"
	"strings"
	"testing"

	"github.com/99designs/gqlgen/client"
	server "github.com/deepconcern/dwai/dwai-api/internal"
	"github.com/deepconcern/dwai/dwai-api/internal/migrate"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
)

// The migrations use uuidv7(), which needs Postgres 18+.
const postgresImage = "postgres:18-alpine"

const templateDatabase = "dwai_template"

// Env is the shared state for one test package: a Postgres container with a
// migrated template database, and the game data.
type Env struct {
	GameData *models.GameData

	container *postgres.PostgresContainer
	// admin is connected to the "postgres" database, so it can create and
	// drop test databases without holding a connection to the template.
	admin *pgxpool.Pool
	// baseURI is the container's connection string; tests swap the path to
	// point at their own database.
	baseURI *url.URL
}

// NewEnv starts the Postgres container, applies the migrations to the
// template database, and loads the game data. Call Close when done.
func NewEnv(ctx context.Context) (env *Env, err error) {
	env = &Env{}
	defer func() {
		if err != nil {
			_ = env.Close()
			env = nil
		}
	}()

	env.GameData, err = models.LoadGameData()
	if err != nil {
		return nil, fmt.Errorf("load game data: %w", err)
	}

	env.container, err = postgres.Run(ctx, postgresImage,
		postgres.WithDatabase(templateDatabase),
		postgres.BasicWaitStrategies(),
	)
	if err != nil {
		return nil, fmt.Errorf("start postgres container: %w", err)
	}

	uri, err := env.container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		return nil, fmt.Errorf("get connection string: %w", err)
	}

	env.baseURI, err = url.Parse(uri)
	if err != nil {
		return nil, fmt.Errorf("parse connection string: %w", err)
	}

	// migrate.Up closes its connection when done, which CREATE DATABASE
	// ... TEMPLATE requires.
	if err := migrate.Up(uri); err != nil {
		return nil, fmt.Errorf("migrate template database: %w", err)
	}

	env.admin, err = pgxpool.New(ctx, env.databaseURI("postgres"))
	if err != nil {
		return nil, fmt.Errorf("connect admin pool: %w", err)
	}

	return env, nil
}

// Close stops the container. testcontainers also removes it if the test
// process dies before Close runs.
func (e *Env) Close() error {
	if e.admin != nil {
		e.admin.Close()
	}

	return testcontainers.TerminateContainer(e.container)
}

// NewDB creates a fresh, migrated database for this test and returns a pool
// connected to it. The database is dropped when the test ends.
func (e *Env) NewDB(t testing.TB) *pgxpool.Pool {
	t.Helper()

	name := "test_" + strings.ToLower(rand.Text())
	ident := pgx.Identifier{name}.Sanitize()

	_, err := e.admin.Exec(t.Context(), fmt.Sprintf(
		"CREATE DATABASE %s TEMPLATE %s", ident, pgx.Identifier{templateDatabase}.Sanitize(),
	))
	if err != nil {
		t.Fatalf("create test database: %v", err)
	}

	// Cleanups run last-in first-out, so the pool closes before the drop.
	// t.Context() is already canceled by then, hence context.Background().
	t.Cleanup(func() {
		_, err := e.admin.Exec(context.Background(), fmt.Sprintf("DROP DATABASE %s WITH (FORCE)", ident))
		if err != nil {
			t.Errorf("drop test database: %v", err)
		}
	})

	pool, err := server.NewPool(t.Context(), e.databaseURI(name))
	if err != nil {
		t.Fatalf("connect to test database: %v", err)
	}
	t.Cleanup(pool.Close)

	return pool
}

// NewClient creates a fresh database (see NewDB) and returns a GraphQL client
// that sends requests through the real server handler, plus the pool for
// asserting on database state directly.
func (e *Env) NewClient(t testing.TB) (*client.Client, *pgxpool.Pool) {
	t.Helper()

	pool := e.NewDB(t)

	return client.New(server.New(pool, e.GameData), client.Path("/graphql")), pool
}

func (e *Env) databaseURI(name string) string {
	u := *e.baseURI
	u.Path = "/" + name

	return u.String()
}
