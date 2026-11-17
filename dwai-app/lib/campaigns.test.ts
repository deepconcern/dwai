import { describe, expect, test } from "bun:test";

import { endOfSessionXp, fillBondTemplate, needsReason } from "./campaigns";

describe("fillBondTemplate", () => {
  test("fills a leading blank", () => {
    expect(
      fillBondTemplate(
        "_______________ owes me their life, whether they admit it or not.",
        "Ana",
      ),
    ).toBe("Ana owes me their life, whether they admit it or not.");
  });

  test("fills a trailing blank", () => {
    expect(
      fillBondTemplate("I have sworn to protect _______________.", "Ana"),
    ).toBe("I have sworn to protect Ana.");
  });

  test("leaves text without a blank alone", () => {
    expect(fillBondTemplate("Keep a single _ underscore.", "Ana")).toBe(
      "Keep a single _ underscore.",
    );
  });
});

describe("needsReason", () => {
  test("an unchecked box never needs one", () => {
    expect(needsReason({ checked: false, reason: "" })).toBe(false);
  });

  test("a checked box needs a non-blank reason", () => {
    expect(needsReason({ checked: true, reason: "  " })).toBe(true);
    expect(needsReason({ checked: true, reason: "Found the map" })).toBe(false);
  });
});

describe("endOfSessionXp", () => {
  test("adds group yeses, alignment, and a resolved bond", () => {
    expect(endOfSessionXp(0, false, false)).toBe(0);
    expect(endOfSessionXp(2, false, false)).toBe(2);
    expect(endOfSessionXp(3, true, true)).toBe(5);
  });
});
