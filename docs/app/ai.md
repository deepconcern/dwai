# AI Features

Phase 2 of the [roadmap](../../ROADMAP.md) adds AI: a character creator, AI players, an AI campaign creator, and an AI Game Master. It's also how Wyatt learns AI development concepts, so specs for these features should explain the concept being used and why it fits.

## Two Kinds of "Agent" in This Repo

Don't confuse them:

| | Development agents | In-app AI agents |
| - | ------------------ | ---------------- |
| What | Claude Code, Copilot, etc. building dwai | AI players and GMs playing Dungeon World inside dwai |
| Instructions | `AGENTS.md`, `docs/`, `.claude/skills/` | Future in-app skills, prompts, and MCP tools (Milestone 9+) |
| Acts through | Git, the filesystem, GitHub | The dwai GraphQL API / MCP server, as their own user |

The development skills in `.claude/skills/` are about building the app. In-app skills (how to play, how to GM) will live with the API once Milestone 9 starts, and their location is decided in that milestone's spec.

## Which Concept Fits Which Problem

| Concept | What it's for | In this app |
| ------- | ------------- | ----------- |
| **Skills** | Procedural know-how, loaded only when needed | How to play, how to GM, monster creation, building fronts |
| **MCP / tools** | Actions, and exact, current, structured data | Roll a move, read a sheet, create a monster, filter the compendium by tag |
| **RAG** | Finding relevant passages in large, growing, unstructured text | Campaign history, lore, GM notes, rules prose |
| **Evals** | Measuring agent quality against known outcomes | Replay sessions; check the right stat was rolled, a GM move followed a miss |
| **Structured output** | Getting valid data, not prose | AI character creator returns a valid `CreateCharacterInput` |

RAG is not for the static compendium (small enough for a cached prompt or a filter query) or for live character state (must be exact and current; read it with a tool).

## Design Rules for AI Features

- Agents act only through the same API mutations humans use, wrapped as MCP tools. No special paths.
- Agents authenticate as their own user, so ownership checks apply to them.
- Chat is untrusted input. Information boundaries (AI players never see GM-only messages, fronts, or monster HP) and anti-cheating are enforced by API authorization, not by prompts, and are covered by evals.
- Use the latest Claude models via the Claude API; route cheap tasks to a cheaper model and judgment calls to a stronger one, and compare with evals.
