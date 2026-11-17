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
	"maps"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/99designs/gqlgen/client"
	server "github.com/deepconcern/dwai/dwai-api/internal"
	"github.com/deepconcern/dwai/dwai-api/internal/auth"
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
	// "return nil, err" sets env to nil before deferred calls run, so the
	// cleanup holds its own reference.
	partial := &Env{}
	env = partial
	defer func() {
		if err != nil {
			_ = partial.Close()
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

	if e.container == nil {
		return nil
	}

	return testcontainers.TerminateContainer(e.container)
}

// NewDB creates a fresh, migrated database for this test and returns a pool
// connected to it. The database is dropped when the test ends.
func (e *Env) NewDB(t testing.TB) *pgxpool.Pool {
	t.Helper()

	name, err := e.createDatabase(t.Context())
	if err != nil {
		t.Fatal(err)
	}

	// Cleanups run last-in first-out, so the pool closes before the drop.
	// t.Context() is already canceled by then, hence context.Background().
	t.Cleanup(func() {
		_, err := e.admin.Exec(context.Background(), fmt.Sprintf(
			"DROP DATABASE %s WITH (FORCE)", pgx.Identifier{name}.Sanitize(),
		))
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

// NewPool creates a fresh, migrated database and returns a pool connected to
// it, for callers that aren't a Go test (such as the end-to-end server). The
// database is not dropped; it goes away with the container on Close.
func (e *Env) NewPool(ctx context.Context) (*pgxpool.Pool, error) {
	name, err := e.createDatabase(ctx)
	if err != nil {
		return nil, err
	}

	pool, err := server.NewPool(ctx, e.databaseURI(name))
	if err != nil {
		return nil, fmt.Errorf("connect to new database: %w", err)
	}

	return pool, nil
}

// createDatabase copies the migrated template into a new, randomly named
// database and returns its name.
func (e *Env) createDatabase(ctx context.Context) (string, error) {
	name := "test_" + strings.ToLower(rand.Text())

	_, err := e.admin.Exec(ctx, fmt.Sprintf(
		"CREATE DATABASE %s TEMPLATE %s",
		pgx.Identifier{name}.Sanitize(), pgx.Identifier{templateDatabase}.Sanitize(),
	))
	if err != nil {
		return "", fmt.Errorf("create test database: %w", err)
	}

	return name, nil
}

// NewServer creates a fresh database (see NewDB) and returns the real server
// handler for it, plus the pool for asserting on database state directly.
func (e *Env) NewServer(t testing.TB) (http.Handler, *pgxpool.Pool) {
	t.Helper()

	pool := e.NewDB(t)

	return server.New(pool, e.GameData, server.Options{}), pool
}

// NewClient creates a fresh database (see NewDB), registers a user, and
// returns a GraphQL client logged in as them, plus the pool for asserting on
// database state directly.
func (e *Env) NewClient(t testing.TB) (*client.Client, *pgxpool.Pool) {
	t.Helper()

	h, pool := e.NewServer(t)
	browser := NewBrowser(h)
	browser.Register(t, "player@example.com")

	return browser.Client, pool
}

func (e *Env) databaseURI(name string) string {
	u := *e.baseURI
	u.Path = "/" + name

	return u.String()
}

// TestPassword is the password Browser.Register gives every account.
const TestPassword = "correct horse battery staple"

// siteURL is where a Browser's cookies are scoped. The handler never sees
// it; it only keys the cookie jar.
var siteURL = &url.URL{Scheme: "http", Host: "localhost", Path: "/"}

// Browser sends GraphQL requests through a handler and keeps the cookies it
// sets, as a browser would, so it stays logged in across requests.
type Browser struct {
	// Client sends requests with the browser's cookies.
	Client *client.Client
	// Jar holds the cookies the server has set.
	Jar http.CookieJar
}

// NewBrowser returns a logged-out Browser for the handler.
func NewBrowser(h http.Handler) *Browser {
	jar, _ := cookiejar.New(nil) // never fails with nil options

	return &Browser{
		Client: client.New(&jarHandler{jar: jar, next: h}, client.Path("/graphql")),
		Jar:    jar,
	}
}

// Register creates an account through the API (display name "Player",
// password TestPassword), which logs the browser in as it.
func (b *Browser) Register(t testing.TB, email string) {
	t.Helper()

	var resp struct {
		Auth struct {
			Register struct{ ID string }
		}
	}
	err := b.Client.Post(
		`mutation ($input: RegisterInput!) { auth { register(input: $input) { id } } }`,
		&resp,
		client.Var("input", map[string]any{
			"displayName": "Player",
			"email":       email,
			"password":    TestPassword,
		}),
	)
	if err != nil {
		t.Fatalf("register %s: %v", email, err)
	}
}

// SessionCookie returns the browser's session cookie, or nil.
func (b *Browser) SessionCookie() *http.Cookie {
	for _, c := range b.Jar.Cookies(siteURL) {
		if c.Name == auth.CookieName {
			return c
		}
	}

	return nil
}

// jarHandler adds a cookie jar's cookies to each request and stores the
// cookies each response sets.
type jarHandler struct {
	jar  http.CookieJar
	next http.Handler
}

func (h *jarHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	for _, c := range h.jar.Cookies(siteURL) {
		r.AddCookie(c)
	}

	rec := httptest.NewRecorder()
	h.next.ServeHTTP(rec, r)

	resp := rec.Result()
	h.jar.SetCookies(siteURL, resp.Cookies())

	maps.Copy(w.Header(), resp.Header)
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(rec.Body.Bytes())
}
