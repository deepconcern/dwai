package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/deepconcern/dwai/dwai-api/graph"
	"github.com/deepconcern/dwai/dwai-api/models"
	pgxuuid "github.com/jackc/pgx-gofrs-uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
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

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rw := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		slog.Info(fmt.Sprintf("%s %s", r.Method, r.URL.Path))

		next.ServeHTTP(rw, r)

		if rw.statusCode >= 400 {
			slog.Error("ERROR", "status", rw.statusCode, "method", r.Method, "path", r.URL.Path)
		}

	})
}

func main() {
	// Load the environment
	if err := godotenv.Load(); err != nil {
		slog.Error("Error loading .env file", "error", err)
		os.Exit(1)
	}

	// Get configuration

	host := os.Getenv("HOST")
	if host == "" {
		host = defaultHost
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Init database connection (and register UUID type)

	database_url := os.Getenv("DATABASE_URL")

	dbconfig, err := pgxpool.ParseConfig(database_url)
	if err != nil {
		slog.Error("Error parsing database config", "error", err)
		os.Exit(1)
	}

	dbconfig.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		pgxuuid.Register(conn.TypeMap())
		return nil
	}

	pool, err := pgxpool.New(context.Background(), database_url)
	if err != nil {

		slog.Error("Error connecting to database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	// Initialize the GraphQL server
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		CharacterClasses: models.LoadCharacterClasses(),
		DbPool:           pool,
		Equipment:        models.LoadEquipment(),
		Loaders:          models.NewLoaders(pool),
		LookTypes:        models.LoadLookTypes(),
		PlayerMoves:      models.LoadPlayerMoves(),
		TagDefinitions:   models.LoadTags(),
	}}))

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
		fmt.Fprint(w, "OK")
	})
	mux.Handle("/playground", playground.Handler("GraphQL playground", "/graphql"))
	mux.Handle("/graphql", srv)

	handler := LoggingMiddleware(cors.Default().Handler(mux))

	// Run the server

	slog.Info(fmt.Sprintf("connect to http://%s:%s/ for GraphQL playground", host, port))
	slog.Error("Unexpected error", "error", http.ListenAndServe(host+":"+port, handler))
}
