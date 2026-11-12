import { expect, test } from "@playwright/test";

import { createFighter } from "./helpers";

test.describe("character sheet", () => {
  test("takes damage with armor applied and heals", async ({ page }) => {
    await createFighter(page, "Brakka");

    const damage = page.getByRole("form", { name: "Take damage" });
    const heal = page.getByRole("form", { name: "Heal" });

    await expect(page.getByText("HP: 23 / 23")).toBeVisible();
    await expect(page.getByText("Armor: 1")).toBeVisible();

    // The shield's 1 armor is subtracted.
    await damage.getByLabel("Damage").fill("5");
    await damage.getByRole("button", { name: "Take Damage" }).click();
    await expect(page.getByText("HP: 19 / 23")).toBeVisible();

    await damage.getByLabel("Damage").fill("3");
    await damage.getByLabel("Ignores armor").check();
    await damage.getByRole("button", { name: "Take Damage" }).click();
    await expect(page.getByText("HP: 16 / 23")).toBeVisible();

    // Healing stops at max HP.
    await heal.getByLabel("Healing").fill("100");
    await heal.getByRole("button", { name: "Heal" }).click();
    await expect(page.getByText("HP: 23 / 23")).toBeVisible();

    await damage.getByLabel("Damage").fill("50");
    await damage.getByRole("button", { name: "Take Damage" }).click();
    await expect(page.getByText("HP: 0 / 23")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Last Breath");
  });

  test("shows a debility's -1 on the modifier", async ({ page }) => {
    await createFighter(page, "Wren");

    const strength = page.getByRole("group", { name: "STRENGTH" });
    await expect(strength.getByLabel("STRENGTH modifier")).toHaveText("+2");

    // The checkbox shows the stored state, so it flips once the API answers.
    await strength.getByLabel("Weak").click();
    await expect(strength.getByLabel("Weak")).toBeChecked();
    await expect(strength.getByLabel("STRENGTH modifier")).toHaveText("+1");
    await expect(strength.getByText("Base +2")).toBeVisible();

    // It's stored: still there after a reload.
    await page.reload();
    await expect(
      page.getByRole("group", { name: "STRENGTH" }).getByLabel("Weak"),
    ).toBeChecked();
  });

  test("manages inventory, load, armor, and gold", async ({ page }) => {
    await createFighter(page, "Orla");
    await page.getByRole("button", { name: "Equipment" }).click();

    const loadText = page.getByText(/^Load: \d+ \/ 14$/);
    const load = async () =>
      Number((await loadText.textContent())!.match(/Load: (\d+)/)![1]);
    const startLoad = await load();

    // A custom item adds its weight.
    const custom = page.getByRole("form", { name: "Add custom item" });
    await custom.getByLabel("Custom item name").fill("Stone idol");
    await custom.getByLabel("Custom item weight").fill("3");
    await custom.getByRole("button", { name: "Add Custom Item" }).click();
    await expect(
      page.getByRole("cell", { exact: true, name: "Stone idol" }),
    ).toBeVisible();
    await expect(page.getByText(`Load: ${startLoad + 3} / 14`)).toBeVisible();

    // An item from the catalog.
    const catalog = page.getByRole("form", { name: "Add item from catalog" });
    await catalog
      .getByLabel("Item")
      .selectOption({ label: "Adventuring Gear" });
    await catalog.getByRole("button", { name: "Add Item" }).click();
    await expect(
      page.getByRole("cell", { exact: true, name: "Adventuring Gear" }),
    ).toBeVisible();

    // Removing brings the load back down.
    await page.getByRole("button", { name: "Remove Stone idol" }).click();
    await expect(
      page.getByRole("cell", { exact: true, name: "Stone idol" }),
    ).toHaveCount(0);
    await expect(page.getByText(`Load: ${startLoad + 1} / 14`)).toBeVisible();

    // Wearing the scale armor adds 2 armor.
    await page
      .getByRole("row", { name: /Scale Armor/ })
      .getByLabel("Worn")
      .click();
    await page.getByRole("button", { name: "Basic Info" }).click();
    await expect(page.getByText("Armor: 3")).toBeVisible();

    // Gold: add, then try to spend more than the character has.
    await page.getByRole("button", { name: "Equipment" }).click();
    const gold = page.getByRole("form", { name: "Gold" });
    await gold.getByLabel("Gold amount").fill("10");
    await gold.getByRole("button", { name: "Add Gold" }).click();
    await expect(page.getByText("Gold: 32")).toBeVisible();

    await gold.getByLabel("Gold amount").fill("40");
    await gold.getByRole("button", { name: "Spend Gold" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "gold" }),
    ).toContainText("Not enough gold");
    await expect(page.getByText("Gold: 32")).toBeVisible();
  });
});
