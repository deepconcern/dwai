# Dungeon World AI — API

GraphQL API for the Dungeon World AI app, built with Go and gqlgen, backed by PostgreSQL.

## Environment

Will also read from `.env` files.

```env
DATABASE_URI=postgres://user:password@localhost:5432/dwai
HOST=0.0.0.0   # optional, defaults to 0.0.0.0
PORT=5000      # optional, defaults to 5000
LOG_LEVEL=info # optional: debug, info, warn, or error
```

## Setup

Database migrations live in `sql/migrations` and are applied automatically
on server startup (via [golang-migrate](https://github.com/golang-migrate/migrate),
embedded into the binary — no separate migration step needed). It's safe to
start the server against an already-up-to-date database (no-op) or run
multiple instances at once (serialized via a Postgres advisory lock).

To add a migration, create a new `NNNN_description.up.sql` /
`NNNN_description.down.sql` pair in `sql/migrations`, using the next
sequential number. While a migration is still in progress on a branch (not
yet merged/deployed), edit its files in place instead of adding a new pair.
Once it's merged to `main`, treat it as immutable and add a new migration
for further changes — golang-migrate tracks applied versions in a
`schema_migrations` table, so editing a migration after it's been applied
anywhere will desync that database from the migration files.

For manual rollback during local development, install the
[golang-migrate CLI](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate)
and point it at `sql/migrations` and `$DATABASE_URI`.

## Run

```sh
go run ./cmd/server
```

The GraphQL playground is available at `http://localhost:5000/playground`.

## Test

### Unit tests

```sh
go test ./...
```

These need no database or Docker.

### Integration tests

The integration tests in `internal/graph` send real GraphQL requests through
the server against a real PostgreSQL. They're behind the `integration` build
tag, so `go test ./...` skips them.

They need [Docker](https://docs.docker.com/engine/install/) running, and
your user able to use it without `sudo` (on Linux, add yourself to the
`docker` group and log out and back in). No database setup or
`DATABASE_URI` is needed: the tests start a throwaway `postgres:18-alpine`
container with [testcontainers-go](https://golang.testcontainers.org/) and
remove it when they finish.

```sh
go test -tags integration ./internal/graph/

# A single test, with output
go test -tags integration -v -run TestCreateCharacter ./internal/graph/
```

From the repo root, `make test-integration` runs them too, and `make check`
includes them. The first run downloads the Postgres image, so it takes longer.

Each test gets its own fresh database copied from a migrated template, so
tests can run in parallel without seeing each other's data. If you use gopls,
add `-tags=integration` to its `buildFlags` so your editor analyzes these
files.
