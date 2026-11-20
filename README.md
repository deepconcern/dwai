# Dungeon World AI

A "D&D Beyond" for [Dungeon World](https://www.dungeon-world.com/): character sheets, campaigns, GM tools, and table chat, and later a playground for AI players and AI Game Masters.

## Stack

- FE: Next.js, TypeScript (`dwai-app/`)
- BE: Go, GraphQL, PostgreSQL (`dwai-api/`)

## Where to Start

- [`ROADMAP.md`](ROADMAP.md): milestones and current status
- [`docs/`](docs/README.md): game rules, app architecture and domain, and the PR review checklist
- [`.agent-workflows/`](.agent-workflows/README.md): the development workflow for AI agents, installed from a pinned version of [agent-workflows](https://github.com/deepconcern/agent-workflows)
- [`AGENTS.md`](AGENTS.md): the guide for AI agents (Claude Code, Copilot, and others), which also covers local setup and commands

## Run with Docker

`docker compose up --build` builds both images and runs Postgres, the API, and the web app. Open `http://localhost:3000`. The API is also published on `http://localhost:5000`, and `docker compose down -v` removes the database volume.

Each app has a Dockerfile you can build on its own:

| Image | Build | Listens on | Runs as |
| ----- | ----- | ---------- | ------- |
| API | `docker build -t dwai-api dwai-api` | 5000 | `nonroot` (distroless static) |
| App | `docker build -t dwai-app dwai-app` | 3000 | `bun` (Next.js standalone server on Bun) |

Both take their configuration from environment variables:

| Image | Variable | Purpose |
| ----- | -------- | ------- |
| API | `APP_ORIGINS` | The web app's origins, comma-separated, allowed to open the chat WebSocket (default `http://localhost:3000`) |
| API | `COOKIE_SECURE` | `true` marks the session cookie Secure; set it when browsers reach the app over HTTPS |
| API | `DATABASE_URI` | PostgreSQL 18+ connection string (required) |
| API | `HOST`, `PORT` | Listen address (defaults `0.0.0.0`, `5000`) |
| API | `LOG_LEVEL` | `debug`, `info`, `warn`, or `error` |
| App | `API_URI` | The API's address for server-side queries (default `http://dwai-api:5000`) |

The app's `/graphql` rewrite, which carries the browser's queries and the chat WebSocket to the API, is fixed when the image is built. Pass `--build-arg API_URI=...` if the API won't be reachable at `http://dwai-api:5000`, the service name in `compose.yaml`. A reverse proxy or Kubernetes Ingress can instead send `/graphql` straight to the API. The API image also takes an `API_VERSION` build argument, reported by the `apiVersion` query.

### Published images

The [Images workflow](.github/workflows/images.yml) builds both images on every pull request. Pushes to `main` publish them to GitHub Container Registry as `ghcr.io/deepconcern/dwai-api` and `ghcr.io/deepconcern/dwai-app`, tagged `sha-<short commit sha>`. A `v0.3.0` tag also publishes `0.3.0`. There's no `latest` tag, so deploy a specific one.
