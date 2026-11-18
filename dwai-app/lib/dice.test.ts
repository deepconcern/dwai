import { describe, expect, test } from "bun:test";

import { parseDamage, rollDamage, rollDie, rollMove } from "./dice";

/** A fake die that returns the given values in order. */
const fixed = (...values: number[]) => {
  const queue = [...values];
  return () => queue.shift()!;
};

describe("rollDie", () => {
  test("returns a face of the die", () => {
    for (let i = 0; i < 200; i++) {
      const value = rollDie(6);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe("rollMove", () => {
  test("rolls two six-sided dice", () => {
    expect(rollMove(fixed(4, 5))).toEqual([
      { dropped: false, sides: 6, value: 4 },
      { dropped: false, sides: 6, value: 5 },
    ]);
  });
});

describe("parseDamage", () => {
  test("reads a bare class die", () => {
    expect(parseDamage("d8")).toEqual({
      ok: true,
      terms: [{ count: 1, keep: "all", sides: 8, type: "dice" }],
    });
  });

  test("reads extra dice and a flat bonus", () => {
    expect(parseDamage("d10 + 1d4 + 2")).toEqual({
      ok: true,
      terms: [
        { count: 1, keep: "all", sides: 10, type: "dice" },
        { count: 1, keep: "all", sides: 4, type: "dice" },
        { type: "flat", value: 2 },
      ],
    });
  });

  test("reads a flat penalty", () => {
    expect(parseDamage("d6-1")).toEqual({
      ok: true,
      terms: [
        { count: 1, keep: "all", sides: 6, type: "dice" },
        { type: "flat", value: -1 },
      ],
    });
  });

  test("reads best of and worst of", () => {
    expect(parseDamage("b[2d8]")).toEqual({
      ok: true,
      terms: [{ count: 2, keep: "best", sides: 8, type: "dice" }],
    });
    expect(parseDamage("w[2d6]")).toEqual({
      ok: true,
      terms: [{ count: 2, keep: "worst", sides: 6, type: "dice" }],
    });
  });

  test("rejects dice the API won't take", () => {
    expect(parseDamage("d7").ok).toBe(false);
    expect(parseDamage("11d6").ok).toBe(false);
  });

  test("rejects text that isn't an expression", () => {
    expect(parseDamage("").ok).toBe(false);
    expect(parseDamage("fireball").ok).toBe(false);
    expect(parseDamage("d8 +").ok).toBe(false);
  });
});

describe("rollDamage", () => {
  test("rolls each die and keeps flat terms as modifiers", () => {
    const parsed = parseDamage("d10+1d4+2");
    if (!parsed.ok) throw new Error(parsed.error);

    expect(rollDamage(parsed.terms, fixed(7, 3))).toEqual({
      dice: [
        { dropped: false, sides: 10, value: 7 },
        { dropped: false, sides: 4, value: 3 },
      ],
      modifiers: [{ label: "+2", value: 2 }],
    });
  });

  test("best of drops the lower die", () => {
    const parsed = parseDamage("b[2d8]");
    if (!parsed.ok) throw new Error(parsed.error);

    expect(rollDamage(parsed.terms, fixed(3, 6)).dice).toEqual([
      { dropped: true, sides: 8, value: 3 },
      { dropped: false, sides: 8, value: 6 },
    ]);
  });

  test("worst of drops the higher die", () => {
    const parsed = parseDamage("w[2d8]");
    if (!parsed.ok) throw new Error(parsed.error);

    expect(rollDamage(parsed.terms, fixed(3, 6)).dice).toEqual([
      { dropped: false, sides: 8, value: 3 },
      { dropped: true, sides: 8, value: 6 },
    ]);
  });

  test("flat terms alone become modifiers", () => {
    const parsed = parseDamage("3");
    if (!parsed.ok) throw new Error(parsed.error);

    expect(rollDamage(parsed.terms, fixed())).toEqual({
      dice: [],
      modifiers: [{ label: "+3", value: 3 }],
    });
  });
});
