# Domain Model in Code

How the Dungeon World concepts in [docs/game](../game/README.md) are represented in this codebase. Details on field mappings are in [`dwai-api/AGENTS.md`](../../dwai-api/AGENTS.md#game-data-files).

## Where Each Concept Lives

| Concept | Source | GraphQL | Notes |
| ------- | ------ | ------- | ----- |
| Class | `internal/data/classes/*.yaml` | `CharacterClass` | Base HP, damage die, looks, alignments, bonds, starting gear, moves |
| Basic and special moves | `internal/data/player_moves.yaml` | `Move` (`type: basic / special`) | |
| Race, starting, advanced moves | Class YAML | `Move` (`type: class`) | `CharacterClass.advancedMoves2to5` / `advancedMoves6to10` |
| Level, XP, taken advanced moves | `characters.level`, `characters.xp`, `advanced_moves` table | `Character.level`, `xp`, `advancedMoves`, `availableAdvancedMoves` | Level-up rules in `internal/models/level.go` |
| Move creation options | Class YAML `creation_options` | — | Chosen at creation; stored in `move_creation_option_choices` |
| Item templates | `internal/data/item_templates.yaml` | `ItemTemplate` | Referenced by key from starting gear and owned items |
| Tags | `internal/data/tags.yaml` | `Tag` | Item tags like `weight`, `close`, `piercing` |
| Starting gear | Class YAML `starting_gear` | `StartingGear`, `GearOptionGroup`, `ItemOption` | Defaults plus pick-N groups; identical items are merged on creation |
| Character | `characters` table | `Character` | Stats stored as six score columns; modifiers derived. Max HP, armor, load, and max load are derived in `internal/models/sheet.go` |
| Debilities | `characters.debilities` (text array) | `Debility` | Stored by the API; the app applies the −1 to displayed modifiers |
| Looks | `looks` table | `Look`, `LookType` | One per look type |
| Owned items | `items`, `item_tags` tables | `Item` | `key` is a template key or `custom`; label, description, and tags override the template |
| Spells | `internal/data/spells/*.yaml` | `Spell` (`spells.byClass`) | Level 0 is a cantrip (Wizard) or rote (Cleric); `tags` are school and `ongoing` |
| Spellbook, prepared spells | `spellbook_spells`, `prepared_spells` tables | `Character.spellbook`, `preparedSpells` (`PreparedSpell.isForgotten`), `expectedSpellbookSize`, `maxPreparedSpellLevels`, `preparedSpellLevels` | Spell rules in `internal/models/spell.go`; only Wizards have a spellbook |
| Users | `users` table | `User` (`me`, `auth.register`/`login`/`logout`) | Email (unique ignoring case), display name, argon2id password hash. Hashing, tokens, and sessions in `internal/auth` |
| Sessions | `sessions` table | — (the `dwai_session` cookie) | Stores a SHA-256 hash of the cookie's token; 30 days, sliding |
| Character ownership | `characters.owner_id` | `characters.mine`, `Character.viewerIsOwner` | Only the owner can change a character, its items, spells, and bonds (`loadCharacter` in `internal/graph/helpers.go`). The GM of the character's campaign can also read the sheet and change HP and XP (`loadViewableCharacter` in `internal/graph/campaign_helpers.go`). Everyone else gets "not found" |
| Campaigns | `campaigns` table, `characters.campaign_id` | `Campaign` (`campaigns.byId`/`mine`/`byInviteCode`, `CampaignMutation`) | The creator is the GM and doesn't play. A character is in at most one campaign, and a player brings one character per campaign (a unique index). Joining is by a reusable invite code (Crockford base32) the GM can regenerate. Members see `PartyMember` summaries, not full sheets |
| Bonds | `bonds` table | `Bond` (`Character.bonds`, `characters.addBond`/`updateBond`/`deleteBond`) | Text plus a target character in the same campaign. Leaving or being removed deletes bonds by and about the character; a resolved bond is kept with `resolved_at` |
| End of Session | `campaign_sessions`, `session_reports` tables | `CampaignSession`, `SessionReport` (`campaigns.endSession`, `characters.submitSessionReport`, `Character.pendingSession`) | The GM answers the three group questions; each player reports alignment and an optional resolved bond (with a replacement). Each checked item needs a reason, which is logged. XP rules in `internal/models/campaign.go`. A report stays open until the next End of Session |
| Monsters, GM moves, fronts, hirelings | `internal/data/*.yaml`, `monsters/` | — | Reference only for now (Milestones 7, 8) |

## Rules Logic

Pure rules logic lives in `dwai-api/internal/models` (ability modifiers, character validation, starting-gear resolution and merging, derived stats, damage and healing) and is unit tested there. Resolvers in `internal/graph` stay thin: they load data, call into `models`, and persist.

When adding a rule, put the calculation in `models`, test it there, expose the result through GraphQL, and have the frontend display it rather than recompute it.

## Keys

Every game-content entity has a `key` in `snake_case` derived from its name (`hack_and_slash`, `fighter`, `dwarf_fighter`). Keys are what the database stores, so renaming a key in YAML breaks existing rows; treat keys as stable IDs.
