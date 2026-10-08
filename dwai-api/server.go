package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"runtime/debug"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/deepconcern/dwai/dwai-api/graph"
	"github.com/deepconcern/dwai/dwai-api/internal/migrate"
	"github.com/deepconcern/dwai/dwai-api/models"
	pgxuuid "github.com/jackc/pgx-gofrs-uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

const defaultHost = "0.0.0.0"
const defaultPort = "5000"

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// LoggingMiddleware logs one line per request once it completes. GraphQL
// errors are returned with a 200 status, so they're logged by the server's
// error presenter instead.
func LoggingMiddleware(next http.Handler) http.Handler {
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

// newLogger builds the default logger, using LOG_LEVEL (debug, info, warn,
// error) if set.
func newLogger() *slog.Logger {
	var level slog.Level
	if s := os.Getenv("LOG_LEVEL"); s != "" {
		if err := level.UnmarshalText([]byte(s)); err != nil {
			slog.Warn("invalid LOG_LEVEL, defaulting to info", "value", s)
		}
	}

	return slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: level}))
}

// fatal logs an error and exits.
func fatal(msg string, err error) {
	slog.Error(msg, "error", err)
	os.Exit(1)
}

func main() {
	// Load the environment
	if err := godotenv.Load(); err != nil {
		fatal("failed to load .env file", err)
	}

	slog.SetDefault(newLogger())

	// Get configuration

	host := os.Getenv("HOST")
	if host == "" {
		host = defaultHost
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Apply database migrations

	database_url := os.Getenv("DATABASE_URL")

	slog.Info("applying database migrations")
	if err := migrate.Up(database_url); err != nil {
		fatal("failed to apply database migrations", err)
	}
	slog.Info("database migrations up to date")

	// Init database connection (and register UUID type)

	dbconfig, err := pgxpool.ParseConfig(database_url)
	if err != nil {
		fatal("failed to parse database config", err)
	}

	dbconfig.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		pgxuuid.Register(conn.TypeMap())
		return nil
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), dbconfig)
	if err != nil {
		fatal("failed to connect to database", err)
	}
	defer pool.Close()

	// Load game data

	characterClasses, err := models.LoadCharacterClasses()
	if err != nil {
		fatal("failed to load character classes", err)
	}

	itemTemplates, err := models.LoadItemTemplates()
	if err != nil {
		fatal("failed to load item templates", err)
	}

	playerMoves, err := models.LoadPlayerMoves()
	if err != nil {
		fatal("failed to load player moves", err)
	}

	tagDefinitions, err := models.LoadTags()
	if err != nil {
		fatal("failed to load tags", err)
	}

	// Initialize the GraphQL server
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		CharacterClasses: characterClasses,
		DbPool:           pool,
		ItemTemplates:    itemTemplates,
		Loaders:          models.NewLoaders(pool),
		LookTypes:        models.NewLookTypeMap(characterClasses),
		PlayerMoves:      playerMoves,
		TagDefinitions:   tagDefinitions,
	}}))

	// Resolver errors are sent to the client without being logged, so log
	// them here along with the field that failed.
	srv.SetErrorPresenter(func(ctx context.Context, err error) *gqlerror.Error {
		presented := graphql.DefaultErrorPresenter(ctx, err)
		slog.ErrorContext(ctx, "graphql error", "path", presented.Path.String(), "error", err)
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
	mux.Handle("/graphql", srv)

	handler := LoggingMiddleware(cors.Default().Handler(mux))

	// Run the server

	slog.Info("server started", "playground", fmt.Sprintf("http://%s:%s/playground", host, port))
	fatal("server stopped", http.ListenAndServe(host+":"+port, handler))
}
