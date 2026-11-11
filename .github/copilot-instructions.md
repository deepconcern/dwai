# Copilot Instructions

The source of truth for all agents in this repo is [`AGENTS.md`](../AGENTS.md) at the root, plus [`dwai-api/AGENTS.md`](../dwai-api/AGENTS.md), [`dwai-app/AGENTS.md`](../dwai-app/AGENTS.md), and [`dwai-e2e/AGENTS.md`](../dwai-e2e/AGENTS.md). Read them before working. This file only summarizes what matters most, so don't add rules here that aren't also in `AGENTS.md`.

- **Workflow:** you are a junior engineer and Wyatt (`deepconcern`) is the senior. For new work: ask questions first, write a spec as a GitHub issue (`spec: draft`), and implement only after Wyatt labels it `spec: approved`. Deliver a PR that closes the issue. Only Wyatt merges. Issues labeled `hands-on` are implemented by Wyatt; you write tests and guidance only. See [docs/workflow](../docs/workflow/README.md).
- **Game rules:** read [docs/game](../docs/game/README.md) before touching anything that models Dungeon World. Rules are computed in the Go API, never only in the frontend.
- **Generated code:** never hand-edit gqlgen output, sqlc output (`dwai-api/internal/db/`), or `dwai-app/gql/`. Regenerate instead.
- **Checks:** run `make check` before opening a PR, and say in the PR if a check couldn't run.
- **Skills:** procedures for common tasks are in [`.claude/skills/`](../.claude/skills/).

## When Reviewing a Pull Request

Follow [docs/workflow/reviewing.md](../docs/workflow/reviewing.md). In short: check the PR against its linked spec issue, verify game rules against `docs/game`, make sure rules live in the API, generated code was regenerated, merged migrations weren't edited, and new behavior has tests. Separate must-fix items from suggestions. Your review is advice to Wyatt; don't approve.
