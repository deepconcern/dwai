import { expect, test } from "@playwright/test";

import { createFighter } from "./helpers";

test.describe("leveling up", () => {
  test("marks XP and levels up with a stat and an advanced move", async ({
    page,
  }) => {
    await createFighter(page, "Tamsin");

    await expect(page.getByText("Level 1, XP: 0 / 8")).toBeVisible();
    const levelUp = page.getByRole("button", { exact: true, name: "Level Up" });
    await expect(levelUp).toBeDisabled();

    for (let xp = 1; xp <= 8; xp++) {
      await page.getByRole("button", { exact: true, name: "Mark XP" }).click();
      await expect(page.getByText(`Level 1, XP: ${xp} / 8`)).toBeVisible();
    }

    await levelUp.click();
    const dialog = page.getByRole("form", { name: "Level up to 2" });
    await dialog
      .getByLabel("Ability to raise")
      .selectOption({ label: "Constitution (13 → 14)" });
    await dialog.getByRole("radio", { name: /^Merciless/ }).check();
    await dialog.getByRole("button", { name: "Level Up" }).click();

    await expect(page.getByText("Level 2, XP: 0 / 9")).toBeVisible();
    await expect(page.getByText("Level 2 Dwarf Fighter")).toBeVisible();
    // +1 CON raises max HP, and current HP with it.
    await expect(page.getByText("HP: 24 / 24")).toBeVisible();

    await page.getByRole("button", { name: "Class Moves" }).click();
    await expect(
      page.getByRole("heading", { name: "Merciless" }),
    ).toBeVisible();
  });
});
