# Stack: Go + GraphQL (gqlgen, sqlc, PostgreSQL)

Optional conventions for a Go GraphQL API built with gqlgen and sqlc. Link this from the project's `AGENTS.md` to adopt it.

## Code generation

- Generated code (gqlgen output, sqlc output) is committed and never hand-edited. Change the `.graphqls` schema or the SQL, then regenerate (`go tool gqlgen generate`, `sqlc generate`).
- Schema changes flow server to client: change the schema, regenerate the server, restart it, then run the client's codegen against it.
- Keep resolvers thin. Put rules and validation in a plain Go package that is unit tested without a database.

## Migrations

- A migration still unmerged on your branch can be edited in place while the feature is in progress.
- A migration already merged to the default branch is immutable: add a new numbered migration, even for a small change, with a working down migration. Editing a merged one desyncs every database that already applied it.

## Testing

- Use external test packages (`package <pkg>_test`) so tests call the package like any other caller. Expose an unexported function in `export_test.go` only when a direct test is worth it.
- Put shared fixtures in a `<pkg>test` subpackage (like `net/http/httptest`), since `_test.go` files can't be imported.
- Write table-driven tests with `t.Run` and `t.Parallel()` when several inputs share one behavior, compared with `go-cmp`.
- Test GraphQL behavior with integration tests that send real requests through the server handler against a real PostgreSQL, for example with testcontainers-go and a migrated template database copied per test so tests run in parallel. Keep them behind a build tag (such as `integration`) so unit tests run without Docker.
