import { describe, expect, test } from "bun:test";

import { capitalize } from "./capitalize";

describe("capitalize", () => {
  test("uppercases the first letter", () => {
    expect(capitalize("good")).toBe("Good");
  });

  test("leaves the rest of the string alone", () => {
    expect(capitalize("chaotic NEUTRAL")).toBe("Chaotic NEUTRAL");
  });

  test("returns an empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });
});
