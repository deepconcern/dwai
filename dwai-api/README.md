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

Run database migrations:

```sh
go run ./cmd/migrate COMMAND
```

Commands:

- `up` - Applies migrations
- `down` - Undoes migrations
- `redo` - Undoes migrations, and then reapplies

## Run

```sh
go run .
```

The GraphQL playground is available at `http://localhost:5000/playground`.
