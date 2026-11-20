# Feature Delivery

How every feature, enhancement, bug fix, or roadmap milestone gets built. The maintainer stays in control of what gets built, and agents do the legwork. The project's `AGENTS.md` names the maintainer and fills in the settings this page refers to (labels, check command, spec template, domain docs).

## The Lifecycle

```
1. Gather requirements → 2. Write spec (issue) → 3. Maintainer approves → 4. Implement, tests first → 5. PR → 6. Maintainer reviews and merges
```

| Step | Who | Output | Skill |
| ---- | --- | ------ | ----- |
| 1. Gather requirements | Agent asks, maintainer answers | Questions and a summary of understanding, in chat | [`gather-requirements`](../skills/gather-requirements/SKILL.md) |
| 2. Write spec | Agent | An issue labeled `spec: draft` | [`write-spec`](../skills/write-spec/SKILL.md) |
| 3. Approve | **Maintainer only** | The label changes to `spec: approved`, or the maintainer comments "approved" | — |
| 4. Implement | One or more agents | Branch(es) with tests and commits | [`implement-spec`](../skills/implement-spec/SKILL.md), [`write-tests`](../skills/write-tests/SKILL.md) |
| 5. Open PR | Agent | A PR that closes the spec issue, assigned to the maintainer | [`implement-spec`](../skills/implement-spec/SKILL.md) |
| 6. Review and merge | Maintainer, optionally helped by review agents | The merged PR | [`review-pr`](../skills/review-pr/SKILL.md) |

### Why a spec issue

The spec lives in the issue tracker, not in a chat log, so the decisions and their reasons outlast any one conversation and any one agent. Its acceptance criteria are written as Given/When/Then scenarios, and each becomes a test. Reviewing them is how the maintainer decides which cases get tested before any code exists.

### Splitting the work

A spec too big for one agent is split into sub-issues, each small enough for one agent on one branch, and sliced so no two agents edit the same files. The parent issue stays the spec of record. One agent coordinates: it splits the work, merges the branches, runs the checks, and opens the single PR. Where one slice depends on another (an API schema before the frontend that consumes it), sequence them.

## Hands-on Mode (`hands-on` label)

When an issue carries the `hands-on` label, the maintainer writes the implementation, usually to learn something. The agent still gathers requirements and writes the spec. It may then write tests that define "done" (failing until the maintainer implements), scaffolding the maintainer asks for, and a short implementation guide: files to touch, patterns to follow, and concepts worth learning. It does not write the implementation unless the maintainer explicitly asks, and reviews the maintainer's PR when asked.

## Labels

| Label | Meaning |
| ----- | ------- |
| `spec: draft` | A spec under discussion. Not ready for implementation. |
| `spec: approved` | The maintainer approved the spec. Agents may implement it. |
| `hands-on` | The maintainer implements; agents write the spec, tests, and guidance only. |

Projects may add their own (for example `milestone: N`) in their `AGENTS.md`.

## What Skips the Lifecycle

Small, explicit requests from the maintainer (a rename, a typo, a one-line fix they've described) go straight to a branch and PR. The PR is still the maintainer's to merge.
