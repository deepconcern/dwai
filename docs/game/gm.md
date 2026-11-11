# The GM Side

The GM data is in `dwai-api/internal/data/` (`gm_moves.yaml`, `fronts.yaml`, `hirelings.yaml`, `monsters/*.yaml`). Today it's reference-only. Milestones 7, 8, 12, and 13 build features on it, and it's the core of the future AI GM's skills.

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
| Damage | A dice expression (`d8`, `2d6+1`, `b[2d10]` for best-of) |
| Tags | Organization (**solitary**, **group** of 3–6, **horde**), size, and qualities (stealthy, intelligent, amorphous, ...) |
| Attack tags | Range and properties (close, reach, messy, piercing X, ...) |
| Instinct | What it wants; the GM plays it toward this |
| Moves | Things the GM can do with it when making a move |
| Special qualities | Notable traits (e.g. "Plant", "Incorporeal") |

The compendium (`monsters/*.yaml`) groups monsters by setting: caverns, depths, experiments, folk, hordes, planes, swamp, undead, woods.

## Fronts

The GM's campaign prep. Fronts are built between sessions, not during play.

- A **campaign front** spans the whole campaign; **adventure fronts** cover the next few sessions.
- Each front groups 1–3 **dangers**. A danger has a type (e.g. ambitious organization, planar force, cursed place), an **impulse** (what drives it), and **grim portents**: a short ordered list of events that happen if nobody intervenes, ending in the **impending doom**.
- Each front has **stakes questions**: things the GM wants to find out in play ("Will the baron survive?"). They're answered by play, not by the GM.
- The GM checks off grim portents as the fiction advances them.

## Hirelings

NPCs recruited with the Recruit move. A hireling has **skills** (each with a rank, usually 1–10, often standing in for a class ability: protector, tracker, adept, ...), **loyalty**, and a **cost** (what they want: money, glory, fame, ...). Their HP and damage matter little; they're GM characters who can become replacement player characters.
