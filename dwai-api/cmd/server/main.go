package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	server "github.com/deepconcern/dwai/dwai-api/internal"
	"github.com/deepconcern/dwai/dwai-api/internal/migrate"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/joho/godotenv"
)

const defaultHost = "0.0.0.0"
const defaultPort = "5000"

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

	database_uri := os.Getenv("DATABASE_URI")

	slog.Info("applying database migrations")
	if err := migrate.Up(database_uri); err != nil {
		fatal("failed to apply database migrations", err)
	}
	slog.Info("database migrations up to date")

	// Init database connection (and register UUID type)

	pool, err := server.NewPool(context.Background(), database_uri)
	if err != nil {
		fatal("failed to initialize db pool", err)
	}
	defer pool.Close()

	// Load game data

	gameData, err := models.LoadGameData()
	if err != nil {
		fatal("failed to load game data", err)
	}

	handler := server.New(pool, gameData)

	// Run the server

	slog.Info("server started", "playground", fmt.Sprintf("http://%s:%s/playground", host, port))
	fatal("server stopped", http.ListenAndServe(host+":"+port, handler))
}
