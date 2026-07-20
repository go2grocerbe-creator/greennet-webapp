import { expect, test } from "@playwright/test";

/** Same rationale as tests/e2e/public-services.spec.ts. */
test.describe("Public Products page", () => {
  test("loads with heading and metadata", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { name: /^products$/i })).toBeVisible();
    await expect(page).toHaveTitle(/products/i);
  });

  test("shows a friendly message instead of a crash when data is unavailable", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByText(/unavailable right now/i)).toBeVisible();
  });

  test("nav link to Products points at /products", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Products", exact: true }).click();
    await expect(page).toHaveURL(/\/products$/);
  });
});
