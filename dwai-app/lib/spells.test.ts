import { describe, expect, test } from "bun:test";

import { spellbookWarning, totalSpellLevels } from "./spells";

describe("spellbookWarning", () => {
  test("is null when the size matches, or for non-Wizards", () => {
    expect(spellbookWarning(3, 3)).toBeNull();
    expect(spellbookWarning(0, null)).toBeNull();
  });

  test("asks for more spells when short", () => {
    expect(spellbookWarning(1, 3)).toBe(
      "Your spellbook has 1 of 3 spells: add 2 more.",
    );
  });

  test("notes a spellbook with extra spells", () => {
    expect(spellbookWarning(5, 4)).toBe(
      "Your spellbook has 5 spells, more than the 4 expected at your level.",
    );
  });
});

describe("totalSpellLevels", () => {
  const spells = [
    { key: "magic_missile", level: 1 },
    { key: "fireball", level: 3 },
    { key: "light", level: 0 },
  ];

  test("adds up the selected spells' levels", () => {
    expect(totalSpellLevels(spells, ["magic_missile", "fireball"])).toBe(4);
  });

  test("is 0 with nothing selected", () => {
    expect(totalSpellLevels(spells, [])).toBe(0);
  });
});
