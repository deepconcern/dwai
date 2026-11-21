# Agent Workflows

Reusable workflows for building software with AI agents, where one human maintainer stays in charge and the agents work like junior engineers: they ask before they build, write a spec the maintainer approves, test first, and hand back a pull request that only the maintainer merges.

Everything here is plain Markdown, so any agent can follow it: Claude Code, GitHub Copilot, ChatGPT, or another tool. The skills under [`skills/`](skills/) also carry the frontmatter that Claude Code and Copilot use to load them automatically.

## What's Here

| Path | What it is |
| ---- | ---------- |
| [`principles.md`](principles.md) | The rules every agent follows, in every project |
| [`workflows/feature-delivery.md`](workflows/feature-delivery.md) | The lifecycle: requirements, spec, approval, test-first build, PR, merge |
| [`roles/`](roles/) | What a [junior engineer](roles/junior.md) and a [reviewer](roles/reviewer.md) may and may not do |
| [`skills/`](skills/) | Step-by-step procedures, one per step of the workflow |
| [`stacks/`](stacks/) | Optional conventions for specific stacks ([React](stacks/react.md), [Go + GraphQL](stacks/go-graphql.md)) and [cloud agent sessions](stacks/cloud-sessions.md) |
| [`templates/`](templates/) | A project [`AGENTS.md`](templates/AGENTS.md), a [spec issue](templates/spec-issue.md) and a [PR body](templates/pull_request_template.md) |
| [`install.sh`](install.sh) | Copies a tagged version into a project |

### Skills

| Skill | Use when |
| ----- | -------- |
| [`gather-requirements`](skills/gather-requirements/SKILL.md) | Starting any new feature, enhancement, fix, or milestone |
| [`write-spec`](skills/write-spec/SKILL.md) | Requirements are agreed and a spec issue is needed |
| [`implement-spec`](skills/implement-spec/SKILL.md) | A spec is approved (or is `hands-on`) |
| [`write-tests`](skills/write-tests/SKILL.md) | Writing or changing any test |
| [`review-pr`](skills/review-pr/SKILL.md) | Reviewing a spec or PR, or self-reviewing before asking for review |

## How a Project Adopts It

The shared files say *how* to work. Each project's own `AGENTS.md` says *who* and *what*: the maintainer, the labels, the check command, the domain docs, and any local rules. Shared skills read those values from it, so they never need editing per project.

1. **Install a pinned version** from the project root:

   ```sh
   curl -fsSL https://raw.githubusercontent.com/deepconcern/agent-workflows/v1.0.0/install.sh | sh -s -- v1.0.0
   ```

   This copies the docs into `.agent-workflows/` (with a `VERSION` file) and the skills into `.claude/skills/`, where Claude Code and Copilot find them. Commit both. Agents then read local files, with no network needed, and the copy only changes when you run the installer again with a newer tag.

2. **Write the project's `AGENTS.md`** from [`templates/AGENTS.md`](templates/AGENTS.md). Fill in the Workflow Settings table and keep only what is specific to the project: stack, commands, layout, and local rules.

3. **Add the GitHub templates**: copy [`templates/spec-issue.md`](templates/spec-issue.md) to `.github/ISSUE_TEMPLATE/spec.md` and [`templates/pull_request_template.md`](templates/pull_request_template.md) to `.github/pull_request_template.md`, then add any project sections (such as domain rules). Create the labels listed in the workflow.

4. **Point other agents at it.** `CLAUDE.md` can be the single line `@AGENTS.md`. `.github/copilot-instructions.md` should only point to `AGENTS.md`. For a chat assistant without the repo, share the links to the tagged files.

To change a shared rule, merge a classified PR here. After a new release is published, re-run the installer in each project when you choose. Don't edit the installed copies: the next install overwrites them. A project rule that differs from a shared one goes in the project's `AGENTS.md`, which wins.

## Versioning

Releases are tagged `vMAJOR.MINOR.PATCH`. Each PR targeting `main` needs exactly one release label. The author proposes the label and the maintainer reviews it before merging.

| Label | When to use it |
| --- | --- |
| `release: major` | Changes required agent behavior or compatibility, such as adding a required step or renaming a skill. Describe the compatibility impact in the PR. |
| `release: minor` | Adds a backward-compatible skill, stack, or template. |
| `release: patch` | Fixes or clarifies the distribution without changing required behavior. |
| `release: none` | Changes repository maintenance only, with no effect on installed files or installer behavior. |

For a release, include a **Release notes** section in the PR. GitHub Actions tags the merged revision and publishes its notes after the maintainer merges. Projects stay on the tag they already installed until they explicitly update it. See the [changelog](CHANGELOG.md) and the [activation and recovery guide](https://github.com/deepconcern/agent-workflows/blob/main/docs/releases.md).
