import { expect, test } from "@playwright/test";

test.describe("character creation", () => {
  test("creates a character and shows its sheet", async ({ page }) => {
    await page.goto("/create-character");

    await page.getByLabel("Name").fill("Grimbold");
    await page.getByLabel("Class").selectOption({ label: "Fighter" });

    // Looks: type a custom value for the first look type.
    await page.getByRole("button", { name: "+ Add look" }).click();
    await page.getByLabel("Look 1", { exact: true }).fill("Scarred Skin");

    // Ability scores: the six starting values, each used once. Constitution
    // decides the Fighter's HP.
    const scores: [string, string][] = [
      ["STRENGTH", "16"],
      ["DEXTERITY", "12"],
      ["CONSTITUTION", "13"],
      ["INTELLIGENCE", "9"],
      ["WISDOM", "15"],
      ["CHARISMA", "8"],
    ];
    for (const [ability, score] of scores) {
      await page.getByLabel(ability, { exact: true }).selectOption(score);
    }

    // Alignment: use the class's suggested one.
    await page
      .getByRole("button", { name: /Good\s+Defend those weaker/ })
      .click();

    // Race
    await page.getByRole("button", { name: "Race: Dwarf" }).click();

    // Signature Weapon: pick one of each creation option.
    const signatureWeapon = page.getByRole("group", {
      name: "Signature Weapon",
    });
    await signatureWeapon.getByLabel("Sword").check();
    await signatureWeapon.getByLabel("Hand", { exact: true }).check();
    await signatureWeapon.getByLabel("Sharp").check();
    await signatureWeapon.getByLabel("Well-crafted").check();
    await signatureWeapon.getByLabel("Ancient").check();

    // Starting gear: 1 from the first group, 2 from the second.
    await page.getByRole("button", { name: "Gear group 1, option 1" }).click();
    await page.getByRole("button", { name: "Gear group 2, option 2" }).click();
    await page.getByRole("button", { name: "Gear group 2, option 4" }).click();

    await page.getByRole("button", { name: "Create Character" }).click();

    await expect(page).toHaveURL(/\/character\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "Grimbold" })).toBeVisible();
    await expect(page.getByText("Dwarf Fighter")).toBeVisible();
    // Fighters have 10 base HP, plus Constitution.
    await expect(page.getByText("HP: 23")).toBeVisible();
  });

  test("shows validation errors for an incomplete form", async ({ page }) => {
    await page.goto("/create-character");

    await page.getByLabel("Class").selectOption({ label: "Fighter" });
    await page.getByRole("button", { name: "Create Character" }).click();

    // Next.js also renders a (empty) route announcer with the alert role.
    const alert = page
      .getByRole("alert")
      .filter({ hasText: "Fix the following" });
    await expect(alert).toContainText("Enter a name.");
    await expect(alert).toContainText("Assign a score to Strength.");
    await expect(alert).toContainText("Choose an alignment.");
    await expect(alert).toContainText("Choose a race.");
    await expect(page).toHaveURL(/\/create-character$/);
  });
});
