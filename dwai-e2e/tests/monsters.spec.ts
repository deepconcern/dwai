import { expect, test } from "@playwright/test";

import { createFighter, joinWith, newUser } from "./helpers";

test("a GM copies a monster, runs three in play, and rolls its damage", async ({
  browser,
}) => {
  // Given a GM and a player at a campaign's table,
  const gm = await newUser(browser, "Gemma");
  await gm.getByRole("link", { name: "Campaigns" }).click();
  await gm.getByLabel("Campaign name").fill("The Lost Mines");
  await gm.getByRole("button", { name: "Start Campaign" }).click();
  const invitePath = await gm.getByLabel("Invite link").innerText();
  const campaignPath = new URL(gm.url()).pathname;

  const ana = await newUser(browser, "Ana's player");
  await createFighter(ana, "Ana");
  await joinWith(ana, invitePath, "Ana");

  // when the GM searches the compendium for "rat", Cave Rat is listed and
  // the Ankheg isn't.
  await gm.getByRole("link", { exact: true, name: "Monsters" }).click();
  await gm.getByLabel("Search by name").fill("rat");
  await expect(gm.getByRole("link", { name: "Cave Rat" })).toBeVisible();
  await expect(gm.getByRole("link", { name: "Ankheg" })).toHaveCount(0);

  // When they copy the Goblin (3 HP, armor 1) to their own monsters,
  await gm.getByLabel("Search by name").fill("goblin");
  await gm.getByRole("link", { exact: true, name: "Goblin" }).click();
  await gm.getByRole("link", { name: "Copy to My Monsters" }).click();
  await gm.getByLabel("Name", { exact: true }).fill("Tunnel Goblin");
  await gm.getByRole("button", { name: "Save Monster" }).click();
  await expect(
    gm.getByRole("heading", { name: "Tunnel Goblin" }),
  ).toBeVisible();

  // and add three of them to play,
  await gm.goto(campaignPath);
  await gm.getByRole("button", { name: "Add Monsters" }).click();
  const addForm = gm.getByRole("form", { name: "Add monsters" });
  await addForm
    .getByLabel("Monster", { exact: true })
    .selectOption({ label: "Tunnel Goblin (3 HP)" });
  await addForm.getByLabel("How many").fill("3");
  await addForm.getByRole("button", { name: "Add to Play" }).click();

  const inPlay = gm.getByRole("list", { name: "Other monsters" });
  for (const name of [
    "Tunnel Goblin 1",
    "Tunnel Goblin 2",
    "Tunnel Goblin 3",
  ]) {
    await expect(inPlay.getByRole("listitem", { name })).toContainText(
      "HP 3 / 3",
    );
  }

  // then dealing 3 damage to the first takes 2 HP (its armor is 1),
  const first = inPlay.getByRole("listitem", { name: "Tunnel Goblin 1" });
  await first.getByRole("button", { name: "Deal Damage" }).click();
  const damageForm = first.getByRole("form", {
    name: "Deal damage to Tunnel Goblin 1",
  });
  await damageForm.getByRole("spinbutton", { name: "Damage" }).fill("3");
  await damageForm.getByRole("button", { name: "Deal Damage" }).click();
  await expect(first).toContainText("HP 1 / 3");

  // and rolling its damage with physical dice posts it to both chats under
  // its name.
  await first.getByRole("button", { name: "Roll Damage" }).click();
  const dialog = gm.getByRole("form", { name: "Roll damage" });
  await dialog.getByLabel("I rolled").check();
  await dialog.getByLabel("Your dice total").fill("4");
  await dialog.getByRole("button", { name: "Roll Damage" }).click();

  await ana.reload();
  for (const page of [gm, ana]) {
    await expect(
      page
        .getByRole("list", { name: "Messages" })
        .getByRole("group", { name: "Tunnel Goblin 1 rolled Spear: d6" }),
    ).toContainText("= 4");
  }

  // The player sees no monsters panel.
  await expect(ana.getByRole("heading", { name: "Monsters" })).toHaveCount(0);
});
