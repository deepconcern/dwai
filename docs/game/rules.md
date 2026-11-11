# Player Rules

The rules the app models on the player side. The authoritative text is the [SRD](https://www.dungeonworldsrd.com/); the data in `dwai-api/internal/data/` transcribes it.

## Rolls

All resolution is **2d6 + a stat modifier** (plus any forward/ongoing bonuses):

| Result | Outcome |
| ------ | ------- |
| 10+ | Full success |
| 7–9 | Partial success: success with a cost, a hard choice, or a reduced effect |
| 6− (miss) | Failure. The GM makes a move against the players, and the player marks 1 XP |

Some moves add a **12+** result with an exceptional outcome (usually from advanced moves).

### Bonuses

- **+N forward**: +N to the very next applicable roll, then gone.
- **+N ongoing**: +N to all applicable rolls until a stated condition ends it.
- **Hold**: a resource gained from some roll results (for example Defend, Spout Lore with certain moves, the Druid's Shapeshifter). Spent 1-for-1 later on the move's listed options.

## Stats

Six stats, each with a **score** (3–18) and a derived **modifier**:

| Score | 1–3 | 4–5 | 6–8 | 9–12 | 13–15 | 16–17 | 18 |
| ----- | --- | --- | --- | ---- | ----- | ----- | -- |
| Modifier | −3 | −2 | −1 | 0 | +1 | +2 | +3 |

| Stat | Abbrev | Primary use |
| ---- | ------ | ----------- |
| Strength | STR | Melee attacks (Hack and Slash), feats of force, load |
| Dexterity | DEX | Ranged attacks (Volley), agility, Defy Danger by speed |
| Constitution | CON | Max HP, endurance |
| Intelligence | INT | Spout Lore, Wizard spellcasting |
| Wisdom | WIS | Discern Realities, Cleric spellcasting, Druid and Ranger |
| Charisma | CHA | Parley, Bard magic, Paladin abilities |

At character creation the player assigns the array **16, 15, 13, 12, 9, 8** across the six stats.

### Debilities

Named conditions that give −1 to a stat's modifier until removed (by the Recover move or fiction):

| Debility | Stat |
| -------- | ---- |
| Weak | STR |
| Shaky | DEX |
| Sick | CON |
| Stunned | INT |
| Confused | WIS |
| Scarred | CHA |

## Derived Values

| Value | Formula |
| ----- | ------- |
| Max HP | Class base HP + CON **score** (the full score, not the modifier) |
| Max load | Class base load + STR **modifier** |
| Armor | Worn armor + shield + bonuses. **Piercing X** ignores X armor |
| Damage | The class damage die, plus weapon or move bonuses (flat damage or extra dice) |

When taking damage, subtract armor from the damage rolled (minimum 0), then subtract the rest from HP. At 0 HP the character is dying and makes the **Last Breath** move.

## Moves

Every move has a fictional **trigger** ("When you…"). If the fiction matches, the move happens, whether or not anyone named it. A move can have:

- the stat to roll (or none, for procedural moves),
- a 10+ outcome, a 7–9 outcome (often "choose N from options"), and an explicit miss outcome (otherwise the GM makes a move),
- a list of options,
- a description, for procedural no-roll moves.

### Categories

| Category | Who has it | Examples |
| -------- | ---------- | -------- |
| **Basic** | Everyone | Hack and Slash, Volley, Defy Danger, Defend, Spout Lore, Discern Realities, Parley, Aid or Interfere |
| **Special** | Everyone, situational | Last Breath, Encumbrance, Make Camp, Take Watch, Undertake a Perilous Journey, Level Up, End of Session, Carouse, Supply, Recover, Recruit, Outstanding Warrants, Bolster |
| **Class** | One class | Race moves, starting moves, advanced moves |

### Class Moves

- **Race moves**: one is chosen at character creation (for example Dwarf, Elf, Halfling, Human; the options vary by class).
- **Starting moves**: every character of the class has them. Some require a choice at creation (for example the Fighter's Signature Weapon, the Wizard's spellbook).
- **Advanced moves**: chosen on level up, from the 2–5 list or (at level 6+) either list. An advanced move may **require** another move first, or **replace** one it supersedes (the replaced move is lost).

## Alignment

A short ethos chosen at creation from the class's options (Good, Lawful, Neutral, Chaotic, Evil — not every class has all of them). Fulfilling it once in a session grants 1 XP at End of Session. It's a roleplay prompt, not a move.

## Bonds

Template sentences that name other party members ("___ has my back when things go wrong"). They only exist within a campaign. At End of Session a player may resolve a bond, gaining 1 XP and writing a new one. Aid or Interfere rolls +bond with the character being helped.

## XP and Levels

- Mark 1 XP on every miss.
- At **End of Session**, mark 1 XP for each "yes": did we learn something new and important about the world, overcome a notable monster or enemy, or loot a memorable treasure? Plus 1 XP for fulfilling your alignment, and 1 XP for each resolved bond.
- **Level Up** (during downtime) when XP ≥ current level + 7: subtract level + 7 from XP, gain a level, choose an advanced move, and raise one stat score by 1 (maximum 18). Max HP rises if CON changed.
- Maximum level is 10.

## Spells

- **Cantrips (Wizard) / Rotes (Cleric)**: always prepared, never count against the preparation limit.
- **Leveled spells** must be prepared before use:
  - **Wizard** (Prepare Spells): choose from the spellbook. Total levels prepared ≤ character level + 1.
  - **Cleric** (Commune): choose from the deity's spells. Total levels ≤ character level + 1, and no spell above the character's level.
- **Casting** rolls INT (Wizard) or WIS (Cleric). On 10+ the spell is cast and remains available. On 7–9 it's cast but the caster chooses one: draw unwelcome attention or put themselves in a spot, take −1 ongoing to cast spells until they next prepare, or forget the spell until they next prepare (or lose access, for Clerics).
- **Ongoing spells**: while maintaining one, take −1 to cast other spells (cumulative per ongoing spell).

Spell data is in `dwai-api/internal/data/spells/`.

## Character Creation

In order: choose a class, a race (its race move), a name, looks (one per look type), stats (the standard array), alignment, starting gear (defaults plus pick-N choices), and any choices starting moves require. HP starts at max. Bonds are written once the character joins a campaign.
