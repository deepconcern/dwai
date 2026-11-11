# Domain Model in Code

How the Dungeon World concepts in [docs/game](../game/README.md) are represented in this codebase. Details on field mappings are in [`dwai-api/AGENTS.md`](../../dwai-api/AGENTS.md#game-data-files).

## Where Each Concept Lives

| Concept | Source | GraphQL | Notes |
| ------- | ------ | ------- | ----- |
| Class | `internal/data/classes/*.yaml` | `CharacterClass` | Base HP, damage die, looks, alignments, bonds, starting gear, moves |
| Basic and special moves | `internal/data/player_moves.yaml` | `Move` (`type: basic / special`) | |
| Race, starting, advanced moves | Class YAML | `Move` (`type: class`) | Advanced moves aren't exposed yet (Milestone 3) |
| Move creation options | Class YAML `creation_options` | — | Chosen at creation; stored in `move_creation_option_choices` |
| Item templates | `internal/data/item_templates.yaml` | `ItemTemplate` | Referenced by key from starting gear and owned items |
| Tags | `internal/data/tags.yaml` | `Tag` | Item tags like `weight`, `close`, `piercing` |
| Starting gear | Class YAML `starting_gear` | `StartingGear`, `GearOptionGroup`, `ItemOption` | Defaults plus pick-N groups; identical items are merged on creation |
| Character | `characters` table | `Character` | Stats stored as six score columns; modifiers derived |
| Looks | `looks` table | `Look`, `LookType` | One per look type |
| Owned items | `items`, `item_tags` tables | `Item` | `key` is a template key or `custom`; label, description, and tags override the template |
| Spells | `internal/data/spells/*.yaml` | — | Loaded, not exposed yet (Milestone 3) |
| Monsters, GM moves, fronts, hirelings | `internal/data/*.yaml`, `monsters/` | — | Reference only for now (Milestones 7, 8) |

## Rules Logic

Pure rules logic lives in `dwai-api/internal/models` (ability modifiers, character validation, starting-gear resolution and merging) and is unit tested there. Resolvers in `internal/graph` stay thin: they load data, call into `models`, and persist.

When adding a rule, put the calculation in `models`, test it there, expose the result through GraphQL, and have the frontend display it rather than recompute it.

## Keys

Every game-content entity has a `key` in `snake_case` derived from its name (`hack_and_slash`, `fighter`, `dwarf_fighter`). Keys are what the database stores, so renaming a key in YAML breaks existing rows; treat keys as stable IDs.
