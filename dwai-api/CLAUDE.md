# Dungeon World AI (API)

Go GraphQL API (gqlgen) backed by PostgreSQL (sqlc + pgx). Game rules and concepts are described in the root `CLAUDE.md`; this file covers how they're implemented here.

## Code Generation

Generated code is committed. Never hand-edit it — change the source and regenerate.

| Source                                          | Generated                                                                           | Command                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| `internal/graph/schema/*.graphqls`              | `internal/graph/generated.go`, `internal/graph/model/models_gen.go`, resolver stubs | `go tool gqlgen generate` |
| `sql/migrations/*.up.sql` + `sql/queries/*.sql` | `db/*.go`                                                                           | `sqlc generate`           |

After a schema change, restart the API so `dwai-app` can regenerate its types from it.

## Game Data Files

YAML files in `internal/data/` are loaded at startup; they are not stored in the database. Characters store only the keys they reference (class, race move, item template, etc.).

| File(s)                                   | Loads                              | GraphQL type                   |
| ----------------------------------------- | ---------------------------------- | ------------------------------ |
| `internal/data/classes/*.yaml`            | Character classes with all moves   | `CharacterClass`, `Move`       |
| `internal/data/player_moves.yaml`         | Shared player moves                | `Move` (type: `"basic"` / `"special"`) |
| `internal/data/item_templates.yaml`       | Items, weapons, armor, magic items | `ItemTemplate` — referenced by key from `StartingGear`'s `ItemOption`s and from a character's owned `Item`s |
| `internal/data/tags.yaml`                 | Item tag definitions               | `Tag`                          |
| `internal/data/spells/wizard_spells.yaml` | Wizard spell list                  | _(future `Spell` type)_        |
| `internal/data/spells/cleric_spells.yaml` | Cleric spell list                  | _(future `Spell` type)_        |
| `internal/data/monsters/*.yaml`           | Monster compendium                 | _(reference only)_             |
| `internal/data/gm_moves.yaml`             | GM principles and move list        | _(reference only)_             |
| `internal/data/fronts.yaml`               | Campaign front structure           | _(reference only)_             |
| `internal/data/hirelings.yaml`            | Hireling rules and types           | _(reference only)_             |

The `key` field on all entities uses `snake_case` derived from the name (e.g., `hack_and_slash`, `fighter`).

### Class YAML

| YAML field            | GraphQL field   | Notes                                         |
| --------------------- | --------------- | --------------------------------------------- |
| `hp_base`             | `hpBase`        | Integer added to CON **score** (not modifier) |
| `damage_die`          | `damageDie`     | Integer — the die face (4, 6, 8, 10)          |
| `race_moves`          | `raceMoves`     | One chosen at character creation              |
| `starting_moves`      | `startingMoves` | All characters of this class begin with these |
| `advanced_moves_2_5`  | —               | Moves available at levels 2–5                 |
| `advanced_moves_6_10` | —               | Moves available at levels 6–10                |

An advanced move's `requirement` field is either `Requires: <move>` or `Replaces: <move>`, exposed as `requiresKey` / `replacesKey`. `alignments` entries are ethos descriptions (`AlignmentTemplate`), not `Move`s.

### Move YAML

| YAML field    | GraphQL field | Meaning                                                  |
| ------------- | ------------- | -------------------------------------------------------- |
| `trigger`     | `trigger`     | The fictional condition that activates the move          |
| `roll`        | `roll`        | Which stat to add (or "nothing" for Last Breath)         |
| `on_10`       | `on10`        | Full success outcome                                     |
| `on_7_9`      | `on7to9`      | Partial success; player often picks from `options`       |
| `on_miss`     | `onMiss`      | Explicit miss effect, if any (otherwise GM makes a move) |
| `options`     | `options`     | List players choose from on partial or full success      |
| `description` | `description` | Used for moves with no roll (procedural rules)           |

## Database Migrations

Migrations live in `sql/migrations` as `NNNN_description.up.sql` / `.down.sql` pairs, applied automatically on server startup via `golang-migrate` (see `internal/migrate`). It tracks applied versions in a `schema_migrations` table, keyed by filename.

- **Migration still unmerged (in progress on a branch)**: edit the current `NNNN_*.up.sql`/`.down.sql` pair in place rather than adding a new numbered pair for every incremental change requested during the same feature.
- **Migration already merged to `main`**: treat it as immutable. Add a new sequentially-numbered migration for further schema changes, even small ones — editing an already-merged migration desyncs any database that already applied it from what the file now says.

When in doubt about which bucket a migration falls into, check whether it's only present on the current branch (`git log main.. -- sql/migrations`) or already on `main`.

## Testing

- **Test the public API from an external test package.** Test files declare `package <pkg>_test` (e.g. `package models_test`) in the same directory as the code, and import the package like any other caller. Don't write `package <pkg>` tests: they couple tests to internals, and they cause import cycles with shared fixture packages.
- **Unexported code**: prefer testing it through the exported function that uses it. When a direct test is worth it, expose it in the package's `export_test.go` (e.g. `var MergeIdenticalItems = mergeIdenticalItems`); that file is `package <pkg>` and only compiled during tests.
- **Shared fixtures** live in a `<pkg>test` subpackage (like `net/http/httptest`), e.g. `internal/models/modelstest`, so both unit and integration tests can use them. `_test.go` files can't be imported from other packages.
- **Integration tests** live in `internal/graph` (`package graph_test`) behind the `//go:build integration` tag, and send real GraphQL requests through the server handler. `internal/testutil` starts one Postgres container per test package (testcontainers-go, needs Docker) and gives each test its own copy of a migrated template database, so tests can run in parallel. Run them with `go test -tags integration ./internal/graph/`.
