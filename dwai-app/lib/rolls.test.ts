import { describe, expect, test } from "bun:test";

import { bandLabel, formatBreakdown, suggestedStat } from "./rolls";

describe("suggestedStat", () => {
  test("suggests the stat a move names", () => {
    expect(suggestedStat("STR")).toEqual({ ability: "STRENGTH", kind: "stat" });
    expect(suggestedStat("CHA (only if the item is special)")).toEqual({
      ability: "CHARISMA",
      kind: "stat",
    });
  });

  test("suggests bonds for Aid or Interfere", () => {
    expect(suggestedStat("Bond with them")).toEqual({ kind: "bond" });
  });

  test("suggests nothing for Last Breath and flat rolls", () => {
    expect(suggestedStat("nothing (+nothing—Death doesn't care)")).toEqual({
      kind: "none",
    });
    expect(suggestedStat("flat 2d6 (no stat)")).toEqual({ kind: "none" });
  });

  test("leaves the choice to the player when a move lists several stats", () => {
    expect(
      suggestedStat("STR (power through), DEX (get out of the way)"),
    ).toEqual({ kind: "choose" });
  });

  test("returns null for a move without a roll", () => {
    expect(suggestedStat(null)).toBeNull();
  });
});

describe("formatBreakdown", () => {
  test("lists the dice, each chosen modifier, and the total", () => {
    // The spec's example: 2d6 [4, 5] +2 STR -1 weak +1 forward = 11.
    expect(
      formatBreakdown({
        dice: [
          { dropped: false, sides: 6, value: 4 },
          { dropped: false, sides: 6, value: 5 },
        ],
        diceTotal: 9,
        modifiers: [
          { label: "STR", value: 2 },
          { label: "weak", value: -1 },
          { label: "forward (Aid from Lux)", value: 1 },
        ],
        total: 11,
      }),
    ).toBe("[4, 5] +2 STR -1 weak +1 forward (Aid from Lux) = 11");
  });

  test("shows an entered total in place of dice", () => {
    expect(
      formatBreakdown({ dice: null, diceTotal: 5, modifiers: [], total: 5 }),
    ).toBe("5 = 5");
  });

  test("marks dropped dice and doesn't repeat a flat bonus's label", () => {
    expect(
      formatBreakdown({
        dice: [
          { dropped: true, sides: 8, value: 3 },
          { dropped: false, sides: 8, value: 6 },
        ],
        diceTotal: 6,
        modifiers: [{ label: "+2", value: 2 }],
        total: 8,
      }),
    ).toBe("[~3~, 6] +2 = 8");
  });
});

describe("bandLabel", () => {
  test("names each band as the rules do", () => {
    expect(bandLabel("STRONG_HIT")).toBe("10+");
    expect(bandLabel("WEAK_HIT")).toBe("7–9");
    expect(bandLabel("MISS")).toBe("6−");
  });
});
