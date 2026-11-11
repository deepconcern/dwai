---
name: write-spec
description: Use after requirements are agreed with Wyatt in chat, to write the spec for a dwai feature as a GitHub issue labeled "spec: draft".
---

# Write a Spec

Step 2 of the [workflow](../../../docs/workflow/README.md). The output is a GitHub issue in `deepconcern/dwai`.

## Steps

1. **Open an issue using the Spec template** (`.github/ISSUE_TEMPLATE/spec.md`), titled `Spec: <goal in a few words>`, with the label `spec: draft`. Add `hands-on` if Wyatt said he'll implement it, and `milestone: N` if it belongs to a roadmap milestone.
2. **Fill every section.** In particular:
   - **Requirements**: numbered, testable statements.
   - **Decisions**: every question from the requirements conversation and Wyatt's answer. This is the permanent record, so write it so it makes sense without the chat.
   - **Game Rules**: the rules involved, with links into `docs/game/`. If you found a gap or error in `docs/game/`, include fixing it in the task breakdown.
   - **Design**: concrete schema, migration, `internal/models`, and frontend changes. For AI features, name the concept (skill, MCP tool, RAG, eval) and why it fits (see `docs/app/ai.md`).
   - **Task Breakdown**: how the work splits. If it needs more than one agent, plan one sub-issue per independent slice that doesn't edit the same files as another (for example API schema and resolvers; frontend; tests and fixtures).
   - **Acceptance Criteria**: how Wyatt verifies it, including the tests.
3. **Create sub-issues** only if the breakdown needs more than one agent. Link them to the parent spec issue; the parent stays the spec of record.
4. **Tell Wyatt in chat** that the spec is ready, with the link, and that you're waiting for his approval.

## While Waiting

- If Wyatt requests changes, edit the issue body and summarize what changed in a comment.
- Don't start implementing. Approval is the `spec: approved` label or Wyatt commenting "approved", and only Wyatt can give it.

Next: [`implement-spec`](../implement-spec/SKILL.md).
