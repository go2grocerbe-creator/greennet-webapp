import { expect, test } from "@playwright/test";

/**
 * No live Supabase project is connected in this environment, so this
 * page deterministically hits its fail-closed "unavailable" state (not
 * "empty" — those are different, intentionally distinct messages, see
 * src/app/(marketing)/services/page.tsx). That's still a real, honest
 * thing to verify: the page renders safely with a friendly message
 * instead of crashing or leaking an error.
 */
test.describe("Public Services page", () => {
  test("loads with heading and metadata", async ({ page }) => {
    await page.goto("/services");

    await expect(page.getByRole("heading", { name: /solar solutions/i })).toBeVisible();
    await expect(page).toHaveTitle(/solar solutions/i);
  });

  test("shows a friendly message instead of a crash when data is unavailable", async ({ page }) => {
    await page.goto("/services");

    await expect(page.getByText(/unavailable right now/i)).toBeVisible();
  });

  test("nav link to Solar Solutions points at /services", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Solar Solutions" }).click();
    await expect(page).toHaveURL(/\/services$/);
  });
});
