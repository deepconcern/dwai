---
name: write-spec
description: Use after requirements are agreed with the maintainer in chat, to write the spec as a GitHub issue labeled "spec: draft" for the maintainer to approve.
---

# Write a Spec

Step 2 of the feature delivery workflow. The output is an issue in the project's repository, using the spec template that the project's `AGENTS.md` names (usually `.github/ISSUE_TEMPLATE/spec.md`).

## Steps

1. **Open an issue from the Spec template**, titled `Spec: <goal in a few words>`, labeled `spec: draft`. Add `hands-on` if the maintainer said they'll implement it, and any project labels `AGENTS.md` asks for (such as a milestone).
2. **Fill every section.** In particular:
   - **Requirements**: numbered, testable statements of what must be true when this is done.
   - **Out of Scope**: what this deliberately doesn't do.
   - **Decisions**: every question from the requirements conversation and the maintainer's answer. This is the permanent record, so write it to make sense without the chat.
   - **Design**: concrete changes (schema, data, modules, UI). Name new concepts and why they fit.
   - **Task Breakdown**: how the work splits. If it needs more than one agent, plan one sub-issue per independent slice that doesn't edit the same files as another.
   - **Acceptance Criteria**: one Given/When/Then scenario per behavior that matters (the happy path, the edge cases the domain makes real, the errors a user can hit), concrete enough that each becomes a test. Leave out cases nobody needs.
   - Any project sections in the template (such as domain rules), with links to the project's docs. If you found a gap or error in those docs, add fixing it to the breakdown.
3. **Attribute the published issue** according to the shared identity and attribution rule in the installed `.agent-workflows/principles.md`. The initial issue body must identify its AI author when published through a human account; reuse an adequate existing footer instead of duplicating it.
4. **Create sub-issues** only if the breakdown needs more than one agent. Link them to the parent, which stays the spec of record.
5. **Tell the maintainer** the spec is ready, with the link, and that you're waiting for approval.

## While Waiting

- If the maintainer asks for changes, edit the issue body (the spec is a living document until approved) and summarize what changed in a comment.
- Don't start implementing. Approval is the `spec: approved` label or the maintainer commenting "approved", and only the maintainer can give it.

Next: [`implement-spec`](../implement-spec/SKILL.md).
