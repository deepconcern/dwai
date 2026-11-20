# Architecture

```
browser ──/graphql──▶ dwai-app (Next.js, :3000) ──rewrite / server components──▶ dwai-api (Go/gqlgen, :5000) ──pgx/sqlc──▶ PostgreSQL 18
                                                     │
                                                     └── embedded game data YAML (internal/data)
```

| Path | Stack | Agent guide |
| ---- | ----- | ----------- |
| `dwai-api/` | Go, gqlgen (schema-first GraphQL), sqlc + pgx, golang-migrate, testcontainers-go | [`dwai-api/AGENTS.md`](../../dwai-api/AGENTS.md) |
| `dwai-app/` | Next.js 16 (App Router), React 19, Apollo Client 4, GraphQL Codegen, Tailwind 4, Bun | [`dwai-app/AGENTS.md`](../../dwai-app/AGENTS.md) |
| `dwai-e2e/` | Playwright browser tests that drive the app against the real API (`make test-e2e`) | [`dwai-e2e/AGENTS.md`](../../dwai-e2e/AGENTS.md) |

## Data Flow

- **Game content** (classes, moves, items, tags, spells, monsters) is YAML embedded into the API binary and loaded into in-memory maps at startup. It's never stored in the database, with one deliberate exception: a monster added to play stores a snapshot of its stat block, so the GM's game isn't changed by later edits.
- **Player data** (characters, looks, items, choices) is in Postgres. Rows store only the **keys** of the game content they reference (`character_class_key`, `race_move_key`, item `key`), and resolvers join them with the YAML at query time.
- **The frontend** queries the API and generates TypeScript types from the running API's schema. It shows what the API computes, and may compute rules as display helpers (for example, applying debilities to the modifiers it shows, in `dwai-app/lib/debilities.ts`), but it generally doesn't enforce them. Like a pen-and-paper sheet, where a player can technically write whatever they want, there's a bit of an honor system, and it keeps mistakes easy to fix.

## The Honor System

The app is a virtual sheet of paper, not a referee. The API keeps the data consistent (a class only gets its own spells, a bond's target is in the same campaign) and records what happened, but it trusts the players' judgment:

- **Rolls**: the player chooses what's added (stat, bonds, the debility, which forward/ongoing bonuses apply) and can enter the total of physical dice instead of letting the app roll. The chat shows the full breakdown and whether the dice were rolled by the app (🎲) or entered (✍️).
- **XP on a miss** is a button, not automatic.
- **Activity log**: sheet changes made inside a campaign (XP, HP, debilities, bonds, bonuses, level up, End of Session) post an activity line to the table chat, such as "Ana marked 1 XP". Logging is best effort and never fails the action.
- **Strict rules** that stay enforced: the stat array, prepared-spell limits, and a reason for each End of Session item.

Most actions are reversible (mark and unmark XP, damage and heal, add and remove a bonus). These are **one-way**, called out in the UI:

| Action | Why it's one-way | How to recover |
| ------ | ---------------- | -------------- |
| Level up | Undoing an advance is extra work (planned for later) | — |
| Leave a campaign / remove a character | Deletes bonds by and about the character | Confirmation; rejoin and rewrite bonds |
| End of Session (the GM's session and each report) | It's a record of what happened | Adjust XP, re-create bonds by hand |
| Delete a campaign | Deletes its bonds, sessions, and chat | Confirmation |
| Delete a bond, remove an item | Small | Add it again |
| Prepare spells | Small | Prepare again |
| Remove a monster from play | Its HP is lost | Confirmation; add it again |
| Delete a custom monster | Small; copies in play keep their stat block | Confirmation; write it again |

## Table Chat

Messages, rolls, and activity lines are rows in `campaign_messages`. An `AFTER INSERT` trigger runs `pg_notify('campaign_messages', id)`; `internal/realtime.Broker` listens on one dedicated connection while anyone is subscribed and fans each new message out to the campaign's subscribers. The `campaignMessages` subscription (gqlgen over WebSocket, `graphql-transport-ws`) re-checks membership and visibility (whispers, GM-only rolls) for each message. The browser opens the WebSocket at the app's own `/graphql`, which Next.js rewrites to the API with the session cookie; `NEXT_PUBLIC_API_WS_URL` overrides that URL, and the API accepts upgrades from the origins in `APP_ORIGINS` (default `http://localhost:3000`) or its own host. After a reconnect, the chat refetches what it missed.

## Accounts and Sessions

- The browser only talks to the app's origin. `next.config.ts` rewrites `/graphql` to the API (`API_URI`, server-only), so the API's `dwai_session` cookie (HttpOnly, SameSite=Lax, `Secure` when `COOKIE_SECURE=true`) is first-party and no CORS is involved.
- Server components query the API directly and forward the incoming request's cookies (`lib/apollo-client.ts`), so they run as the logged-in user.
- `dwai-app/proxy.ts` redirects visitors with no session cookie to `/login?next=…`. That's only an optimistic check: pages call `requireUser` (`lib/session.ts`), which asks the API, to catch a cookie it no longer accepts. `next` is checked with `lib/safeNext.ts`, so it can't redirect off the site.
- The API is the real check. `internal/auth` loads the session for each request; every character, item, and spell resolver requires a user and checks ownership, returning `UNAUTHENTICATED` when logged out and "not found" for another user's character. Game content stays public, except the monster compendium, which needs a logged-in user.

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
