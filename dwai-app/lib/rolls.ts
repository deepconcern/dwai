import type { Ability, RollBand } from "@/gql/graphql";

import type { RollModifier, RolledDie } from "./dice";

/**
 * What a move suggests rolling, read from its `roll` text: a stat, the
 * number of bonds (Aid or Interfere), nothing (Last Breath), or a choice
 * (Defy Danger lists several). Only a suggestion: the player picks.
 */
export type StatSuggestion =
  | { ability: Ability; kind: "stat" }
  | { kind: "bond" }
  | { kind: "choose" }
  | { kind: "none" };

const ABBREVIATIONS: Record<string, Ability> = {
  CHA: "CHARISMA",
  CON: "CONSTITUTION",
  DEX: "DEXTERITY",
  INT: "INTELLIGENCE",
  STR: "STRENGTH",
  WIS: "WISDOM",
};

/** The short name of each ability, as rolls show it. */
export const ABILITY_ABBREVIATIONS = Object.fromEntries(
  Object.entries(ABBREVIATIONS).map(([abbreviation, ability]) => [
    ability,
    abbreviation,
  ]),
) as Record<Ability, string>;

/** Reads a move's `roll` text; null when the move has no roll. */
export const suggestedStat = (roll: string | null): StatSuggestion | null => {
  if (!roll) return null;

  const text = roll.trim().toLowerCase();
  if (text.startsWith("bond")) return { kind: "bond" };
  if (text.startsWith("nothing") || text.startsWith("flat")) {
    return { kind: "none" };
  }

  const named = roll.match(/\b(CHA|CON|DEX|INT|STR|WIS)\b/g) ?? [];
  if (named.length === 1 && roll.trim().startsWith(named[0])) {
    return { ability: ABBREVIATIONS[named[0]], kind: "stat" };
  }

  return { kind: "choose" };
};

/** A roll, as much as its breakdown needs. */
export type RollParts = {
  dice: readonly RolledDie[] | null | undefined;
  diceTotal: number;
  modifiers: readonly RollModifier[];
  total: number;
};

/**
 * The breakdown shown in chat: the dice (or the entered total), each
 * modifier the player chose, and the total. Dropped dice are marked ~like
 * this~.
 */
export const formatBreakdown = ({
  dice,
  diceTotal,
  modifiers,
  total,
}: RollParts): string => {
  const parts = [
    dice
      ? `[${dice.map((d) => (d.dropped ? `~${d.value}~` : d.value)).join(", ")}]`
      : `${diceTotal}`,
  ];

  for (const { label, value } of modifiers) {
    const signed = value < 0 ? `${value}` : `+${value}`;
    parts.push(label === signed ? signed : `${signed} ${label}`);
  }

  return `${parts.join(" ")} = ${total}`;
};

/** A result band as the rules write it. */
export const bandLabel = (band: RollBand): string =>
  ({ MISS: "6−", STRONG_HIT: "10+", WEAK_HIT: "7–9" })[band];
