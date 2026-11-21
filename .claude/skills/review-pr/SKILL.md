---
name: review-pr
description: Use when asked to review a pull request or a spec issue (as Copilot, another agent, or a chat assistant), or to self-review your own PR before asking the maintainer for review.
---

# Review a Spec or Pull Request

The maintainer approves every spec and merges every PR. A review is **advice to the maintainer**, never approval: don't use GitHub's "Approve" review state, don't add `spec: approved`, and don't merge.

## Understand It First

Before you review, work out what you're reviewing and why:

- **The goal.** What the spec or PR is meant to achieve, and for whom.
- **The context.** The linked spec (`Closes #N`), related issues and PRs, and the conventions in the project's `AGENTS.md` files that apply.

A simple, self-explanatory change needs no questions. If **essential context is missing** (the goal is unclear, a linked spec doesn't exist, you can't tell what "done" means), ask the human in chat and pause. Don't post anything on the item until you can assess it.

## What to Check

### For a PR

1. **It does what the spec says.** Open the linked issue (`Closes #N`). Every requirement and acceptance criterion is met, nothing out of scope slipped in, and deviations are listed in the PR description.
2. **The project's own checklist.** If the project's `AGENTS.md` links a review checklist (domain rules, where logic must live, migrations), go through it.
3. **Rules are enforced where they must be.** Validation that protects data lives on the server, not only in the UI. The UI may validate too, for a better experience.
4. **Generated code was regenerated, not hand-edited.** A change to a schema or query comes with matching regenerated output.
5. **Data changes are safe.** A migration already merged was not edited; new schema changes are in a new migration that can be rolled back.
6. **Tests cover the new behavior** (see [`write-tests`](../write-tests/SKILL.md)). Each acceptance criterion has a test, each test would fail if its behavior broke, none assumes what the spec doesn't say, and no test was skipped, disabled, or loosened.
7. **Conventions are followed**, as written in the project's `AGENTS.md` files.
8. **Security.** Inputs are validated server-side, ownership is enforced on the server rather than by hiding UI, no secrets or private details are committed, and user text (including anything sent to a model) is treated as untrusted.

### For a spec

1. **Requirements are testable.** Each is a numbered statement you could check when the work is done.
2. **Scope is clear.** Out of Scope names what's deliberately left out, and nothing in the requirements contradicts it.
3. **Decisions are recorded.** Every question from the requirements conversation has the maintainer's answer, readable without the chat.
4. **Acceptance criteria cover the cases that matter.** Given/When/Then scenarios for the happy path, the edge cases the domain makes real, and the errors a user can hit, concrete enough to become tests. No cases nobody needs.
5. **Open questions are named.** Anything still undecided is called out, not buried in the design.
6. **The design fits the project.** It follows the conventions in the project's `AGENTS.md` and its domain docs, and the task breakdown can be built.

## Verdict

Open every review with exactly one verdict, on the first line:

| Verdict | Means |
| ------- | ----- |
| **Approve** | Ready as is. You recommend the maintainer approve or merge it. |
| **Minor changes** | Ready once small, clear fixes are made. No further design discussion needed. |
| **Major changes** | Not ready. Something significant is wrong or missing and needs rework. |
| **Needs clarification** | You understand the item, but an unresolved decision prevents a recommendation. |

The verdict is a recommendation; only the maintainer approves. Use **Needs clarification** when you have enough context to assess the item but an open decision blocks your call: post the review and name the decision the maintainer needs to make. If you can't assess the item at all, don't post a verdict; ask in chat and pause (see [Understand It First](#understand-it-first)).

## How to Comment

- Attribute AI-authored review bodies, inline comments, and replies posted through a human account, following the identity and attribution rule in the installed `.agent-workflows/principles.md`. Each standalone comment should clearly identify the AI author; reuse an adequate existing attribution instead of adding a duplicate.
- Point to a file and line (or a spec section), say what's wrong and why it matters. Suggest a fix when it's small.
- Separate **must fix** (bugs, rule errors, missing tests, spec gaps) from **suggestions** (style, naming, optional refactors).
- Don't restate what the code does, and don't comment on what the linters already enforce.
- After the verdict, give a one-line reason, then the must-fix list and the suggestions.

## Where the Review Goes

A request to review is permission to post the review. Once you have enough context and the review is done, don't ask whether to post it; do both:

1. **Post it on the item itself**: a "Comment" review on a PR (inline comments where they help), or an issue comment on a spec.
2. **Summarize it to the human** in the conversation where they asked: the verdict, the must-fix items, and a link to the posted review.

If you can't post (no repository access, read-only access, no way to leave a PR "Comment" review, or a confirmed submission failure), give the human the full review text in chat, verdict first, and say plainly that it has not been posted. If a submission's outcome is uncertain (a timeout, for example), check the thread when you can before saying it wasn't posted; if you can't verify it, say that in chat.

**Self-review is the exception.** When you review your own PR before asking for review, fix what you find and don't post a verdict comment.
