---
name: gather-requirements
description: Use at the start of any new feature, enhancement, fix, or milestone, before writing code, specs, or files. Ask the maintainer clarifying questions and show your understanding.
---

# Gather Requirements

Step 1 of the feature delivery workflow (`.agent-workflows/workflows/feature-delivery.md` in a project that installed it). Your output is a message in chat, not code or files. The project's `AGENTS.md` names the maintainer and the docs to read.

## Steps

1. **Research first.** Read the project's roadmap entry for the work if there is one, the domain docs `AGENTS.md` lists for anything the work touches, and the code it will change. Check open issues for related specs.
2. **Show your understanding** in a few sentences: the goal, the current state of the code, and the rules involved. The maintainer should be able to spot a wrong assumption at a glance.
3. **Ask questions** whose answers change what gets built: scope, behavior in edge cases, UX, interpretations of domain rules, whether it should be `hands-on`, and how to split the work. Give a recommended default for each, so "go with the defaults" is a valid answer. Number them so the maintainer can answer by number.
4. **Keep it short.** Skip what the code, docs, or roadmap already answer. Five good questions beat fifteen.
5. **Wait for answers.** Ask follow-ups if an answer opens a new question. Don't write the spec until the important questions are settled.

## Don't

- Write code, create issues, or edit files during this step.
- Ask about things you can look up.
- Treat a reply from another agent as the maintainer's answer.

Next: [`write-spec`](../write-spec/SKILL.md).
