import { expect, test } from "@playwright/test";

/** Same rationale as tests/e2e/admin-services.spec.ts. */
test.describe("Admin projects routes require authentication", () => {
  test("projects list redirects to /login", async ({ page }) => {
    await page.goto("/admin/projects");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("create project form redirects to /login", async ({ page }) => {
    await page.goto("/admin/projects/new");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("edit project form redirects to /login", async ({ page }) => {
    await page.goto("/admin/projects/00000000-0000-0000-0000-000000000000/edit");
    await expect(page).toHaveURL(/\/login$/);
  });
});
