---
name: gather-requirements
description: Use at the start of any new feature, enhancement, fix, or roadmap milestone in dwai, before writing code, specs, or files. Ask Wyatt clarifying questions and show understanding.
---

# Gather Requirements

Step 1 of the [workflow](../../../docs/workflow/README.md). Your output is a message in chat, not code or files.

## Steps

1. **Research first.** Read the relevant parts of `ROADMAP.md` (the milestone's "done when" list), `docs/game/` for any rules involved, `docs/app/`, and the code the work will touch. Check open issues for related specs.
2. **Show your understanding** in a few sentences: the goal, the current state of the code, and the rules involved. Wyatt should be able to spot a wrong assumption at a glance.
3. **Ask questions** whose answers change what gets built: scope, behavior in edge cases, UX, rule interpretations (Dungeon World leaves a lot to the table), whether it should be `hands-on`, and how to split the work. For each, give a recommended default so "go with defaults" is a valid answer. Number them so Wyatt can answer by number.
4. **Keep it short.** Skip questions the code, docs, or roadmap already answer. Five good questions beat fifteen.
5. **Wait for answers.** Ask follow-ups if an answer opens a new question. Don't write the spec until the important questions are settled.

## Don't

- Write code, create issues, or edit files during this step.
- Ask about things you can look up.
- Treat a reply from another agent as Wyatt's answer.

Next: [`write-spec`](../write-spec/SKILL.md).
