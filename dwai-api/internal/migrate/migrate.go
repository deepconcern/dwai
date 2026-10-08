// Package migrate applies the SQL migrations embedded in sql/migrations to
// the database via golang-migrate. Safe to call on every server startup:
// golang-migrate tracks the applied version in a schema_migrations table
// (created automatically on first run) and only runs migrations after that
// version — already up to date is a no-op, and concurrent instances
// starting at once serialize via a Postgres advisory lock rather than
// racing each other.
package migrate

import (
	"errors"
	"fmt"
	"net/url"

	"github.com/deepconcern/dwai/dwai-api/sql/migrations"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

// Up applies any pending migrations to the database at databaseURL (a
// "postgres://..." connection string, e.g. os.Getenv("DATABASE_URL")).
func Up(databaseURL string) (err error) {
	pgx5URL, err := toPgx5URL(databaseURL)
	if err != nil {
		return fmt.Errorf("parse database url: %w", err)
	}

	src, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return fmt.Errorf("load embedded migrations: %w", err)
	}

	m, err := migrate.NewWithSourceInstance("iofs", src, pgx5URL)
	if err != nil {
		return fmt.Errorf("init migrator: %w", err)
	}
	defer func() {
		srcErr, dbErr := m.Close()
		err = errors.Join(err, srcErr, dbErr)
	}()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("apply migrations: %w", err)
	}

	return nil
}

// toPgx5URL rewrites a postgres:// connection string to the pgx5:// scheme
// golang-migrate's pgx v5 driver registers itself under.
func toPgx5URL(databaseURL string) (string, error) {
	u, err := url.Parse(databaseURL)
	if err != nil {
		return "", err
	}
	u.Scheme = "pgx5"
	return u.String(), nil
}
