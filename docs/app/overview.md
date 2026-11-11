# Overview

Dungeon World AI (dwai) is a **D&D Beyond for Dungeon World**: digital character sheets, campaign management, GM tools, and a table chat with rolls. Later it becomes a playground for **AI players and AI Game Masters** that can join or run a game.

It's a private project with one maintainer (Wyatt), run locally. It's also a deliberate learning project for AI development concepts (MCP, RAG, skills, evals, multi-agent coordination), so some features are built partly for what they teach.

## The D&D Beyond Comparison

[D&D Beyond](https://www.dndbeyond.com/) is the official digital toolset for D&D 5e: a rules compendium, a guided character builder, an interactive character sheet (HP, rolls, inventory, spells), campaigns that group players' characters under a DM, and encounter and monster tools. dwai aims for the same shape, fitted to Dungeon World's lighter rules:

| D&D Beyond | dwai equivalent | Roadmap |
| ---------- | --------------- | ------- |
| Character builder | Guided creation: class, race move, looks, stats, alignment, gear, move choices | Milestone 1 ✓ |
| Interactive character sheet | HP and damage, inventory and load, gold, debilities, XP and level up, spells | Milestone 3 |
| Accounts | Local accounts; characters belong to a user | Milestone 4 |
| Campaigns | A GM, invited players, their characters, bonds, End of Session | Milestone 5 |
| Digital dice / game log | Table chat with move rolls (2d6 + stat) posted by the API | Milestone 6 |
| Monster compendium and homebrew | Browse the SRD monsters, create custom ones, track HP | Milestone 7 |
| Encounter builder | Fronts, dangers, grim portents, and encounters | Milestone 8 |
| — | AI character creator, AI players, AI campaign creator, AI GM | Milestones 9–13 |

What dwai deliberately doesn't copy: a marketplace or paywalled content (the SRD is free), initiative trackers and action economy (Dungeon World has none), and DM rolls (the GM never rolls).

## Status

See [`ROADMAP.md`](../../ROADMAP.md) for the authoritative status. In short, as of November 2026: character creation and a read-only sheet are done, the test foundation is nearly done, and the stateful character sheet (Milestone 3) is next.

## Guiding Principles

- **The API is the single source of truth for rules.** Derived values (armor, load, max HP) and validation live in Go, so the frontend and future AI agents share one implementation.
- **AI agents get no special paths.** They act through the same GraphQL mutations (or MCP tools wrapping them) that humans use, and authenticate as their own user. Authorization is enforced by the API, never by prompting.
- **Game content is data.** Classes, moves, items, and monsters come from YAML transcribed from the SRD, not from code.
