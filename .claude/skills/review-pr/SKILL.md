---
name: review-pr
description: Use when asked to review a dwai pull request (by Wyatt, or as Copilot/another review agent), or to self-review your own PR before requesting review.
---

# Review a Pull Request

Follow the checklist in [docs/workflow/reviewing.md](../../../docs/workflow/reviewing.md). Summary:

1. Read the linked spec issue (`Closes #N`). Check each requirement and acceptance criterion against the diff, and look for scope creep.
2. Verify any game rule against `docs/game/` (roll bands, HP = base + CON score, load = base + STR modifier, level up at level + 7, spell preparation limits).
3. Rules are computed in `dwai-api/internal/models`, not only in the frontend.
4. Generated code is regenerated (gqlgen, sqlc, `dwai-app/gql/`), not hand-edited.
5. No merged migration was edited; new ones have a working `.down.sql`.
6. New behavior has tests; no test was skipped or weakened.
7. Per-app conventions in each `AGENTS.md` are followed.
8. Inputs are validated server-side; for AI features, chat is treated as untrusted.

## Output

- Comment on specific lines with what's wrong, why, and a fix when it's small.
- Separate **must fix** from **suggestions**. Skip what linters already enforce.
- End with a summary: ready for Wyatt to merge, or the must-fix list.
- Never approve or merge. Your review is advice; Wyatt decides.
