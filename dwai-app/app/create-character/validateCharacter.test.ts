import { describe, expect, test } from "bun:test";

import {
  ABILITY_LABELS,
  CharacterClassRules,
  CharacterForm,
  STARTING_ABILITY_SCORES,
  validateCharacter,
} from "./validateCharacter";

const rules: CharacterClassRules = {
  gearGroups: [{ pick: 1 }, { pick: 2 }],
  startingMoves: [
    { creationOptions: [], key: "bend_bars", name: "Bend Bars" },
    {
      creationOptions: [
        { label: "Base", pick: 1 },
        { label: "Enhancement", pick: 2 },
      ],
      key: "signature_weapon",
      name: "Signature Weapon",
    },
  ],
};

const validForm = (): CharacterForm => ({
  abilityScores: ABILITY_LABELS.map(({ ability }, i) => ({
    ability,
    score: STARTING_ABILITY_SCORES[i],
  })),
  alignmentDescription: "Defend those weaker than you.",
  alignmentType: "good",
  gearChoices: [[1], [0, 2]],
  looks: [{ lookTypeKey: "eyes", value: "Hard eyes" }],
  moveOptions: { signature_weapon: [["axe"], ["hooks", "sharp"]] },
  name: "Gregor",
  raceMoveKey: "dwarf",
});

describe("validateCharacter", () => {
  test("accepts a complete form", () => {
    expect(validateCharacter(validForm(), rules)).toEqual([]);
  });

  test("asks for a class before anything class-specific", () => {
    expect(validateCharacter({ ...validForm(), name: "" }, null)).toEqual([
      "Enter a name.",
      "Choose a class.",
    ]);
  });

  test("names each unassigned ability", () => {
    const form = validForm();
    form.abilityScores[0].score = null;
    form.abilityScores[5].score = null;

    expect(validateCharacter(form, rules)).toEqual([
      "Assign a score to Strength.",
      "Assign a score to Charisma.",
    ]);
  });

  test("requires an alignment, a race, and non-empty looks", () => {
    const form = {
      ...validForm(),
      alignmentDescription: " ",
      alignmentType: "",
      looks: [{ lookTypeKey: "eyes", value: "" }],
      raceMoveKey: "",
    };

    expect(validateCharacter(form, rules)).toEqual([
      "Choose an alignment.",
      "Describe your alignment.",
      "Look 1 needs a value.",
      "Choose a race.",
    ]);
  });

  test("requires every gear and move creation pick", () => {
    const form = {
      ...validForm(),
      gearChoices: [[], [0]],
      moveOptions: { signature_weapon: [[], ["hooks"]] },
    };

    expect(validateCharacter(form, rules)).toEqual([
      "Choose 1 from starting gear group 1 (0 chosen).",
      "Choose 2 from starting gear group 2 (1 chosen).",
      "Signature Weapon: choose 1 Base (0 chosen).",
      "Signature Weapon: choose 2 Enhancement (1 chosen).",
    ]);
  });

  test("treats moves the player hasn't touched as having no picks", () => {
    const form = { ...validForm(), moveOptions: {} };

    expect(validateCharacter(form, rules)).toEqual([
      "Signature Weapon: choose 1 Base (0 chosen).",
      "Signature Weapon: choose 2 Enhancement (0 chosen).",
    ]);
  });
});
