---
name: write-tests
description: Use whenever you write or change tests. Tests come first, from the spec's Given/When/Then criteria, cover only the cases that matter, and must fail when the behavior breaks.
---

# Write Tests

A good test reads like a requirement and fails when that requirement breaks. The project's `AGENTS.md` may add its own test idioms and point to model tests worth copying; follow those too.

## Rules

1. **Tests come first, from the requirements.** Before implementing, list the behaviors to cover as Given / When / Then scenarios, taken from the spec issue's acceptance criteria (or the task, when there is no spec). Show the maintainer that list when the cases aren't obvious. Write the tests, see them fail, then implement. Never derive tests by reading the implementation: that only restates the code, mistakes included.
2. **Cover only the cases that matter:** the happy path, the edge cases the requirements name or the domain makes real (boundaries, empty, maximum), and the errors a user can actually hit. Don't add a test just because a branch exists. Don't test the language, framework, or third-party libraries.
3. **Test behavior through the public interface.** Call what a real caller calls (an exported function, an HTTP or GraphQL endpoint, the rendered UI) and assert on what the caller observes. Don't assert on private state, internal call order, or implementation details.
4. **Don't mock code you own.** Use real collaborators and, where practical, a real database or test container. Fake only what's outside your control (network services, the clock, randomness), and only when the test needs it.
5. **One behavior per test, in Arrange / Act / Assert order.** Name the test after the rule it checks ("rejects a blank name"), not after the function. Keep inputs and expected values literal and next to the assertion, so a reader can verify the test without running it or jumping to helpers.
6. **No unstated assumptions.** Every expected value must trace to the spec, the domain docs, or the test's own setup. If you'd have to guess the right answer, ask the maintainer instead of encoding the guess.
7. **Use the project's idioms.** For example: table-driven tests with `t.Run` in Go; one `describe` per unit and one `test` per rule in JS/TS; parametrized tests in pytest. Match the existing tests in the repository.
8. **Fewer, clearer tests beat coverage numbers.** Delete or merge tests that duplicate each other or that would still pass with the behavior broken.

## Before Calling It Done

Review every test you wrote and answer two questions for each:

- *Would this test fail if the behavior it describes broke?*
- *Does it assume anything the requirements don't say?*

Fix or delete any test that fails either one, and say in the PR (or your reply) which you removed and why.
