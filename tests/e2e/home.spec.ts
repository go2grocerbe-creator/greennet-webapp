import { expect, test, type Page } from "@playwright/test";

async function scrollSolarStoryTo(page: Page, progress: number) {
  await expect(page.locator('[aria-label="A solar day"][data-enhanced="true"]')).toBeAttached();
  await page.evaluate((targetProgress) => {
    const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
    if (!root) return;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    const top = window.scrollY + root.getBoundingClientRect().top;
    window.scrollTo(0, top + targetProgress * (root.offsetHeight - window.innerHeight));
    window.dispatchEvent(new Event("scroll"));
  }, progress);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

test("home page renders the hero with the confirmed brand tagline", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /powering homes & businesses with clean solar energy/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /open solar day navigation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "About", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveCount(0);
});

test("the sun remains a keyboard phase navigator before the house CTA takes over", async ({
  page,
}) => {
  await page.goto("/");
  const sun = page.getByRole("button", { name: /open solar day navigation/i });
  await sun.focus();
  await page.keyboard.press("End");

  const houseCta = page.getByRole("link", {
    name: /request a quotation from the illuminated house/i,
  });
  await expect(houseCta).toBeVisible();
  await expect(houseCta).toHaveAttribute("href", "/contact");
  await expect(page.getByRole("button", { name: /night\. request a quotation/i })).toHaveCount(0);
});

test.describe("solar story refinement", () => {
  test("phase model drives chapter copy, progress rail and current states", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[aria-label="A solar day"][data-enhanced="true"]')).toBeAttached();

    const anchors = [
      ["predawn", 0, "off"],
      ["morning", 0.17, "forming"],
      ["noon", 0.34, "active"],
      ["golden", 0.53, "arriving"],
      ["sunset", 0.72, "complete"],
      ["night", 1, "complete"],
    ] as const;

    for (const [phase, progress, currentState] of anchors) {
      await scrollSolarStoryTo(page, progress);
      const root = page.locator('[aria-label="A solar day"]');
      await expect(root).toHaveAttribute("data-phase", phase);
      await expect(root).toHaveAttribute("data-text-phase", phase);
      await expect(root).toHaveAttribute("data-current-state", currentState);
      const readableCount = await page.locator(".solar-chapter__inner").evaluateAll((elements) => {
        return elements.filter((element) => Number(getComputedStyle(element).opacity) > 0.5).length;
      });
      expect(readableCount).toBe(1);
    }

    await expect(page.getByTestId("solar-progress-rail")).toBeVisible();
    const fillHeight = await page.getByTestId("solar-progress-rail-fill").evaluate((node) => {
      return node.getBoundingClientRect().height;
    });
    expect(fillHeight).toBeGreaterThan(0);
  });

  test("panel and battery are semantic navigation modules before the night handoff", async ({
    page,
  }) => {
    await page.goto("/");

    await scrollSolarStoryTo(page, 0.17);
    const panelLink = page.getByTestId("solar-panel-link");
    await expect(panelLink).toBeVisible();
    await expect(panelLink).toHaveAttribute("href", "/services");

    await scrollSolarStoryTo(page, 0.53);
    const batteryLink = page.getByTestId("solar-battery-link");
    await expect(batteryLink).toBeVisible();
    await expect(batteryLink).toHaveAttribute("href", "/products");
    await expect(page.locator('[class*="batteryLabel"]')).toBeVisible();
  });

  test("settled night removes competing assets and exposes exactly one final house CTA", async ({
    page,
  }) => {
    await page.goto("/");

    await scrollSolarStoryTo(page, 0.86);
    const state = await page.locator('[aria-label="A solar day"]').evaluate((root) => {
      const styles = getComputedStyle(root);
      return {
        houseContact: Number(styles.getPropertyValue("--house-contact")),
        homeLight: Number(styles.getPropertyValue("--home-light")),
      };
    });
    expect(state.houseContact).toBeLessThan(0.95);
    expect(state.homeLight).toBe(0);

    await scrollSolarStoryTo(page, 1);
    const root = page.locator('[aria-label="A solar day"]');
    await expect(root).toHaveAttribute("data-sun-settled", "true");
    const settledState = await root.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        houseContact: Number(styles.getPropertyValue("--house-contact")),
        homeLight: Number(styles.getPropertyValue("--home-light")),
        panelPresence: Number(styles.getPropertyValue("--panel-presence")),
        batteryPresence: Number(styles.getPropertyValue("--battery-presence")),
      };
    });
    expect(settledState.houseContact).toBe(1);
    expect(settledState.homeLight).toBe(1);
    expect(settledState.panelPresence).toBe(0);
    expect(settledState.batteryPresence).toBe(0);

    const finalCta = page.getByRole("link", {
      name: /request a quotation from the illuminated house/i,
    });
    await expect(finalCta).toBeVisible();
    await expect(finalCta).toHaveAttribute("href", "/contact");
    await expect(root.getByTestId("solar-house-link")).toHaveCount(1);
  });

  test("mobile golden-hour copy and product cue do not collide", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await scrollSolarStoryTo(page, 0.53);

    const headingBox = await page
      .getByRole("heading", { name: /energy becomes reserve/i })
      .boundingBox();
    const productBox = await page
      .getByRole("link", { name: /open products for batteries and inverters/i })
      .boundingBox();
    expect(headingBox).not.toBeNull();
    expect(productBox).not.toBeNull();
    expect(headingBox!.y + headingBox!.height).toBeLessThan(productBox!.y);
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });
});

test("reduced motion renders every chapter as a static scene", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("[data-solar-stage]")).toBeHidden();
  await expect(page.getByTestId("solar-progress-rail")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Light becomes current.", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".solar-chapter--morning .solar-lede")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sunlight becomes current.", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /energy becomes reserve/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /light changes hands/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /the sun is still working/i })).toBeVisible();
});

test("the landscape responds continuously to the solar day", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator('[aria-label="A solar day"][data-enhanced="true"]')).toBeAttached();

  const sample = async (progress: number) => {
    await scrollSolarStoryTo(page, progress);
    return page.locator('[aria-label="A solar day"]').evaluate((root) => {
      const styles = getComputedStyle(root);
      const read = (name: string) => Number.parseFloat(styles.getPropertyValue(name));
      return {
        altitude: read("--solar-altitude"),
        shadow: read("--shadow-strength"),
        panelLight: read("--panel-light"),
        battery: read("--battery-presence"),
        homeLight: read("--home-light"),
      };
    });
  };

  const predawn = await sample(0);
  const noon = await sample(0.34);
  const golden = await sample(0.53);
  const night = await sample(1);

  expect(noon.altitude).toBeGreaterThan(0.85);
  expect(noon.panelLight).toBeGreaterThan(predawn.panelLight + 0.7);
  expect(noon.shadow).toBeLessThan(predawn.shadow);
  expect(predawn.battery).toBe(0);
  expect(golden.battery).toBeGreaterThan(0.7);
  expect(golden.homeLight).toBe(0);
  expect(night.homeLight).toBe(1);
});

test("mobile navigation exposes only live public routes without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByText("Menu", { exact: true }).click();

  await expect(page.getByRole("navigation", { name: /mobile navigation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /solar solutions/i }).last()).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("unknown route renders the not-found page", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
});
