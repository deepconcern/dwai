import type { Ability, Debility } from "@/gql/graphql";

import { capitalize } from "./capitalize";

// Each debility gives -1 to one stat's modifier (docs/game/rules.md,
// "Debilities"). The API stores debilities but returns base modifiers; by
// Wyatt's decision in the Milestone 3 spec (#4), the -1 is applied here.
export const DEBILITY_ABILITIES: Record<Debility, Ability> = {
  CONFUSED: "WISDOM",
  SCARRED: "CHARISMA",
  SHAKY: "DEXTERITY",
  SICK: "CONSTITUTION",
  STUNNED: "INTELLIGENCE",
  WEAK: "STRENGTH",
};

// debilityFor returns the debility that affects ability.
export const debilityFor = (ability: Ability): Debility =>
  (Object.keys(DEBILITY_ABILITIES) as Debility[]).find(
    (d) => DEBILITY_ABILITIES[d] === ability,
  )!;

// debilityLabel turns WEAK into Weak.
export const debilityLabel = (debility: Debility): string =>
  capitalize(debility.toLowerCase());

// effectiveModifier is the modifier to roll with: the base modifier, minus 1
// if the ability's debility is active.
export const effectiveModifier = (
  ability: Ability,
  modifier: number,
  debilities: readonly Debility[],
): number =>
  debilities.includes(debilityFor(ability)) ? modifier - 1 : modifier;

// formatModifier formats a modifier with its sign: +2, 0, -1.
export const formatModifier = (modifier: number): string =>
  modifier > 0 ? `+${modifier}` : `${modifier}`;
