import { Ability } from "@/gql/graphql";

// Mirrors the API's ValidateCreateCharacterInput (models/character_validation.go),
// which is authoritative. Keep the rules and messages in sync with it.

export const ABILITY_LABELS: { ability: Ability; label: string }[] = [
  { ability: "STRENGTH", label: "Strength" },
  { ability: "DEXTERITY", label: "Dexterity" },
  { ability: "CONSTITUTION", label: "Constitution" },
  { ability: "INTELLIGENCE", label: "Intelligence" },
  { ability: "WISDOM", label: "Wisdom" },
  { ability: "CHARISMA", label: "Charisma" },
];

export const ALIGNMENTS = ["chaotic", "evil", "good", "lawful", "neutral"];

export const STARTING_ABILITY_SCORES = [16, 15, 13, 12, 9, 8];

export type CharacterForm = {
  abilityScores: { ability: Ability; score: number | null }[];
  alignmentDescription: string;
  alignmentType: string;
  gearChoices: number[][];
  looks: { lookTypeKey: string; value: string }[];
  moveOptions: { [moveKey: string]: string[][] };
  name: string;
  raceMoveKey: string;
};

/** The parts of the chosen class that decide which picks are required. */
export type CharacterClassRules = {
  gearGroups: { pick: number }[];
  startingMoves: {
    creationOptions: { label: string; pick: number }[];
    key: string;
    name: string;
  }[];
};

/**
 * Returns a message for every problem with the form, or an empty array if
 * it's ready to submit. `rules` is null until a class is chosen.
 */
export const validateCharacter = (
  form: CharacterForm,
  rules: CharacterClassRules | null,
): string[] => {
  const errors: string[] = [];

  if (form.name.trim() === "") errors.push("Enter a name.");

  if (!rules) {
    errors.push("Choose a class.");
    return errors;
  }

  for (const { ability, label } of ABILITY_LABELS) {
    const entry = form.abilityScores.find((a) => a.ability === ability);
    if (entry?.score == null) errors.push(`Assign a score to ${label}.`);
  }

  if (!ALIGNMENTS.includes(form.alignmentType.toLowerCase())) {
    errors.push("Choose an alignment.");
  }
  if (form.alignmentDescription.trim() === "") {
    errors.push("Describe your alignment.");
  }

  form.looks.forEach((look, i) => {
    if (look.value.trim() === "") errors.push(`Look ${i + 1} needs a value.`);
  });

  if (form.raceMoveKey === "") errors.push("Choose a race.");

  rules.gearGroups.forEach(({ pick }, i) => {
    const count = form.gearChoices[i]?.length ?? 0;
    if (count !== pick) {
      errors.push(
        `Choose ${pick} from starting gear group ${i + 1} (${count} chosen).`,
      );
    }
  });

  for (const move of rules.startingMoves) {
    move.creationOptions.forEach(({ label, pick }, i) => {
      const count = form.moveOptions[move.key]?.[i]?.length ?? 0;
      if (count !== pick) {
        errors.push(`${move.name}: choose ${pick} ${label} (${count} chosen).`);
      }
    });
  }

  return errors;
};
