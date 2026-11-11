# Classes

Each class defines base HP, a damage die, base load, looks, names by race, alignments, bond templates, starting gear, and moves. The full data is in `dwai-api/internal/data/classes/*.yaml`; this table is a quick reference.

| Class | Base HP | Damage | Base load | Key stat | Starting moves |
| ----- | ------- | ------ | --------- | ------------------ | --------------------- |
| Bard | 6 | d6 | 9 | CHA | Arcane Art, Bardic Lore, Charming and Open, A Port in the Storm |
| Cleric | 8 | d6 | 10 | WIS | Deity, Divine Guidance, Turn Undead, Commune, Cast a Spell (rotes + leveled spells) |
| Druid | 6 | d6 | 6 | WIS | Born of the Soil, By Nature Sustained, Spirit Tongue, Shapeshifter (hold spent on animal moves), Studied Essence |
| Fighter | 10 | d10 | 12 | STR | Bend Bars Lift Gates, Armored, Signature Weapon (customized at creation) |
| Paladin | 10 | d10 | 12 | CHA | Lay on Hands, Armored, I Am the Law, Quest (vows and boons) |
| Ranger | 8 | d8 | 11 | DEX / WIS | Hunt and Track, Called Shot, Animal Companion, Command |
| Thief | 6 | d8 | 9 | DEX | Trap Expert, Tricks of the Trade, Backstab, Flexible Morals, Poisoner |
| Wizard | 4 | d4 | 7 | INT | Spellbook, Prepare Spells, Cast a Spell (cantrips + leveled spells), Spell Defense, Ritual |

Remember: Max HP = base HP + CON **score**; max load = base load + STR **modifier**.

## Starting Move Choices

Some starting moves need a choice during creation. The API models these as **move creation options** (`move_creation_option_choices` in the database). Today they're defined in the class YAML under a move's `creation_options` for: Bard (Bardic Lore), Cleric (Deity), Druid (Born of the Soil), Fighter (Signature Weapon), Paladin (Quest), and Ranger (Animal Companion). When adding a class feature that needs a choice at creation, extend this mechanism rather than inventing a new one.

## Spells

Wizard and Cleric spell lists live in `dwai-api/internal/data/spells/`. They're loaded but not yet exposed in GraphQL (Roadmap Milestone 3).
