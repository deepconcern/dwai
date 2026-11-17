import { Browser, Page, expect, test } from "@playwright/test";

import { createFighter, registerUser } from "./helpers";

/** A logged-in page in its own browser context, so each user has a cookie. */
const newUser = async (browser: Browser, displayName: string) => {
  const page = await (await browser.newContext()).newPage();
  await registerUser(page, displayName);

  return page;
};

/** Joins the campaign at the invite path with the named character. */
const joinWith = async (page: Page, invitePath: string, name: string) => {
  await page.goto(invitePath);
  await expect(
    page.getByRole("heading", { name: "Join The Lost Mines" }),
  ).toBeVisible();
  await page.getByLabel("Character").selectOption({ label: name });
  await page.getByRole("button", { name: "Join" }).click();
  await expect(
    page.getByRole("heading", { name: "The Lost Mines" }),
  ).toBeVisible();
};

test("a GM runs a campaign through End of Session", async ({ browser }) => {
  // The GM starts a campaign and shares the invite link.
  const gm = await newUser(browser, "Gemma");
  await gm.getByRole("link", { name: "Campaigns" }).click();
  await gm.getByLabel("Campaign name").fill("The Lost Mines");
  await gm.getByRole("button", { name: "Start Campaign" }).click();
  await expect(
    gm.getByRole("heading", { name: "The Lost Mines" }),
  ).toBeVisible();
  const invitePath = await gm.getByLabel("Invite link").innerText();
  expect(invitePath).toMatch(/^\/join\/[0-9A-Z]{10}$/);

  // Two players join, each with a fighter.
  const ana = await newUser(browser, "Ana's player");
  await createFighter(ana, "Ana");
  await joinWith(ana, invitePath, "Ana");

  const bo = await newUser(browser, "Bo's player");
  await createFighter(bo, "Bo");
  await joinWith(bo, invitePath, "Bo");

  const party = bo.getByRole("listitem", { name: "Ana" });
  await expect(party).toContainText("played by Ana's player");
  // Players don't get links to each other's sheets.
  await expect(party.getByRole("link")).toHaveCount(0);

  // Ana writes a bond about Bo from a class template.
  await ana.getByRole("link", { name: "Ana" }).click();
  await expect(ana.getByRole("heading", { name: "Ana" })).toBeVisible();
  const addBond = ana.getByRole("form", { name: "Add bond" });
  await addBond.getByLabel("Bond with").selectOption({ label: "Bo" });
  await addBond
    .getByLabel("Start from a template")
    .selectOption({ label: "I have sworn to protect Bo." });
  await expect(addBond.getByLabel("Bond text")).toHaveValue(
    "I have sworn to protect Bo.",
  );
  await addBond.getByRole("button", { name: "Add Bond" }).click();
  const bonds = ana.getByRole("list", { name: "Active bonds" });
  await expect(bonds).toContainText("I have sworn to protect Bo. (Bo)");

  // The GM ends the session: two "yes" answers, each with a reason.
  await gm.reload();
  await gm.getByRole("button", { name: "End Session" }).click();
  const endDialog = gm.getByRole("form", { name: "End of Session" });
  await endDialog
    .getByLabel("Did we learn something new and important about the world?")
    .check();
  await expect(
    endDialog.getByRole("button", { name: "End Session" }),
  ).toBeDisabled();
  await endDialog
    .getByLabel("Why we learned something")
    .fill("The king is a lich.");
  await endDialog
    .getByLabel("Did we overcome a notable monster or enemy?")
    .check();
  await endDialog.getByLabel("Why we overcame an enemy").fill("The owlbear.");
  await endDialog.getByRole("button", { name: "End Session" }).click();
  await expect(gm.getByRole("listitem", { name: "Session 1" })).toContainText(
    "Yes: The king is a lich.",
  );

  // Ana reports from her sheet: alignment, and resolving her bond.
  await ana.reload();
  await ana.getByRole("button", { name: "Report" }).click();
  const report = ana.getByRole("form", { name: "End of Session report" });
  await report.getByLabel(/I fulfilled my alignment/).check();
  await report.getByLabel("Alignment reason").fill("Shielded the villagers.");
  await report.getByLabel("I resolved a bond").check();
  await report.getByLabel("Bond reason").fill("Bo can protect themselves.");
  await report
    .getByLabel("Resolved bond")
    .selectOption({ label: "I have sworn to protect Bo." });
  await report.getByLabel("Bond with").selectOption({ label: "Bo" });
  await report.getByLabel("Bond text").fill("Bo owes me their life.");
  await expect(report.getByRole("status")).toHaveText("You'll mark 4 XP.");
  await report.getByRole("button", { name: "Submit" }).click();

  await expect(ana.getByText("Level 1, XP: 4 / 8")).toBeVisible();
  await expect(bonds.getByRole("listitem")).toHaveCount(1);
  await expect(bonds).toContainText("Bo owes me their life. (Bo)");

  // The GM sees the report in the log and Ana's sheet, read-only.
  await gm.reload();
  await expect(gm.getByRole("listitem", { name: "Session 1" })).toContainText(
    "Ana marked 4 XP",
  );
  await gm.getByRole("link", { name: "Ana" }).click();
  await expect(gm.getByRole("note")).toContainText(
    "viewing this sheet as the GM",
  );
  await expect(gm.getByText("Level 1, XP: 4 / 8")).toBeVisible();
  await expect(gm.getByRole("button", { name: "Level Up" })).toBeDisabled();
});
