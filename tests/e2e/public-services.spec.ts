import { expect, test } from "@playwright/test";

/**
 * The editorial architecture renders independently of the CMS result.
 * With no live Supabase project, the catalogue itself deterministically
 * hits its fail-closed unavailable state.
 */
test.describe("Public Services page", () => {
  test("renders the hero, four pillars, lifecycle, and assessment CTA", async ({ page }) => {
    await page.goto("/services");

    await expect(
      page.getByRole("heading", { name: /reliable energy begins with the right system/i }),
    ).toBeVisible();
    await expect(page.locator(".solution-pillar-ledger > li")).toHaveCount(4);

    const lifecycle = page.locator(".solution-lifecycle__track");
    await expect(lifecycle).toHaveJSProperty("tagName", "OL");
    await expect(lifecycle.locator(":scope > li")).toHaveCount(6);
    await expect(lifecycle).toContainText("Discover");
    await expect(lifecycle).toContainText("Support");

    await expect(page.getByRole("link", { name: /request a site assessment/i })).toHaveAttribute(
      "href",
      "/contact?interest=site_assessment",
    );
    await expect(page).toHaveTitle(/solar solutions/i);
  });

  test("shows a friendly message instead of a crash when data is unavailable", async ({ page }) => {
    await page.goto("/services");

    await expect(page.getByText(/catalogue is between connections/i)).toBeVisible();
  });

  test("nav link to Solar Solutions points at /services", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Solar Solutions" })
      .click();
    await expect(page).toHaveURL(/\/services$/);
  });

  for (const width of [390, 320]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/services");

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  }
});
