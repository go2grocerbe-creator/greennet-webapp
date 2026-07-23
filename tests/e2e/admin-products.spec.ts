import { expect, test } from "@playwright/test";

/** Same rationale as tests/e2e/admin-services.spec.ts. */
test.describe("Admin products routes require authentication", () => {
  test("products list redirects to /login", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("create product form redirects to /login", async ({ page }) => {
    await page.goto("/admin/products/new");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("edit product form redirects to /login", async ({ page }) => {
    await page.goto("/admin/products/00000000-0000-0000-0000-000000000000/edit");
    await expect(page).toHaveURL(/\/login$/);
  });
});
