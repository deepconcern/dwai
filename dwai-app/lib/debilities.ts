import type { Ability, Debility } from "@/gql/graphql";

import { capitalize } from "./capitalize";

/**
 * The stat each debility affects. Each gives -1 to that stat's modifier
 * (docs/game/rules.md, "Debilities"). The API stores debilities but returns
 * base modifiers; by decision in the Milestone 3 spec (#4), the -1 is a
 * display helper applied here.
 */
export const DEBILITY_ABILITIES: Record<Debility, Ability> = {
  CONFUSED: "WISDOM",
  SCARRED: "CHARISMA",
  SHAKY: "DEXTERITY",
  SICK: "CONSTITUTION",
  STUNNED: "INTELLIGENCE",
  WEAK: "STRENGTH",
};

/** Returns the debility that affects `ability`. */
export const debilityFor = (ability: Ability): Debility =>
  (Object.keys(DEBILITY_ABILITIES) as Debility[]).find(
    (d) => DEBILITY_ABILITIES[d] === ability,
  )!;

/** Turns a debility's enum value into its display name (`WEAK` → `Weak`). */
export const debilityLabel = (debility: Debility): string =>
  capitalize(debility.toLowerCase());

/**
 * Returns the modifier to roll with: the base modifier from the API, minus 1
 * if the ability's debility is active.
 */
export const effectiveModifier = (
  ability: Ability,
  modifier: number,
  debilities: readonly Debility[],
): number =>
  debilities.includes(debilityFor(ability)) ? modifier - 1 : modifier;

/** Formats a modifier with its sign: `+2`, `0`, `-1`. */
export const formatModifier = (modifier: number): string =>
  modifier > 0 ? `+${modifier}` : `${modifier}`;
