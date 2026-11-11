---
name: add-graphql-field
description: Use when adding or changing a GraphQL type, field, query, or mutation in dwai, end to end from the Go schema to the Next.js frontend.
---

# Add a GraphQL Field End to End

Schema changes flow **API → app**. Details are in [`dwai-api/AGENTS.md`](../../../dwai-api/AGENTS.md) and [`dwai-app/AGENTS.md`](../../../dwai-app/AGENTS.md).

## API (`dwai-api/`)

1. **Schema.** Edit the right file in `internal/graph/schema/*.graphqls`. Give every type and field a doc string, as the existing schema does, and keep fields alphabetized. Queries and mutations are namespaced (`characters: CharacterQuery!`, `characters: CharacterMutation!`), so add to the namespace type.
2. **Generate.** `go tool gqlgen generate`. Never edit `generated.go` or `model/models_gen.go`.
3. **Rules logic.** If the field is derived from game rules (armor, load, max HP, modifiers), implement it in `internal/models` as a pure function and unit test it there (external `models_test` package).
4. **Resolver.** Implement the generated stub in `internal/graph/*.resolvers.go`. Keep it thin: load data, call `models`, persist. Validate mutation input in the API.
5. **Database.** If it needs new columns or queries, use [`add-db-migration`](../add-db-migration/SKILL.md).
6. **Integration test.** Add a test in `internal/graph` (`//go:build integration`, `package graph_test`) that sends the real query or mutation.
7. **Restart the API** so the app can see the new schema.

## App (`dwai-app/`)

1. Write or update the `graphql(...)` document (or a shared fragment in `fragments/`).
2. `bun run codegen` with the API running. Never edit `gql/`.
3. Use the generated types. Read masked fragments with `unmaskFragment`.
4. Display what the API computes; don't reimplement rules.
5. Add `bun test` tests for any non-trivial frontend logic.

## Finish

`make check` from the repo root.
