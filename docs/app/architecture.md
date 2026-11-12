# Architecture

```
dwai-app (Next.js, :3000)  ──GraphQL (Apollo)──▶  dwai-api (Go/gqlgen, :5000)  ──pgx/sqlc──▶  PostgreSQL 18
                                                     │
                                                     └── embedded game data YAML (internal/data)
```

| Path | Stack | Agent guide |
| ---- | ----- | ----------- |
| `dwai-api/` | Go, gqlgen (schema-first GraphQL), sqlc + pgx, golang-migrate, testcontainers-go | [`dwai-api/AGENTS.md`](../../dwai-api/AGENTS.md) |
| `dwai-app/` | Next.js 16 (App Router), React 19, Apollo Client 4, GraphQL Codegen, Tailwind 4, Bun | [`dwai-app/AGENTS.md`](../../dwai-app/AGENTS.md) |
| `dwai-e2e/` | Playwright browser tests that drive the app against the real API (`make test-e2e`) | [`dwai-e2e/AGENTS.md`](../../dwai-e2e/AGENTS.md) |

## Data Flow

- **Game content** (classes, moves, items, tags, spells, monsters) is YAML embedded into the API binary and loaded into in-memory maps at startup. It's never stored in the database.
- **Player data** (characters, looks, items, choices) is in Postgres. Rows store only the **keys** of the game content they reference (`character_class_key`, `race_move_key`, item `key`), and resolvers join them with the YAML at query time.
- **The frontend** never computes rules on its own (one deliberate exception: it applies the −1 from debilities to the modifiers it shows, see `dwai-app/lib/debilities.ts`). It queries the API and generates TypeScript types from the running API's schema.

## Schema Changes Flow API → App

1. Edit `dwai-api/internal/graph/schema/*.graphqls`.
2. `go tool gqlgen generate` in `dwai-api/`, then implement the resolver stubs.
3. Restart the API.
4. `bun run codegen` in `dwai-app/` (needs the API running).

Database changes are similar: edit or add a migration and queries in `dwai-api/sql/`, then `sqlc generate`. The `add-graphql-field` and `add-db-migration` skills walk through both.

## Generated Code

Generated code is committed and never hand-edited: gqlgen output (`internal/graph/generated.go`, `internal/graph/model/models_gen.go`), sqlc output (`dwai-api/internal/db/`), and the frontend's `dwai-app/gql/`.

## Checks

`make check` (repo root) runs lint, typecheck, unit tests, and the API integration tests (Docker). Lefthook git hooks run formatting, lint, and typecheck on commit, and unit tests on push.
