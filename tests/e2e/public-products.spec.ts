import { expect, test } from "@playwright/test";

/** Same rationale as tests/e2e/public-services.spec.ts. */
test.describe("Public Products page", () => {
  test("loads with heading and metadata", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { name: /objects that hold the day/i })).toBeVisible();
    await expect(page).toHaveTitle(/products/i);
  });

  test("keeps the factual category guide complete when the CMS is unavailable", async ({
    page,
  }) => {
    await page.goto("/products");

    await expect(
      page.getByRole("heading", { name: /compatibility before catalogue volume/i }),
    ).toBeVisible();
    await expect(page.locator(".solution-pillar-ledger > li")).toHaveCount(5);
    await expect(page.getByText(/data unavailable/i)).toHaveCount(0);
  });

  test("nav link to Products points at /products", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Products", exact: true })
      .click();
    await expect(page).toHaveURL(/\/products$/);
  });
});
