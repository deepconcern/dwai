# The GM Side

The GM data is in `dwai-api/internal/data/` (`gm_moves.yaml`, `fronts.yaml`, `hirelings.yaml`, `monsters/*.yaml`). The monster compendium (Milestone 7) and the danger template in `fronts.yaml` (Milestone 8) are used by the app; the GM moves and hirelings are reference only for now. Milestones 12 and 13 build more on it, and it's the core of the future AI GM's skills.

## How to GM

The GM's job each moment: **describe the situation, follow the rules, make moves, exploit your prep.**

### Agenda

What the GM aims for, always:

- Portray a fantastic world
- Fill the characters' lives with adventure
- Play to find out what happens (don't plan a plot; let the dice and players decide)

### Principles

How the GM pursues the agenda: draw maps, leave blanks; address the characters, not the players; embrace the fantastic; make a move that follows; never speak the name of your move; give every monster life; name every person; ask questions and use the answers; be a fan of the characters; think dangerous; begin and end with the fiction; think offscreen too.

## GM Moves

**The GM never rolls.** The GM makes a move:

- when a player **misses** (6−),
- when players **look to the GM** to see what happens,
- when players hand the GM a **golden opportunity**.

A **soft** move sets up a threat the players can react to. A **hard** move has immediate consequences (usually after a miss, or an ignored soft move). The GM moves are: use a monster, danger, or location move; reveal an unwelcome truth; show signs of an approaching threat; deal damage; use up their resources; turn their move back on them; separate them; give an opportunity that fits a class's abilities; show a downside to their class, race, or equipment; offer an opportunity, with or without cost; put someone in a spot; tell them the requirements or consequences and ask. Dungeon moves add: change the environment, point to a looming threat, introduce a new faction or type of creature, use a threat from an existing one, make them backtrack, present riches at a price, present a challenge to one of the characters.

After every GM move, ask "What do you do?"

## Monsters

A monster's stat block:

| Field | Meaning |
| ----- | ------- |
| HP, armor | Usually small numbers (3–20 HP, 0–4 armor) |
| Damage | A dice expression (`d8`, `2d6+1`, `b[2d10]` for best of two, `w[2d8]` for worst of two) |
| Tags | Organization (**solitary**, **group** of 3–6, **horde**), size, and qualities (stealthy, intelligent, amorphous, ...) |
| Attack tags | Range and properties (close, reach, messy, piercing X, ...) |
| Instinct | What it wants; the GM plays it toward this |
| Moves | Things the GM can do with it when making a move |
| Special qualities | Notable traits (e.g. "Plant", "Incorporeal") |

The compendium (`monsters/*.yaml`) groups monsters by setting: caverns, depths, experiments, folk, hordes, planes, swamp, undead, woods. Each file has a `key` (its file name), and each monster a stable `key` (snake_case of its name, e.g. `cave_rat`). An attack is split into `name`, `damage`, `piercing` (omitted when 0), `ignores_armor` (omitted when false), and `tags`. Twelve entries have no HP, armor, or attack: the folk NPCs (Acolyte, Fool, Hedge Wizard, High Priest, Merchant, Noble, Peasant, Spy, Tinkerer), the Tarrasque, the Concept Elemental, and the Word Demon. The GM gives them HP when adding them to play.

Monsters take damage like characters: the damage minus armor (reduced by piercing, or skipped when the damage ignores armor), never below 0 HP. In the app, monsters in play and their HP are the GM's alone (see [docs/app/domain-model.md](../app/domain-model.md)).

## Fronts

The GM's campaign prep. Fronts are built between sessions, not during play.

- A **campaign front** spans the whole campaign; **adventure fronts** cover the next few sessions.
- Each front groups 1–3 **dangers**. A danger has a type (e.g. ambitious organization, planar force, cursed place), an **impulse** (what drives it), and **grim portents**: a short ordered list of events that happen if nobody intervenes, ending in the **impending doom**.
- Each front has **stakes questions**: things the GM wants to find out in play ("Will the baron survive?"). They're answered by play, not by the GM.
- The GM checks off grim portents as the fiction advances them.

The template in `fronts.yaml` lists the SRD's five danger categories, each with its moves and its types (and each type's impulse), plus six kinds of impending doom:

| Category | Types (impulse) |
| -------- | --------------- |
| Ambitious Organizations | Misguided Good (to do what is "right" no matter the cost), Thieves Guild (to take by subterfuge), Cult (to infest from within), Religious Organization (to establish and follow doctrine), Corrupt Government (to maintain the status quo), Cabal (to absorb those in power, to grow) |
| Planar Forces | God (to gather worshippers), Demon Prince (to open the gates of Hell), Elemental Lord (to tear down creation to its component parts), Force of Chaos (to destroy all semblance of order), Choir of Angels (to pass judgement), Construct of Law (to eliminate perceived disorder) |
| Arcane Enemies | Lord of the Undead (to seek true immortality), Power-mad Wizard (to seek magical power), Sentient Artifact (to find a worthy wielder), Ancient Curse (to ensnare), Chosen One (to fulfill or resent their destiny), Dragon (to hoard gold and jewels, to protect the clutch) |
| Hordes | Wandering Barbarians (to grow strong, to drive their enemies before them), Humanoid Vermin (to breed, to multiply and consume), Underground Dwellers (to defend the complex from outsiders), Plague of the Undead (to spread) |
| Cursed Places | Abandoned Tower (to draw in the weak-willed), Unholy Ground (to spawn evil), Elemental Vortex (to grow, to tear apart reality), Dark Portal (to disgorge demons), Shadowland (to corrupt or consume the living), Place of Power (to be controlled or tamed) |

Impending dooms: Tyranny, Pestilence, Destruction, Usurpation, Impoverishment, Rampant Chaos.

In the app, fronts are an optional organizer for the GM: the template only suggests, and the GM writes their own types, impulses, and dooms. The rules' limits (1 to 3 dangers per front, a few portents per danger) are hints, not enforced. Fronts, dangers, and encounters are the GM's alone; the GM can reveal a danger and its portents to the players (see [docs/app/domain-model.md](../app/domain-model.md)).

## Hirelings

NPCs recruited with the Recruit move. A hireling has **skills** (each with a rank, usually 1–10, often standing in for a class ability: protector, tracker, adept, ...), **loyalty**, and a **cost** (what they want: money, glory, fame, ...). Their HP and damage matter little; they're GM characters who can become replacement player characters.
