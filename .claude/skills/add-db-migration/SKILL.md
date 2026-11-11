---
name: add-db-migration
description: Use when changing the dwai PostgreSQL schema or adding sqlc queries, to decide whether to edit or add a migration and regenerate code.
---

# Change the Database Schema

Details are in [`dwai-api/AGENTS.md`](../../../dwai-api/AGENTS.md#database-migrations).

## 1. Edit or Add?

Run `git log main.. -- sql/migrations` in `dwai-api/`:

- **The newest migration exists only on this branch:** edit that `NNNN_*.up.sql` / `.down.sql` pair in place.
- **It's already on `main`:** it's immutable. Add a new pair numbered one higher, `NNNN_description.up.sql` and `NNNN_description.down.sql`.

## 2. Write It

- Postgres 18. New primary keys follow the existing tables (`UUID PRIMARY KEY DEFAULT uuidv7 ()` for top-level entities).
- Child rows reference their owner with `ON DELETE CASCADE`, as `looks` and `items` do.
- Columns are alphabetized within a table, as in the existing migrations.
- Store game content by **key** (for example `character_class_key`), never by copying YAML content into the database.
- Write a `.down.sql` that fully reverses the `.up.sql`.

## 3. Queries and Code

1. Add or change queries in `sql/queries/*.sql`.
2. `sqlc generate`. Never edit `internal/db/*.go`.
3. Migrations apply automatically when the server starts and when integration tests build their template database.

## 4. Test

Add or update integration tests that exercise the new columns through GraphQL, then run `make check`.
