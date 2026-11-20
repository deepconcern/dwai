---
name: review-pr
description: Use when asked to review a pull request (as Copilot, another agent, or a chat assistant), or to self-review your own PR before asking the maintainer for review.
---

# Review a Pull Request

The maintainer merges every PR. A review is **advice to the maintainer**: don't approve or merge, leave comments (or a "Comment" review) and let them decide.

## What to Check

1. **It does what the spec says.** Open the linked issue (`Closes #N`). Every requirement and acceptance criterion is met, nothing out of scope slipped in, and deviations are listed in the PR description.
2. **The project's own checklist.** If the project's `AGENTS.md` links a review checklist (domain rules, where logic must live, migrations), go through it.
3. **Rules are enforced where they must be.** Validation that protects data lives on the server, not only in the UI. The UI may validate too, for a better experience.
4. **Generated code was regenerated, not hand-edited.** A change to a schema or query comes with matching regenerated output.
5. **Data changes are safe.** A migration already merged was not edited; new schema changes are in a new migration that can be rolled back.
6. **Tests cover the new behavior** (see [`write-tests`](../write-tests/SKILL.md)). Each acceptance criterion has a test, each test would fail if its behavior broke, none assumes what the spec doesn't say, and no test was skipped, disabled, or loosened.
7. **Conventions are followed**, as written in the project's `AGENTS.md` files.
8. **Security.** Inputs are validated server-side, ownership is enforced on the server rather than by hiding UI, no secrets or private details are committed, and user text (including anything sent to a model) is treated as untrusted.

## How to Comment

- Point to a file and line, say what's wrong and why it matters. Suggest a fix when it's small.
- Separate **must fix** (bugs, rule errors, missing tests, spec gaps) from **suggestions** (style, naming, optional refactors).
- Don't restate what the code does, and don't comment on what the linters already enforce.
- End with a short summary: whether you think it's ready for the maintainer to merge, and the must-fix list if not.
