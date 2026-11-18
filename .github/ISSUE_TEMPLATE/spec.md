---
name: Spec
about: A spec for a feature, enhancement, fix, or milestone. Written after requirements are gathered; implemented only once approved.
title: "Spec: "
labels: ["spec: draft"]
---

## Summary

<!-- One or two sentences: what this delivers and for whom. -->

## Background

<!-- Why now. Link the ROADMAP.md milestone and any related issues or PRs. -->

## Requirements

<!-- Numbered, testable statements of what must be true when this is done. -->

1.

## Out of Scope

<!-- What this deliberately doesn't do, to keep the PR focused. -->

-

## Decisions

<!-- The questions asked while gathering requirements, and Wyatt's answers. -->

| Question | Decision |
| -------- | -------- |
|          |          |

## Game Rules

<!-- The Dungeon World rules this touches, with links to docs/game. Write "None" if it touches no rules. -->

## Design

<!-- How it will be built: GraphQL schema changes, migrations, rules logic in internal/models, frontend pages and components, AI concepts used (for Phase 2). -->

## Task Breakdown

<!-- How the work splits across agents. Each line becomes a sub-issue if the spec needs more than one agent. -->

- [ ] API:
- [ ] App:
- [ ] Tests:

## Acceptance Criteria

<!--
One scenario per behavior that matters, as Given / When / Then. Each becomes a test, written (and failing) before the implementation.
Cover the happy path, the edge cases worth naming, and the errors a user can hit. Leave out cases nobody needs.
Example:
- [ ] Given a Fighter with Weak, when the sheet shows Strength 16, then the modifier reads +1.
-->

- [ ] Given …, when …, then …
- [ ] `make check` passes
