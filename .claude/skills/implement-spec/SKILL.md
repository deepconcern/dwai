---
name: implement-spec
description: Use when a spec issue is labeled "spec: approved" (or "hands-on"), to implement it test-first with one or more agents and open a PR for the maintainer to review and merge.
---

# Implement an Approved Spec

Steps 4 and 5 of the feature delivery workflow.

## Check First

- The issue has the `spec: approved` label, or the maintainer commented "approved". If not, stop and ask.
- If it's labeled `hands-on`, follow **Hands-on** below instead.

## Plan the Agents

- One agent is enough for most specs. Use more only when the task breakdown has independent slices.
- With several agents, one coordinates. Each worker takes one sub-issue on its own branch or git worktree, cut from the spec's branch, so no two agents edit the same files. The coordinator merges the workers' branches, resolves conflicts, runs the checks, and opens the single PR.
- Sequence slices that depend on each other (a schema before the code generated from it).

## Implement

1. Branch from the up-to-date default branch (for example `spec-<issue>-<short-name>`), unless you were given a branch.
2. Read the project's `AGENTS.md` (and any per-package `AGENTS.md` where you work) and the domain docs it lists. Use the project's own skills when they apply.
3. Follow the spec. If it turns out wrong or incomplete, stop and ask with a comment on the issue and a message to the maintainer. Don't change scope silently.
4. **Test first**, following [`write-tests`](../write-tests/SKILL.md): turn each Given/When/Then acceptance criterion into a test, see it fail, then implement until it passes. Never skip or weaken a test to pass.
5. Update the roadmap in the same branch if the work checks off an item and the project keeps one.
6. Run the project's check command. If something can't run in your environment, note it in the PR.
7. Self-review with [`review-pr`](../review-pr/SKILL.md).

## Open the PR

- Use the project's PR template. Put `Closes #<spec issue>` in the body and list every deviation from the spec (or "None"). Attribute AI-authored PR text published through a human account per the installed `.agent-workflows/principles.md` identity and attribution rule; don't duplicate an adequate existing footer.
- If the project uses release labels, propose the label required by its versioning policy and include release notes. For a major bump, describe the compatibility impact. The maintainer can adjust the label before merging.
- Assign the maintainer. Request their review too, unless the PR is opened under their account (GitHub rejects review requests to the author).
- Never merge it yourself. When review comments arrive, push new commits (don't force-push over reviewed history) and reply to each comment you won't apply, with the reason.

## Hands-on

The maintainer writes the implementation. You may:

- Write tests that define "done" (they may fail until the maintainer implements), and scaffolding they ask for.
- Post an implementation guide on the issue: files to touch, patterns to follow, pitfalls, and links to concepts worth learning.
- Answer questions by explaining and pointing. Write implementation code only if the maintainer explicitly asks.
- Review their PR with `review-pr` when asked.
