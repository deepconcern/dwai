import { describe, expect, test } from "bun:test";

import { loadWarning } from "./loadWarning";

describe("loadWarning", () => {
  test("is null up to max load", () => {
    expect(loadWarning(0, 12)).toBeNull();
    expect(loadWarning(12, 12)).toBeNull();
  });

  test("warns over max load, with how much", () => {
    expect(loadWarning(15, 12)).toBe(
      "Over max load by 3. The Encumbrance move applies.",
    );
  });
});
