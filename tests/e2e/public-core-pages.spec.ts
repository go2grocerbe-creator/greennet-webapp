import { expect, test } from "@playwright/test";

const routes = [
  { path: "/about", heading: /dependable power starts with clear decisions/i },
  { path: "/services", heading: /reliable energy begins with the right system/i },
  { path: "/products", heading: /objects that hold the day/i },
  { path: "/projects", heading: /every site asks a different question/i },
  { path: "/contact", heading: /turn daylight into a next step/i },
] as const;

test("all Phase 1 public routes render without horizontal overflow across handover widths", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow, `${route.path} at ${viewport.width}px`).toBe(false);
    }
  }
});

test("About and Projects are reachable from desktop and mobile navigation", async ({ page }) => {
  await page.goto("/");
  const desktopNav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(desktopNav.getByRole("link", { name: "About", exact: true })).toHaveAttribute(
    "href",
    "/about",
  );
  await expect(desktopNav.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute(
    "href",
    "/projects",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByText("Menu", { exact: true }).click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  await mobileNav.getByRole("link", { name: /Projects$/ }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

test("Projects page labels capability pathways and withholds unverified photography", async ({
  page,
}) => {
  await page.goto("/projects");

  await expect(page.getByText(/intended project pathways, not claims/i)).toBeVisible();
  await expect(page.getByText(/photography remains withheld/i)).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);
});
