# Roadmap

Each milestone is one or more branches merged to `main`. A milestone is done when every "done when" box is checked. Update this file in the same branch as the work.

## Status (2026-10-10)

- **Done**: Milestone 1 — character creation (class, race, looks, alignment, stats, move creation options, starting gear) with validation in both the API and the form; a read-only character sheet (basic info, moves, equipment, armor/weapons); the legacy prototype schema removed; format/lint/typecheck/test tooling with git hooks.
- **Next**: Milestone 2 (Test Foundation).

---

## Phase 1 — Human Play

### 1. Wrap Up Character Creation ✓

- [x] Commit the `player-equipment` work and merge it to `main`
- [x] Remove or stub out the legacy `Game` / `Message` / `Scenario` schema and the empty pages (campaigns will replace them)
- [x] Creation form validation (stat array fully assigned, all required picks made) with clear errors

### 2. Test Foundation ← current

Make adding tests cheap before the rules logic grows.

- [ ] API integration tests: a real Postgres (a dedicated test database or testcontainers-go), migrations applied, requests sent through the gqlgen handler
- [ ] Cover character creation end to end, including starting-gear resolution and merging
- [ ] Unit tests for pure rules logic (item field resolution, ability modifiers)
- [x] One command runs everything (`make check`) and git hooks run format/lint/typecheck/tests
- [ ] Integration tests run from `make check` (or a separate `make test-integration` if they need Postgres)
- [ ] Optional: a Playwright smoke test that creates a character through the UI

### 3. Character Sheet (State Management)

Everything a player changes during play. Bonds wait for campaigns.

- [ ] Max HP shown alongside current HP; take damage (armor applied) and heal
- [ ] Inventory: add (from a template or custom), remove, change count, wear/unwear; load vs. max load
- [ ] Gold adjustments
- [ ] Debilities
- [ ] XP; level up (spend XP, +1 stat, choose an advanced move respecting requires/replaces)
- [ ] Expose advanced moves in GraphQL
- [ ] Spells for Wizard and Cleric: load the spell data, spellbook, prepare spells, level limits
- [ ] Move all derived stats (armor, load, max HP) to the API so the frontend and the future AI agents share one implementation

### 4. Accounts & Auth

Every later milestone needs to know who owns what.

- [ ] Users table; register, log in, log out (local only: email + password with argon2/bcrypt hashing and a server-side session cookie)
- [ ] Characters belong to a user; the API enforces ownership
- [ ] Frontend: login/register pages, auth-aware navigation, redirect when logged out

### 5. Campaigns

- [ ] Create a campaign (the creator becomes its GM)
- [ ] Invite players (invite link/code); a player attaches one of their characters
- [ ] Bonds: written against other characters in the same campaign
- [ ] The GM views every character sheet in the campaign (read-only), and can adjust HP/XP if desired
- [ ] End of Session flow: alignment, bonds, and group questions → XP

### 6. Table Chat & Rolls

The core loop of play, and the interface the AI agents will use later.

- [ ] Campaign chat with realtime delivery (gqlgen subscriptions over WebSocket)
- [ ] Roll a move from the sheet; the API rolls 2d6 + modifier (forward/ongoing applied) and posts the result to chat
- [ ] Damage rolls posted to chat
- [ ] GM-only messages / whispers

### 7. Monsters

Before fronts, because encounters are built from monsters.

- [ ] Browse the monster compendium (`data/monsters`)
- [ ] GM creates custom monsters (the full stat block), optionally copied from a compendium entry
- [ ] Track monster HP during play

### 8. Fronts, Dangers & Encounters

- [ ] Fronts with dangers, impulses, grim portents (checkable), impending dooms, and stakes
- [ ] Encounters: groups of monsters tied to a danger or location
- [ ] GM-only visibility; reveal to players when appropriate

---

## Phase 2 — AI

AI agents act through the same API mutations humans use (roll a move, post to chat, update a sheet). They get no special paths, which keeps them honest and easy to test.

### 9. AI Foundation

- [ ] Claude API client in the API, with the key in env; per-campaign usage/cost logging
- [ ] A tool layer that exposes game actions (read sheet, roll move, post message, look up rules) as LLM tools
- [ ] Context building: rules summary + campaign state + recent chat, with summarization for long campaigns

### 10. AI Character Creator

The smallest AI feature, so it proves out the foundation.

- [ ] Generate a valid `CreateCharacterInput` from a prompt ("a grumpy dwarf fighter") and create the character through the same mutation
- [ ] Review/edit before saving

### 11. AI Players

- [ ] Add an AI-controlled character to a campaign
- [ ] The AI player responds in chat when addressed or when the GM "looks to" them, rolls moves, and updates its own sheet
- [ ] Per-character persona/instructions

### 12. AI Campaign Creator

- [ ] Generate fronts, dangers, and encounters (using the compendium or new monsters) from a pitch
- [ ] The GM reviews and edits before use

### 13. AI Game Master

- [ ] AI GM runs a campaign through chat: follows the GM principles, makes GM moves on misses, and advances grim portents
- [ ] Uses the campaign's fronts/encounters and runs monsters
- [ ] Users can create a campaign run by an AI GM, including one where every player is also AI
