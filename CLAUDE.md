# Dungeon World AI

A "D&D Beyond" for Dungeon World (character sheets, campaigns, GM tools, table chat), and later a playground for AI players and AI Game Masters. Private project, single maintainer, run locally.

See `ROADMAP.md` for milestones and current status. Each app has its own `CLAUDE.md` with app-specific guidance — keep cross-cutting concepts here and app-specific details there.

## Repository Layout

| Path        | What it is                                                             |
| ----------- | ---------------------------------------------------------------------- |
| `dwai-api/` | GraphQL API — Go, gqlgen, sqlc, PostgreSQL. Also owns the game data YAML. |
| `dwai-app/` | Web frontend — Next.js, React, Apollo Client, Tailwind. Uses Bun.      |

The API is the single source of truth for game rules and data. The frontend consumes it only via GraphQL and generates its types from the running API's schema, so **schema changes flow API → app**: change the `.graphqls`, regenerate the API, restart it, then run the app's codegen.

## Local Development

1. PostgreSQL 18+ (migrations use `uuidv7()`), with `DATABASE_URL` set for the API.
2. `dwai-api`: `go run .` — applies migrations on startup and serves GraphQL at `http://localhost:5000/graphql` (playground at `/playground`).
3. `dwai-app`: `bun install`, `bun run codegen` (API must be running), `bun dev` — serves `http://localhost:3000`. `NEXT_PUBLIC_GRAPHQL_URI` in `.env.local` points at the API.

## Workflow

- One branch per roadmap milestone (or a coherent slice of one), merged to `main` when its "done when" criteria in `ROADMAP.md` are met. Update `ROADMAP.md` in the same branch.
- New features ship with tests for the behavior they add.
- Git hooks (`lefthook.yml`, enabled with `lefthook install`): pre-commit formats, lints, and typechecks staged files; pre-push runs both test suites. Requires `lefthook` and `golangci-lint` on `PATH`.
- `make check` runs lint, typecheck, and tests for both apps; `make fmt` formats both. Run `make check` before considering work done.

## Dungeon World — Domain Model

Dungeon World is the tabletop RPG this app models. Read this before touching anything that represents game rules — API resolvers, character sheet UI, or AI prompts.

### Roll System

All resolution uses **2d6 + stat modifier**:

| Result    | Outcome                                                |
| --------- | ------------------------------------------------------ |
| 10+       | Full success                                           |
| 7–9       | Partial success (success with cost, or reduced effect) |
| 6− (miss) | Failure; the GM makes a move against the players, and the player marks XP |

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

**Max HP = class base HP + CON score** (the full score, not the modifier).

### Key Mechanics

- **Damage**: Attacker rolls their class damage die. Weapon/move bonuses may add flat damage or extra dice.
- **Armor**: Reduces incoming damage. Total armor = worn armor + shield + bonuses. Some attacks have **piercing X**, which ignores X armor.
- **Load**: Class base load + STR modifier. Each item has a weight; exceeding load imposes penalties.
- **Hold**: A resource gained from certain roll results, spent 1-for-1 to activate listed options later (e.g., Defend, Shapeshifter).
- **+N forward**: +N to your very next applicable roll, then gone.
- **+N ongoing**: +N to all applicable rolls until a stated condition ends it.
- **Ongoing spells**: While maintaining an ongoing spell, take −1 to cast further spells (cumulative). End ongoing spells at will or when the fiction demands.
- **Debilities**: Named stat penalties (Weak/STR, Shaky/DEX, Sick/CON, Stunned/INT, Confused/WIS, Scarred/CHA). Removed by the Recover move.
- **XP and levels**: XP is marked on a miss, and at End of Session for alignment, bonds, and group questions. Level up when XP ≥ current level + 7: spend that XP, gain a level, choose an advanced move, and raise one stat by 1.

### Move Anatomy

Every move has a fictional **trigger** ("When you…"). Only the trigger matters — if the fiction matches, the move happens. A move may have: which stat to roll (or none), a 10+ outcome, a 7–9 outcome (often "choose N from options"), an explicit miss outcome (otherwise the GM makes a move), a list of options, and a description for procedural, no-roll moves.

Move categories: **basic** (everyone), **special** (everyone, situational — e.g. Last Breath, Level Up), and **class** (race, starting, and advanced moves).

### Classes

Each class defines a base HP, a damage die, base load, looks, alignments, bond templates, starting gear, and moves:

- **Race moves**: one is chosen at character creation.
- **Starting moves**: every character of the class has these; some require a choice at creation (e.g. Signature Weapon).
- **Advanced moves**: chosen on level up, from a 2–5 list or (at level 6+) a 6–10 list. An advanced move may **require** another move first or **replace** one it supersedes.
- **Alignment**: a short ethos, not a move. Fulfilling it once per session grants 1 XP at End of Session.
- **Bonds**: template sentences naming other party members, so they only exist within a campaign. Resolving one at End of Session grants 1 XP and lets you write a new one.

### Spells

- **Cantrips (Wizard) / Rotes (Cleric)**: Always prepared. Never count against the preparation limit.
- **Leveled spells**: Must be prepared before use.
  - **Wizard**: Chooses from spellbook during Prepare Spells. Total levels prepared ≤ character level + 1.
  - **Cleric**: Communes with their deity. Total levels ≤ character level + 1; no spell above character level.

Casting rolls INT (Wizard) or WIS (Cleric). On 10+, the spell is cast and retained. On 7–9, it's cast but one complication applies (draw unwelcome attention, take −1 ongoing to cast, or forget the spell).

### GM Side

- **Monsters**: HP, armor, damage (a dice expression like `d8` or `2d6+1`), tags, and moves the GM can make. Scale tags: **solitary** (one powerful creature), **group** (3–6), **horde** (many weak).
- **GM moves and principles**: the GM never rolls. They make a move when players miss, look to them, or give a golden opportunity.
- **Fronts**: the GM's campaign-prep structure. A front groups related **dangers**. Each danger has an impulse and **grim portents** that advance toward an **impending doom**, plus stakes questions.
- **Hirelings**: NPCs with skills, loyalty, and a cost, recruited by players.
