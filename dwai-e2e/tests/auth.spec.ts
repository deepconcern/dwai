import { expect, test } from "@playwright/test";

import { TEST_PASSWORD, createFighter, registerUser } from "./helpers";

test.describe("accounts", () => {
  test("registers, logs out, and logs back in to the page it was going to", async ({
    page,
  }) => {
    const email = await registerUser(page, "Grog");

    // The navigation shows who's logged in.
    await expect(page.getByRole("navigation").getByText("Grog")).toBeVisible();
    await expect(page.getByText("You have no characters yet.")).toBeVisible();

    await createFighter(page, "Grimbold");
    const sheetPath = new URL(page.url()).pathname;

    await page.goto("/");
    await expect(page.getByRole("link", { name: "Grimbold" })).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("heading", { name: "Log In" })).toBeVisible();
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Log in" }),
    ).toBeVisible();

    // Logged out, the sheet redirects to the login page...
    await page.goto(sheetPath);
    await expect(page).toHaveURL(
      `/login?next=${encodeURIComponent(sheetPath)}`,
    );

    // ...which rejects a wrong password...
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong password");
    await page.getByRole("button", { name: "Log In" }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible();

    // ...and returns to the sheet after logging in.
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Log In" }).click();
    await expect(page).toHaveURL(sheetPath);
    await expect(page.getByRole("heading", { name: "Grimbold" })).toBeVisible();
  });

  test("doesn't show another user's characters", async ({ browser, page }) => {
    await registerUser(page, "Owner");
    await createFighter(page, "Private Fighter");
    const sheetPath = new URL(page.url()).pathname;

    // A second user, in a separate browser context (their own cookies).
    const otherContext = await browser.newContext();
    const other = await otherContext.newPage();
    await registerUser(other, "Other");

    await expect(other.getByText("You have no characters yet.")).toBeVisible();

    await other.goto(sheetPath);
    await expect(other.getByText(/not found/)).toBeVisible();
    await expect(
      other.getByRole("heading", { name: "Private Fighter" }),
    ).not.toBeVisible();

    await otherContext.close();
  });

  test("rejects a duplicate email", async ({ browser, page }) => {
    const email = await registerUser(page);

    const otherContext = await browser.newContext();
    const other = await otherContext.newPage();
    await other.goto("/register");
    await other.getByLabel("Display name").fill("Copycat");
    await other.getByLabel("Email").fill(email.toUpperCase());
    await other.getByLabel("Password").fill(TEST_PASSWORD);
    await other.getByRole("button", { name: "Register" }).click();

    await expect(
      other.getByText("An account with that email already exists"),
    ).toBeVisible();

    await otherContext.close();
  });
});
