import { expect, test } from "@playwright/test";

/**
 * Same rationale as tests/e2e/admin-dashboard.spec.ts: no live Supabase
 * project is connected in this environment, so authenticated flows
 * (create/edit/publish) can't be exercised here — covered instead by
 * Vitest against a fake ServicesDataSource and RTL for the table's
 * states. What Playwright can meaningfully prove without credentials is
 * that every services route is actually gated. See docs/testing-plan.md.
 */
test.describe("Admin services routes require authentication", () => {
  test("services list redirects to /login", async ({ page }) => {
    await page.goto("/admin/services");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("create service form redirects to /login", async ({ page }) => {
    await page.goto("/admin/services/new");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("edit service form redirects to /login", async ({ page }) => {
    await page.goto("/admin/services/00000000-0000-0000-0000-000000000000/edit");
    await expect(page).toHaveURL(/\/login$/);
  });
});
