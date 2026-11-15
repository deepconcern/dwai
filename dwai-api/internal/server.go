package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/deepconcern/dwai/dwai-api/internal/graph"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	pgxuuid "github.com/jackc/pgx-gofrs-uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// loggingMiddleware logs one line per request once it completes. GraphQL
// errors are returned with a 200 status, so they're logged by the server's
// error presenter instead.
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rw := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}
		start := time.Now()

		next.ServeHTTP(rw, r)

		level := slog.LevelInfo
		switch {
		case rw.statusCode >= 500:
			level = slog.LevelError
		case rw.statusCode >= 400:
			level = slog.LevelWarn
		}

		slog.Log(r.Context(), level, "request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rw.statusCode,
			"duration", time.Since(start),
		)
	})
}

func New(pool *pgxpool.Pool, gameData *models.GameData) http.Handler {
	// Initialize the GraphQL server
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		CharacterClasses: gameData.CharacterClassMap,
		DbPool:           pool,
		ItemTemplates:    gameData.ItemTemplateMap,
		LookTypes:        models.NewLookTypeMap(gameData.CharacterClassMap),
		PlayerMoves:      gameData.MoveMap,
		Spells:           gameData.SpellMap,
		TagDefinitions:   gameData.TagDefinitionMap,
	}}))

	// Resolver errors are sent to the client without being logged, so log
	// them here along with the field that failed. Invalid input is the
	// client's problem, not the server's, so it's logged at a lower level.
	srv.SetErrorPresenter(func(ctx context.Context, err error) *gqlerror.Error {
		presented := graphql.DefaultErrorPresenter(ctx, err)

		level := slog.LevelError
		if presented.Extensions["code"] == models.ValidationErrorCode {
			level = slog.LevelWarn
		}

		slog.Log(ctx, level, "graphql error", "path", presented.Path.String(), "error", err)
		return presented
	})
	srv.SetRecoverFunc(func(ctx context.Context, p any) error {
		slog.ErrorContext(ctx, "panic in resolver", "panic", p, "stack", string(debug.Stack()))
		return gqlerror.Errorf("internal server error")
	})

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	// Setup routes

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		_, err := fmt.Fprint(w, "OK")

		if err != nil {
			slog.Error("failed writing response", "error", err)
		}
	})
	mux.Handle("/playground", playground.Handler("GraphQL playground", "/graphql"))
	mux.Handle("/graphql", models.LoadersMiddleware(pool, srv))

	return loggingMiddleware(cors.Default().Handler(mux))

}

func NewPool(ctx context.Context, database_uri string) (*pgxpool.Pool, error) {
	dbconfig, err := pgxpool.ParseConfig(database_uri)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database config: %w", err)
	}

	dbconfig.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		pgxuuid.Register(conn.TypeMap())
		return nil
	}

	pool, err := pgxpool.NewWithConfig(ctx, dbconfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return pool, nil
}
