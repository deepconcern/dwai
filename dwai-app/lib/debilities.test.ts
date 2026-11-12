import { describe, expect, test } from "bun:test";

import {
  debilityFor,
  debilityLabel,
  effectiveModifier,
  formatModifier,
} from "./debilities";

describe("debilityFor", () => {
  test("maps every ability to its debility", () => {
    expect(debilityFor("STRENGTH")).toBe("WEAK");
    expect(debilityFor("DEXTERITY")).toBe("SHAKY");
    expect(debilityFor("CONSTITUTION")).toBe("SICK");
    expect(debilityFor("INTELLIGENCE")).toBe("STUNNED");
    expect(debilityFor("WISDOM")).toBe("CONFUSED");
    expect(debilityFor("CHARISMA")).toBe("SCARRED");
  });
});

describe("effectiveModifier", () => {
  test("subtracts 1 when the ability's debility is active", () => {
    expect(effectiveModifier("STRENGTH", 2, ["WEAK"])).toBe(1);
  });

  test("ignores debilities for other abilities", () => {
    expect(effectiveModifier("STRENGTH", 2, ["SHAKY"])).toBe(2);
  });

  test("can take a modifier below -3", () => {
    expect(effectiveModifier("CHARISMA", -3, ["SCARRED"])).toBe(-4);
  });

  test("returns the base modifier with no debilities", () => {
    expect(effectiveModifier("WISDOM", 0, [])).toBe(0);
  });
});

describe("debilityLabel", () => {
  test("title-cases the enum value", () => {
    expect(debilityLabel("CONFUSED")).toBe("Confused");
  });
});

describe("formatModifier", () => {
  test("signs positive and negative modifiers", () => {
    expect(formatModifier(2)).toBe("+2");
    expect(formatModifier(0)).toBe("0");
    expect(formatModifier(-1)).toBe("-1");
  });
});
