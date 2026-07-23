import { expect, test } from "@playwright/test";

/**
 * The admin dashboard, quotations list, and quotation detail pages are
 * all gated behind a real Supabase Auth session (see src/middleware.ts
 * and src/app/(admin)/admin/layout.tsx). This environment has no live
 * Supabase project connected, so an authenticated session can't be
 * created here — see docs/testing-plan.md for the full explanation and
 * docs/decision-log.md ADR-010/011.
 *
 * What IS meaningfully testable without credentials is the negative
 * case: every admin route must redirect an unauthenticated visitor to
 * /login, not render any data. That's exactly what these tests check —
 * this is a real security property, not a placeholder test.
 */
test.describe("Admin dashboard routes require authentication", () => {
  test("dashboard home redirects to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("quotations list redirects to /login", async ({ page }) => {
    await page.goto("/admin/quotations");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("quotation detail redirects to /login", async ({ page }) => {
    await page.goto("/admin/quotations/00000000-0000-0000-0000-000000000000");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("placeholder admin sections redirect to /login", async ({ page }) => {
    for (const path of [
      "/admin/services",
      "/admin/products",
      "/admin/projects",
      "/admin/settings",
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    }
  });
});
