import { describe, expect, test } from "bun:test";

import { levelUpAbilityOptions } from "./levelUpAbilities";

describe("levelUpAbilityOptions", () => {
  test("shows each score's increase", () => {
    expect(levelUpAbilityOptions([{ ability: "STRENGTH", score: 16 }])).toEqual(
      [{ disabled: false, label: "Strength (16 → 17)", value: "STRENGTH" }],
    );
  });

  test("disables scores already at 18", () => {
    const [option] = levelUpAbilityOptions([{ ability: "WISDOM", score: 18 }]);
    expect(option.disabled).toBe(true);
    expect(option.label).toBe("Wisdom (18 → 18)");
  });
});
