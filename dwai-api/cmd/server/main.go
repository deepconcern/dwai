package main

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"strings"

	server "github.com/deepconcern/dwai/dwai-api/internal"
	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/migrate"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/joho/godotenv"
)

const defaultHost = "0.0.0.0"
const defaultPort = "5000"
const defaultAppOrigins = "http://localhost:3000"

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

// loadDotEnv loads environment variables from the given .env files (".env"
// if none). A missing file is fine: in a container the environment is set
// directly and there's no .env file.
func loadDotEnv(filenames ...string) error {
	if err := godotenv.Load(filenames...); err != nil && !errors.Is(err, fs.ErrNotExist) {
		return err
	}

	return nil
}

// fatal logs an error and exits.
func fatal(msg string, err error) {
	slog.Error(msg, "error", err)
	os.Exit(1)
}

func main() {
	// Load the environment
	if err := loadDotEnv(); err != nil {
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

	// Clear out expired sessions (they're also deleted when next presented)

	if n, err := db.New(pool).DeleteExpiredSessions(context.Background()); err != nil {
		fatal("failed to delete expired sessions", err)
	} else if n > 0 {
		slog.Info("deleted expired sessions", "count", n)
	}

	// COOKIE_SECURE=true marks the session cookie Secure, for serving over
	// HTTPS. It's off by default for local development over plain HTTP.
	secureCookie, _ := strconv.ParseBool(os.Getenv("COOKIE_SECURE"))

	// APP_ORIGINS lists the web app's origins, comma-separated, which may open
	// the chat's WebSocket.
	appOrigins := os.Getenv("APP_ORIGINS")
	if appOrigins == "" {
		appOrigins = defaultAppOrigins
	}

	handler := server.New(pool, gameData, server.Options{
		AllowedOrigins: strings.Split(appOrigins, ","),
		SecureCookie:   secureCookie,
	})

	// Run the server

	slog.Info("server started", "playground", fmt.Sprintf("http://%s:%s/playground", host, port))
	fatal("server stopped", http.ListenAndServe(host+":"+port, handler))
}
