# Dungeon World AI — End-to-End Test Guide

Playwright browser tests that drive the web app against the real API. Read the root [`AGENTS.md`](../AGENTS.md) first for the workflow and shared conventions. This package imports nothing from `dwai-app` or `dwai-api`: it only talks to them over HTTP, the way a user's browser does.

## Commands

From the repo root, `make test-e2e` installs dependencies and Chromium and runs everything. Or, from `dwai-e2e/` with Bun:

| Command                                | Does                                                        |
| -------------------------------------- | ----------------------------------------------------------- |
| `bun install`                          | Install dependencies                                        |
| `bunx playwright install chromium`     | Download the browser (once, and after upgrading Playwright) |
| `bun run test`                         | Run the suite (`bun test` would run the wrong runner)       |
| `bun run typecheck` / `bun run format` | Typecheck / format                                          |

Docker is required. The suite is deliberately not part of `make check` or the git hooks: it is slower, and needs Docker plus a browser download.

## How a Run Works

`playwright.config.ts` starts the whole stack, on its own ports so it can run beside your normal `go run ./cmd/server` (5000) and `bun dev` (3000):

- The API on `localhost:5100`, from `dwai-api/cmd/e2eserver` (build tag `e2e`). It starts a throwaway Postgres container, applies the migrations, and removes the container when it exits.
- The app's dev server on `localhost:3100`, pointed at that API. It builds into `dwai-app/.next-e2e` (Next locks its default build directory).

Every run starts from an empty database. Create what a test needs through the UI.

## Writing Tests

- Tests live in `tests/*.spec.ts`.
- Find elements the way a user would: `getByRole`, `getByLabel`, `getByText`. No CSS selectors and no `data-testid`. If something has no accessible name, fix the component in `dwai-app` (a `<label htmlFor>` or an `aria-label`) rather than working around it here.
- Assert on what the API computed (the sheet's HP, for example), not on rules the test re-derives.
- Tests that pick game content depend on the game data in `dwai-api/internal/data`; if a test fails after a data change, update the test to match.
