import { expect, test } from "@playwright/test";

import { createFighter, joinWith, newUser } from "./helpers";

test("a GM builds a front, reveals and hides a threat, and runs an encounter", async ({
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

  // when the GM builds an adventure front on the Prep page,
  await gm.getByRole("link", { name: "Prep: Fronts & Encounters" }).click();
  await gm.getByRole("button", { name: "Add Front" }).click();
  const frontForm = gm.getByRole("form", { name: "New front" });
  await frontForm.getByLabel("Name").fill("The Opening of the White Gate");
  await frontForm.getByRole("button", { name: "Create Front" }).click();

  // with a Cult danger and three grim portents (picking the type fills in
  // its impulse),
  const front = gm.getByRole("group", {
    name: "The Opening of the White Gate",
  });
  await front.getByRole("button", { name: "Add Danger" }).click();
  const dangerForm = gm.getByRole("form", { name: "New danger" });
  await dangerForm
    .getByLabel("Name", { exact: true })
    .fill("The College of Arcanists");
  await dangerForm.getByLabel("Type").fill("Cult");
  await expect(dangerForm.getByLabel("Impulse")).toHaveValue(
    "to infest from within",
  );
  for (const [i, text] of [
    "The College sends an expedition",
    "The Key is discovered",
    "The Gate is opened",
  ].entries()) {
    await dangerForm.getByRole("button", { name: "Add Grim Portent" }).click();
    await dangerForm
      .getByRole("textbox", { exact: true, name: `Grim portent ${i + 1}` })
      .fill(text);
  }
  await dangerForm.getByRole("button", { name: "Create Danger" }).click();

  // then, at the table, they check off the first portent and reveal the
  // danger and that portent,
  await gm.goto(campaignPath);
  const danger = gm
    .getByRole("list", { name: "The Opening of the White Gate" })
    .getByRole("listitem", { name: "The College of Arcanists" });
  // (each box changes once the API has saved it)
  const firstPortent = danger.getByLabel("The College sends an expedition", {
    exact: true,
  });
  await firstPortent.click();
  await expect(firstPortent).toBeChecked();
  await expect(danger).toContainText("Grim portents: 1 of 3");
  const revealDanger = danger.getByLabel("Revealed to players");
  await revealDanger.click();
  await expect(revealDanger).toBeChecked();
  const revealPortent = danger.getByLabel(
    'Reveal "The College sends an expedition"',
  );
  await revealPortent.click();
  await expect(revealPortent).toBeChecked();

  // and the player sees the danger and only that portent in Known threats,
  // with the reveals in the chat.
  const threat = ana
    .getByRole("list", { name: "Known threats" })
    .getByRole("listitem", { name: "The College of Arcanists" });
  await expect(threat).toContainText("The College sends an expedition");
  await expect(threat).not.toContainText("The Key is discovered");
  await expect(ana.getByRole("list", { name: "Messages" })).toContainText(
    "The GM revealed a grim portent of The College of Arcanists: The College sends an expedition",
  );

  // When the GM hides the danger again, it leaves the player's Known
  // threats without a reload.
  await revealDanger.click();
  await expect(revealDanger).not.toBeChecked();
  await expect(ana.getByRole("list", { name: "Known threats" })).toHaveCount(0);

  // When the GM prepares an encounter of two goblins, linked to nothing,
  await gm.getByRole("link", { name: "Prep: Fronts & Encounters" }).click();
  await gm.getByRole("button", { name: "Encounters" }).click();
  await gm.getByRole("button", { name: "Add Encounter" }).click();
  const encounterForm = gm.getByRole("form", { name: "New encounter" });
  await encounterForm.getByLabel("Name").fill("Goblin ambush");
  await encounterForm.getByRole("button", { name: "Create Encounter" }).click();
  const encounter = gm.getByRole("article", { name: "Goblin ambush" });
  await encounter.getByRole("button", { name: "Add Monsters" }).click();
  const picker = encounter.getByRole("form", {
    name: "Add monsters to Goblin ambush",
  });
  await picker
    .getByLabel("Monster", { exact: true })
    .selectOption({ label: "Goblin (3 HP)" });
  await picker.getByLabel("How many").fill("2");
  await picker.getByRole("button", { name: "Add to Encounter" }).click();
  await expect(encounter.getByLabel("How many Goblin")).toHaveValue("2");

  // and runs it from the Monsters panel,
  await gm.goto(campaignPath);
  await gm.getByLabel("Encounter", { exact: true }).selectOption({
    label: "Goblin ambush",
  });
  await gm.getByRole("button", { name: "Run Encounter" }).click();

  // then both goblins are in play under the encounter's name.
  const group = gm.getByRole("list", { name: "Goblin ambush" });
  for (const name of ["Goblin 1", "Goblin 2"]) {
    await expect(group.getByRole("listitem", { name })).toContainText(
      "HP 3 / 3",
    );
  }

  // The player sees no Fronts panel.
  await expect(ana.getByRole("heading", { name: "Fronts" })).toHaveCount(0);
});
