---
name: implement-spec
description: Use when a dwai spec issue is labeled "spec: approved" (or "hands-on"), to implement it with one or more agents and open a PR for Wyatt's review.
---

# Implement an Approved Spec

Steps 4 and 5 of the [workflow](../../../docs/workflow/README.md).

## Check First

- The issue has the `spec: approved` label, or Wyatt commented "approved". If not, stop and ask.
- If it's labeled `hands-on`, follow **Hands-on** below instead.

## Plan the Agents

- One agent is enough for most specs. Use more only when the spec's task breakdown has independent slices.
- With several agents: one coordinates. Each worker takes one sub-issue on its own branch (or git worktree) cut from the spec's branch, so no two agents edit the same files. The coordinator merges the workers' branches into the spec branch, resolves conflicts, runs the checks, and opens the single PR.
- A sub-issue may be assigned to the GitHub Copilot coding agent instead of a local agent.
- Schema work comes first: the frontend can't run codegen until the API schema exists. Sequence API → app when slices depend on each other.

## Implement

1. Branch from up-to-date `main` (for example `spec-<issue number>-<short-name>`), unless you were given a branch.
2. Follow the spec. Read `AGENTS.md` for the app you're in, and `docs/game/` for any rules. Use [`add-graphql-field`](../add-graphql-field/SKILL.md) and [`add-db-migration`](../add-db-migration/SKILL.md) when they apply.
3. If the spec turns out to be wrong or incomplete, stop and ask (a comment on the issue and a message to Wyatt). Don't silently change scope.
4. Write tests for each requirement. Never skip or weaken a test to pass.
5. Update `ROADMAP.md` if the work checks off roadmap items.
6. Run `make check`. If something can't run in your environment (for example Docker), note it in the PR.
7. Self-review with [`review-pr`](../review-pr/SKILL.md).

## Open the PR

- Use `.github/pull_request_template.md`. Put `Closes #<spec issue>` in the body and list any deviations from the spec.
- Assign Wyatt (`deepconcern`). Request his review too, unless the PR is opened under his account (GitHub rejects that).
- Never merge it yourself. When review comments arrive, push new commits to address them and reply to each one you won't apply, with the reason.

## Hands-on

Wyatt writes the implementation. You may:

- Write tests that define "done" (they may fail until Wyatt implements), and scaffolding he asks for.
- Post an implementation guide on the issue: files to touch, patterns to follow, pitfalls, and links to docs or concepts worth learning.
- Answer questions by explaining and pointing. Write implementation code only if Wyatt explicitly asks.
- Review his PR with `review-pr` when asked.
