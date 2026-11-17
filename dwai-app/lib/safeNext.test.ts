import { describe, expect, test } from "bun:test";

import { loginHref, safeNext } from "./safeNext";

describe("safeNext", () => {
  test.each([
    ["/", "/"],
    ["/character/123", "/character/123"],
    ["/create-character?x=1#y", "/create-character?x=1#y"],
  ])("keeps the site path %p", (next, want) => {
    expect(safeNext(next)).toBe(want);
  });

  test.each([
    [undefined],
    [null],
    [""],
    [["/a", "/b"]],
    ["https://evil.com"],
    ["evil.com"],
    ["//evil.com"],
    ["/\\evil.com"],
    ["/\t/evil.com"],
    ["/\n/evil.com"],
    ["javascript:alert(1)"],
  ])("replaces %p with /", (next) => {
    expect(safeNext(next)).toBe("/");
  });
});

describe("loginHref", () => {
  test("omits next for the home page", () => {
    expect(loginHref("/")).toBe("/login");
  });

  test("encodes the path to return to", () => {
    expect(loginHref("/character/1?tab=spells")).toBe(
      "/login?next=%2Fcharacter%2F1%3Ftab%3Dspells",
    );
  });
});
