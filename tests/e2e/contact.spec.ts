import { expect, test, type Page } from "@playwright/test";

const QUOTE_API = "**/api/quote-requests";

async function fillMinimumValidForm(page: Page) {
  await page.getByLabel(/full name/i).fill("Jane Doe");
  await page.getByLabel(/email address/i).fill("jane@example.com");
  await page.getByLabel(/^message/i).fill("I would like a quotation for my home rooftop.");
  await page.getByLabel(/i agree to be contacted/i).check();
}

test.describe("Contact / Request a quotation page", () => {
  test("loads with the heading and form visible", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /turn daylight into a next step/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /send enquiry/i })).toBeVisible();
  });

  test("keyboard navigation never focuses the hidden honeypot field", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/full name/i).focus();

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const activeId = await page.evaluate(() => document.activeElement?.id ?? "");
      expect(activeId).not.toBe("hp_field");
    }
  });

  test("shows an accessible error summary and field errors on empty submit", async ({ page }) => {
    await page.goto("/contact");
    await page.getByTestId("quote-form-submit").click();

    const summary = page.getByRole("alert").first();
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary.getByText(/full name/i)).toBeVisible();
    await expect(summary.getByText(/email address/i)).toBeVisible();
    await expect(summary.getByText(/privacy consent/i)).toBeVisible();
  });

  test("shows invalid-email feedback", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/full name/i).fill("Jane Doe");
    await page.getByLabel(/email address/i).fill("not-an-email");
    await page.getByLabel(/^message/i).fill("I would like a quotation for my home rooftop.");
    await page.getByLabel(/i agree to be contacted/i).check();
    await page.getByTestId("quote-form-submit").click();

    await expect(page.locator("#email-error")).toHaveText(/enter a valid email address/i);
  });

  test("shows the safe success state on a mocked successful submission", async ({ page }) => {
    await page.route(QUOTE_API, async (route) => {
      await route.fulfill({ json: { ok: true, reference: "ABC12345" } });
    });

    await page.goto("/contact");
    await fillMinimumValidForm(page);
    await page.getByTestId("quote-form-submit").click();

    const success = page.getByTestId("quote-form-success");
    await expect(success).toBeVisible();
    await expect(success).toContainText("ABC12345");
    await expect(page.getByTestId("quote-form-submit")).toHaveCount(0);
  });

  test("prevents a duplicate submission while a request is in flight", async ({ page }) => {
    let requestCount = 0;
    await page.route(QUOTE_API, async (route) => {
      requestCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({ json: { ok: true, reference: "DUP12345" } });
    });

    await page.goto("/contact");
    await fillMinimumValidForm(page);

    const submitButton = page.getByTestId("quote-form-submit");
    await submitButton.click();
    await expect(submitButton).toBeDisabled();

    // A second click attempt while the button is disabled should not fire.
    await submitButton.click({ timeout: 300, force: true }).catch(() => {});

    await expect(page.getByTestId("quote-form-success")).toBeVisible({ timeout: 5000 });
    expect(requestCount).toBe(1);
  });

  test("shows a safe generic error state when the server fails", async ({ page }) => {
    await page.route(QUOTE_API, async (route) => {
      await route.fulfill({ status: 500, json: { ok: false, error: "server_error" } });
    });

    await page.goto("/contact");
    await fillMinimumValidForm(page);
    await page.getByTestId("quote-form-submit").click();

    await expect(
      page.getByText(/couldn't submit your enquiry\. please try again in a moment\./i),
    ).toBeVisible();
    // Form remains usable — submit button is re-enabled, not stuck.
    await expect(page.getByTestId("quote-form-submit")).toBeEnabled();
  });

  test("renders usably on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/contact");

    await expect(page.getByRole("button", { name: /send enquiry/i })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
