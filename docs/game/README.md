# Dungeon World

[Dungeon World](https://www.dungeon-world.com/) (Sage LaTorra and Adam Koebel, 2012) is a fantasy tabletop RPG built on the *Powered by the Apocalypse* engine. It takes the trappings of classic D&D (classes, hit points, dungeons, monsters) and runs them on a lighter, fiction-first system: players describe what their characters do, and when that matches a **move**, they roll. The full rules are free under CC BY 3.0 at the [Dungeon World SRD](https://www.dungeonworldsrd.com/), and [Wikipedia](https://en.wikipedia.org/wiki/Dungeon_World) has a short history.

Read these pages before touching anything that represents game rules: API resolvers and validation, character sheet UI, game data YAML, or AI prompts and skills.

| Page | Covers |
| ---- | ------ |
| [rules.md](rules.md) | Rolls, stats, HP, damage, armor, load, moves, XP and levels, bonds, spells — everything on the player side |
| [classes.md](classes.md) | The eight classes: base HP, damage die, load, and what makes each one mechanically distinct |
| [gm.md](gm.md) | The GM side: agenda, principles, GM moves, monsters, fronts and dangers, hirelings |
| [glossary.md](glossary.md) | Short definitions of every term the code and docs use |

## How It Differs from D&D

These differences shape the app, so keep them in mind when a D&D habit suggests otherwise:

- **The GM never rolls.** Players roll for everything, including defense. Monsters deal damage when the GM makes a move, usually after a player misses.
- **Fiction first.** A move triggers when the fiction matches its trigger, not when a player declares it. The app offers moves to roll, but it can't decide when the fiction triggers one.
- **No initiative, turns, or action economy.** Play is a conversation. Turn-taking (relevant for AI players) is a soft spotlight, not a rule.
- **Three outcome bands, not pass/fail.** 10+ is a success, 7–9 a success with a cost or a choice, 6− a miss where the GM makes a move. Misses also mark XP.
- **Small numbers.** Modifiers run −3 to +3 and there are no proficiency bonuses or skill lists.
- **Bonds tie characters together.** They only exist within a party, so they belong to campaigns, not to standalone characters.

## Where the Data Comes From

The rules content (classes, moves, items, spells, monsters, GM moves, fronts, hirelings) is transcribed from the SRD into YAML in [`dwai-api/internal/data/`](../../dwai-api/internal/data/). That YAML is the source of truth for game content in this app; [`docs/app/domain-model.md`](../app/domain-model.md) explains how it's loaded and exposed.
