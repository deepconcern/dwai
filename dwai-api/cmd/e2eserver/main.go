//go:build e2e

// Command e2eserver serves the GraphQL API against a throwaway Postgres
// container, for the frontend's Playwright tests (see dwai-app/e2e). Unlike
// cmd/server it needs no .env file or DATABASE_URI, and it removes its
// database when it exits.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	server "github.com/deepconcern/dwai/dwai-api/internal"
	"github.com/deepconcern/dwai/dwai-api/internal/testutil"
)

const defaultAddr = "localhost:5100"

func main() {
	if err := run(); err != nil {
		slog.Error("e2e server failed", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	env, err := testutil.NewEnv(ctx)
	if err != nil {
		return fmt.Errorf("start test environment: %w", err)
	}
	defer func() {
		if err := env.Close(); err != nil {
			slog.Error("failed to stop postgres container", "error", err)
		}
	}()

	pool, err := env.NewPool(ctx)
	if err != nil {
		return err
	}
	defer pool.Close()

	addr := os.Getenv("E2E_ADDR")
	if addr == "" {
		addr = defaultAddr
	}

	srv := &http.Server{Addr: addr, Handler: server.New(pool, env.GameData)}

	go func() {
		<-ctx.Done()

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_ = srv.Shutdown(shutdownCtx)
	}()

	slog.Info("e2e server listening", "addr", addr)

	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	return nil
}
