# Dungeon World AI — API

GraphQL API for the Dungeon World AI app, built with Go and gqlgen, backed by PostgreSQL.

## Environment

Will also read from `.env` files.

```env
DATABASE_URL=postgres://user:password@localhost:5432/dwai
HOST=0.0.0.0   # optional, defaults to 0.0.0.0
PORT=5000      # optional, defaults to 5000
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
and point it at `sql/migrations` and `$DATABASE_URL`.

## Run

```sh
go run .
```

The GraphQL playground is available at `http://localhost:5000/playground`.
