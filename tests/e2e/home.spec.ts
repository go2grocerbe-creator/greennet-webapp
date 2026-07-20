import { expect, test } from "@playwright/test";

test("home page renders the placeholder foundation content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /production site foundation/i })).toBeVisible();
});

test("unknown route renders the not-found page", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
});
