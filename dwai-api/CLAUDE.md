# Dungeon World AI (API)

## Dungeon World — Domain Model

This document explains the Dungeon World tabletop RPG system as implemented in this codebase. Read it before writing or modifying any Go/GraphQL code that touches game data.

### Roll System

All resolution uses **2d6 + stat modifier**:

| Result    | Outcome                                                |
| --------- | ------------------------------------------------------ |
| 10+       | Full success                                           |
| 7–9       | Partial success (success with cost, or reduced effect) |
| 6− (miss) | Failure; the GM makes a move against the players       |

Some moves grant a 12+ result with an exceptional outcome.

### Stats

Six stats, each with a score (3–18) and a derived modifier (−3 to +3 per the standard D&D table):

| Stat         | Abbrev | Primary use                                              |
| ------------ | ------ | -------------------------------------------------------- |
| Strength     | STR    | Melee attacks, feats of force                            |
| Dexterity    | DEX    | Ranged attacks, agility, traps                           |
| Constitution | CON    | HP calculation, endurance                                |
| Intelligence | INT    | Knowledge, arcane magic (Wizard)                         |
| Wisdom       | WIS    | Perception, divine magic (Cleric), nature (Druid/Ranger) |
| Charisma     | CHA    | Social manipulation, bard magic, paladin healing         |

**Max HP = `hp_base` + CON score** (the full score, not the modifier).

### Key Mechanics

- **Damage**: Attacker rolls their `damage_die`. Weapon/move bonuses may add flat damage or extra dice.
- **Armor**: Reduces incoming damage. Total armor = worn armor + shield + bonuses. Some attacks have **piercing X**, which ignores X armor.
- **Hold**: A resource gained from certain roll results, spent 1-for-1 to activate listed options later (e.g., Defend, Shapeshifter).
- **+N forward**: +N to your very next applicable roll, then gone.
- **+N ongoing**: +N to all applicable rolls until a stated condition ends it.
- **Ongoing spells**: While maintaining an ongoing spell, take −1 to cast further spells (cumulative). End ongoing spells at will or when the fiction demands.
- **Debilities**: Named stat penalties (Weak/STR, Shaky/DEX, Sick/CON, Stunned/INT, Confused/WIS, Scarred/CHA). Removed by the Recover move.

### Move Anatomy

Every move has a fictional **trigger** ("When you…"). Only the trigger matters—if the fiction matches, the move happens. Move fields:

| Field         | Meaning                                                  |
| ------------- | -------------------------------------------------------- |
| `trigger`     | The fictional condition that activates the move          |
| `roll`        | Which stat to add (or "nothing" for Last Breath)         |
| `on_10`       | Full success outcome                                     |
| `on_7_9`      | Partial success; player often picks from `options`       |
| `on_miss`     | Explicit miss effect, if any (otherwise GM makes a move) |
| `options`     | List players choose from on partial or full success      |
| `description` | Used for moves with no roll (procedural rules)           |

### Classes

Each file in `data/classes/` maps directly to the `CharacterClass` GraphQL type. Fields:

| YAML field            | GraphQL field   | Notes                                         |
| --------------------- | --------------- | --------------------------------------------- |
| `hp_base`             | `hpBase`        | Integer added to CON **score** (not modifier) |
| `damage_die`          | `damageDie`     | Integer — the die face (4, 6, 8, 10)          |
| `race_moves`          | `raceMoves`     | One chosen at character creation              |
| `starting_moves`      | `startingMoves` | All characters of this class begin with these |
| `advanced_moves_2_5`  | —               | Moves available at levels 2–5                 |
| `advanced_moves_6_10` | —               | Moves available at levels 6–10                |

Advanced moves may have a `requirement` field: either `Requires: <move>` (must have that move first) or `Replaces: <move>` (supersedes it).

**Alignment moves** in `alignments` are not `Move` records—they're short ethos descriptions. Fulfilling your chosen alignment once per session grants 1 XP.

**Bonds** are template sentences referencing other party members. Resolving a bond at end of session grants 1 XP and lets you write a new one.

### Spells

Spellcasters have two categories of spells:

- **Cantrips (Wizard) / Rotes (Cleric)**: Always prepared. Never count against the preparation limit.
- **Leveled spells**: Must be prepared before use.
  - **Wizard**: Chooses from spellbook during Prepare Spells. Total levels prepared ≤ character level + 1.
  - **Cleric**: Communed with deity during Commune. Total levels ≤ character level + 1; no spell above character level.

Casting rolls INT (Wizard) or WIS (Cleric). On 10+, the spell is retained. On 7–9, the spell is cast but one complication applies (lose the spell, draw attention, or take −1 ongoing to cast).

Spell files: `data/spells/wizard_spells.yaml`, `data/spells/cleric_spells.yaml`.

### Monsters

Monster stat blocks in `data/monsters/` are reference material (not currently seeded to the DB). Key fields:

- `damage`: Dice expression (e.g., `d8`, `2d6+1`)
- `hp`: Hit point total
- `armor`: Damage reduction value
- `tags`: Behavior keywords — scale tags are **solitary** (one powerful creature), **group** (3–6), **horde** (many weak, share HP pool)
- `moves`: Specific fictional actions available to the GM

### Data Files and Go/GraphQL Mapping

| File(s)                          | Seeds                              | GraphQL type                   |
| -------------------------------- | ---------------------------------- | ------------------------------ |
| `data/classes/*.yaml`            | Character classes with all moves   | `CharacterClass`, `Move`       |
| `data/player_moves.yaml`         | Shared player moves                | `Move` (type: `"basic"`)       |
| `data/spells/wizard_spells.yaml` | Wizard spell list                  | _(future `Spell` type)_        |
| `data/spells/cleric_spells.yaml` | Cleric spell list                  | _(future `Spell` type)_        |
| `data/monsters/*.yaml`           | Monster compendium                 | _(reference only, not seeded)_ |
| `data/equipment.yaml`            | Items, weapons, armor, magic items | _(reference only, not seeded)_ |
| `data/gm_moves.yaml`             | GM principles and move list        | _(reference only)_             |
| `data/fronts.yaml`               | Campaign front structure           | _(reference only)_             |
| `data/hirelings.yaml`            | Hireling rules and types           | _(reference only)_             |

Class moves (`race_moves`, `starting_moves`, `advanced_moves_*`) are seeded as `Move` records and linked to their `CharacterClass`. The `key` field on all entities uses `snake_case` derived from the name (e.g., `hack_and_slash`, `fighter`).
