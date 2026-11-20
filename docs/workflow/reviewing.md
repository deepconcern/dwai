# Reviewing Pull Requests in DWAI

Wyatt merges every PR himself. He may ask Copilot or another agent to review one first. Reviewers follow the shared [`review-pr`](../../.claude/skills/review-pr/SKILL.md) skill (check the PR against its spec issue, tests, generated code, security; separate must-fix from suggestions; never approve). This page adds the checks specific to DWAI. An authoring agent runs both before asking for review.

## DWAI Checks

1. **Game rules are right.** Anything that models Dungeon World matches [docs/game](../game/README.md): roll bands (10+ / 7–9 / 6−), HP = class base + CON **score**, load = class base + STR modifier, the level-up threshold (level + 7), cantrips and rotes not counting toward preparation, and so on.
2. **Rules live in the API.** Derived values and validation are computed in `dwai-api/internal/models`, not reimplemented in the frontend. The frontend may validate or compute display helpers for UX, but the API must enforce what it enforces.
3. **The honor system holds.** The app suggests and the player decides, except for the few strict rules in [architecture.md](../app/architecture.md#the-honor-system). A one-way action is called out in the spec and confirmed in the UI when it loses data.
4. **Generated code was regenerated.** A `.graphqls` change comes with regenerated gqlgen output; a SQL change comes with regenerated sqlc output (`dwai-api/internal/db/`); `dwai-app/gql/` matches the schema.
5. **Migrations are safe.** A migration already merged to `main` was not edited; new schema changes are in a new numbered pair with a working `.down.sql`.
6. **Tests are in the right place.** Unit tests for pure rules logic, integration tests for GraphQL behavior, `bun test` for frontend logic, following [Testing](../../AGENTS.md#testing).
7. **Conventions are followed.** See the root and per-app `AGENTS.md` (for example: alphabetized lists and props, no default exports in the app, external `_test` packages in the API).
8. **AI features treat chat as untrusted.** Chat and other user text that reaches a model is untrusted input.
