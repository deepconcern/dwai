import type { Ability } from "@/gql/graphql";

import { capitalize } from "./capitalize";

/** The highest an ability score can be raised to. */
export const MAX_ABILITY_SCORE = 18;

/**
 * Builds the ability choices for leveling up, with scores already at 18
 * disabled. A display helper: the API enforces the limit too.
 */
export const levelUpAbilityOptions = (
  abilities: readonly { ability: Ability; score: number }[],
) =>
  abilities.map(({ ability, score }) => ({
    disabled: score >= MAX_ABILITY_SCORE,
    label: `${capitalize(ability.toLowerCase())} (${score} → ${Math.min(score + 1, MAX_ABILITY_SCORE)})`,
    value: ability,
  }));
