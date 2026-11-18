import { expect, test } from "@playwright/test";

import { createFighter, joinWith, newUser } from "./helpers";

test("the table chats, rolls, and logs XP live", async ({ browser }) => {
  // Given a GM and a player at a campaign's table,
  const gm = await newUser(browser, "Gemma");
  await gm.getByRole("link", { name: "Campaigns" }).click();
  await gm.getByLabel("Campaign name").fill("The Lost Mines");
  await gm.getByRole("button", { name: "Start Campaign" }).click();
  const invitePath = await gm.getByLabel("Invite link").innerText();

  const ana = await newUser(browser, "Ana's player");
  await createFighter(ana, "Ana");
  await joinWith(ana, invitePath, "Ana");
  await gm.reload();

  const gmChat = gm.getByRole("list", { name: "Messages" });
  const anaChat = ana.getByRole("list", { name: "Messages" });

  // when each posts, the other sees it without reloading.
  await ana.getByRole("textbox", { name: "Message" }).fill("I draw my sword.");
  await ana.getByRole("button", { name: "Send" }).click();
  await expect(gmChat).toContainText("I draw my sword.");

  await gm
    .getByRole("textbox", { name: "Message" })
    .fill("A goblin leaps out!");
  await gm.getByRole("button", { name: "Send" }).click();
  await expect(anaChat).toContainText("A goblin leaps out!");

  // When Ana rolls Hack and Slash with physical dice (3) and her suggested
  // STR (+2), both see the miss with its breakdown.
  await ana.getByRole("button", { name: "Hack and Slash" }).click();
  const dialog = ana.getByRole("form", { name: "Roll Hack and Slash" });
  await dialog.getByLabel("I rolled").check();
  await dialog.getByLabel("Your 2d6 total").fill("3");
  await dialog.getByRole("button", { name: "Roll" }).click();

  for (const chat of [anaChat, gmChat]) {
    const roll = chat.getByRole("group", { name: "Ana rolled Hack and Slash" });
    await expect(roll).toContainText("3 +2 STR = 5");
    await expect(roll).toContainText("6−");
  }
  // Only the roller is offered Mark XP, and nothing is marked for her.
  await expect(gmChat.getByRole("button", { name: "Mark XP" })).toHaveCount(0);

  // When she marks XP from the miss, both see the activity line.
  await anaChat.getByRole("button", { name: "Mark XP" }).click();
  await expect(anaChat).toContainText("Ana marked 1 XP");
  await expect(gmChat).toContainText("Ana marked 1 XP");
});
