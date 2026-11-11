# Reviewing Pull Requests

Wyatt merges every PR himself. He may ask Copilot or another agent to review one first. This page is for that review agent, and it's also the checklist an authoring agent runs on its own PR before asking for review.

A review is **advice to Wyatt**. Don't approve or merge; leave comments (or a "Comment" review) and let Wyatt decide.

## What to Check

1. **It does what the spec says.** Open the linked issue (`Closes #N`). Every requirement and acceptance criterion is met, nothing out of scope slipped in, and deviations are listed in the PR description.
2. **Game rules are right.** Anything that models Dungeon World matches [docs/game](../game/README.md): roll bands (10+ / 7–9 / 6−), HP = class base + CON **score**, load = class base + STR modifier, the level-up threshold (level + 7), cantrips and rotes not counting toward preparation, and so on.
3. **Rules live in the API.** Derived values and validation are computed in `dwai-api`, not reimplemented in the frontend. The frontend may validate for UX, but the API must enforce the same rule.
4. **Generated code was regenerated, not hand-edited.** A `.graphqls` change comes with regenerated gqlgen output; a SQL change comes with regenerated sqlc output; frontend `gql/` matches the schema.
5. **Migrations are safe.** A migration already merged to `main` was not edited; new schema changes are in a new numbered pair with a working `.down.sql`.
6. **Tests cover the new behavior.** Unit tests for pure rules logic, integration tests for GraphQL behavior, `bun test` for frontend logic. No test was skipped or loosened.
7. **Conventions are followed.** See the root and per-app `AGENTS.md` (for example: alphabetized lists and props, no default exports in the app, external `_test` packages in the API).
8. **Security.** Inputs are validated server-side. Once accounts exist, ownership is enforced in the API, not by hiding UI. For AI features, chat and other user text are treated as untrusted input.

## How to Comment

- Point to a file and line, say what's wrong, and why it matters. Suggest a fix when it's small.
- Separate **must fix** (bugs, rule errors, missing tests, spec gaps) from **suggestions** (style, naming, optional refactors).
- Don't restate what the code does, and don't comment on what the linters already enforce.
- End with a short summary: whether you think it's ready for Wyatt to merge, and the must-fix items if not.
