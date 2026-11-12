import { expect, test } from "@playwright/test";

import { createWizard } from "./helpers";

test.describe("spells", () => {
  test("fills a Wizard's spellbook and prepares spells", async ({ page }) => {
    await createWizard(page, "Avon");

    await page.getByRole("button", { exact: true, name: "Spells" }).click();
    await expect(
      page.getByRole("article", { name: "Prestidigitation" }),
    ).toBeVisible();
    await expect(
      page.getByText("Your spellbook has 0 of 3 spells: add 3 more."),
    ).toBeVisible();

    const addForm = page.getByRole("form", { name: "Add to spellbook" });
    for (const spell of ["Magic Missile", "Charm Person", "Alarm"]) {
      await addForm
        .getByLabel("Spell")
        .selectOption({ label: `${spell} (level 1)` });
      await addForm.getByRole("button", { name: "Add to Spellbook" }).click();
      await expect(
        page.getByRole("button", { name: `Remove ${spell} from spellbook` }),
      ).toBeVisible();
    }
    await expect(page.getByText(/Your spellbook has/)).toBeHidden();

    await expect(
      page.getByText("Prepared Spells (0 / 2 levels)"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Prepare Spells" }).click();
    const dialog = page.getByRole("form", { name: "Prepare Spells" });
    await dialog.getByRole("checkbox", { name: "Magic Missile" }).click();
    await dialog.getByRole("checkbox", { name: "Charm Person" }).click();
    await dialog.getByRole("checkbox", { name: "Alarm" }).click();
    await expect(dialog.getByText("3 / 2 levels chosen")).toBeVisible();

    // The API rejects going over the limit.
    await dialog.getByRole("button", { name: "Prepare Spells" }).click();
    await expect(dialog.getByRole("alert")).toBeVisible();

    await dialog.getByRole("checkbox", { name: "Alarm" }).click();
    await dialog.getByRole("button", { name: "Prepare Spells" }).click();
    await expect(
      page.getByText("Prepared Spells (2 / 2 levels)"),
    ).toBeVisible();

    const forgotten = page
      .getByRole("article", { name: "Magic Missile" })
      .getByRole("checkbox", { name: "Forgotten" });
    await forgotten.last().click();
    await expect(forgotten.last()).toBeChecked();
  });
});
