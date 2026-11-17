import { Page, expect } from "@playwright/test";

/** The password every test account uses. */
export const TEST_PASSWORD = "correct horse battery staple";

/**
 * Registers a new account through the UI with a unique email, which logs the
 * browser in, and returns the email. Every run starts from an empty
 * database, and each test registers its own user so tests can't see each
 * other's characters.
 */
export const registerUser = async (page: Page, displayName = "Player") => {
  const email = `player-${crypto.randomUUID()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Display name").fill(displayName);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Register" }).click();

  await expect(
    page.getByRole("heading", { name: "My Characters" }),
  ).toBeVisible();

  return email;
};

/**
 * Creates a Fighter through the UI and waits for its sheet: CON 13 (23 HP),
 * STR 16 (max load 14), with scale armor (unworn), a shield (+1 armor), and
 * 22 gold.
 */
export const createFighter = async (page: Page, name: string) => {
  await page.goto("/create-character");

  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Class").selectOption({ label: "Fighter" });

  await page.getByRole("button", { name: "+ Add look" }).click();
  await page.getByLabel("Look 1", { exact: true }).fill("Scarred Skin");

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

  await page
    .getByRole("button", { name: /Good\s+Defend those weaker/ })
    .click();
  await page.getByRole("button", { name: "Race: Dwarf" }).click();

  const signatureWeapon = page.getByRole("group", { name: "Signature Weapon" });
  await signatureWeapon.getByLabel("Sword").check();
  await signatureWeapon.getByLabel("Hand", { exact: true }).check();
  await signatureWeapon.getByLabel("Sharp").check();
  await signatureWeapon.getByLabel("Well-crafted").check();
  await signatureWeapon.getByLabel("Ancient").check();

  // Scale armor; then a shield and 22 gold.
  await page.getByRole("button", { name: "Gear group 1, option 1" }).click();
  await page.getByRole("button", { name: "Gear group 2, option 2" }).click();
  await page.getByRole("button", { name: "Gear group 2, option 4" }).click();

  await page.getByRole("button", { name: "Create Character" }).click();

  await expect(page.getByRole("heading", { name })).toBeVisible();
};

/**
 * Creates a level 1 Wizard through the UI and waits for its sheet: it may
 * prepare 2 levels of spells and should have 3 spells in its spellbook.
 */
export const createWizard = async (page: Page, name: string) => {
  await page.goto("/create-character");

  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Class").selectOption({ label: "Wizard" });

  await page.getByRole("button", { name: "+ Add look" }).click();
  await page.getByLabel("Look 1", { exact: true }).fill("Haunted Eyes");

  const scores: [string, string][] = [
    ["STRENGTH", "8"],
    ["DEXTERITY", "12"],
    ["CONSTITUTION", "13"],
    ["INTELLIGENCE", "16"],
    ["WISDOM", "15"],
    ["CHARISMA", "9"],
  ];
  for (const [ability, score] of scores) {
    await page.getByLabel(ability, { exact: true }).selectOption(score);
  }

  await page
    .getByRole("button", { name: /Good\s+Use magic to directly aid another/ })
    .click();
  await page.getByRole("button", { name: "Race: Elf" }).click();

  for (const group of [1, 2, 3]) {
    await page
      .getByRole("button", { name: `Gear group ${group}, option 1` })
      .click();
  }

  await page.getByRole("button", { name: "Create Character" }).click();

  await expect(page.getByRole("heading", { name })).toBeVisible();
};
