import { expect, test } from "@playwright/test";

test.describe("Admin sign in", () => {
  test("unauthenticated visitors are redirected from /admin to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("loads with an accessible email/password form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /admin sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toHaveAttribute("type", "email");
    await expect(page.getByLabel(/^password/i)).toHaveAttribute("type", "password");
    await expect(page.getByTestId("login-submit")).toBeVisible();
  });

  test("supports keyboard-only navigation to submit", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email address/i).focus();
    await page.keyboard.type("owner@greennet.example");
    await page.keyboard.press("Tab");
    await page.keyboard.type("whatever-password");

    const activeId = await page.evaluate(() => document.activeElement?.id ?? "");
    expect(activeId).toBe("password");
  });

  test("shows a friendly error and keeps the form usable when sign-in cannot complete", async ({
    page,
  }) => {
    // No Supabase project is connected in this environment (by design —
    // see docs/decision-log.md), so submitting always exercises the
    // fail-safe error path. This proves the friendly-error behavior
    // without needing live credentials — see docs/testing-plan.md.
    await page.goto("/login");

    await page.getByLabel(/email address/i).fill("owner@greennet.example");
    await page.getByLabel(/^password/i).fill("whatever-password");
    await page.getByTestId("login-submit").click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeEnabled();
  });

  test("renders usably on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");

    await expect(page.getByTestId("login-submit")).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
