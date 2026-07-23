import { expect, test } from "@playwright/test";

test("home page renders the hero with the confirmed brand tagline", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /powering homes & businesses with clean solar energy/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /open solar day navigation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "About", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveCount(0);
});

test("the sun is a keyboard-operable phase navigator and becomes the final action", async ({
  page,
}) => {
  await page.goto("/");
  const sun = page.getByRole("button", { name: /open solar day navigation/i });
  await sun.focus();
  await page.keyboard.press("End");

  const finalSun = page.getByRole("button", { name: /night\. request a quotation/i });
  await expect(finalSun).toBeVisible();
  await expect(page.getByRole("heading", { name: /the sun is still working/i })).toBeVisible();
  await finalSun.click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("phase copy windows are exclusive and synchronized on desktop and mobile", async ({
  page,
}) => {
  const anchors = [
    ["predawn", 0],
    ["morning", 0.19],
    ["noon", 0.38],
    ["golden", 0.57],
    ["sunset", 0.76],
    ["night", 1],
  ] as const;
  const transitions = [0.14, 0.3, 0.49, 0.68, 0.86] as const;

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator('[aria-label="A solar day"][data-enhanced="true"]')).toBeAttached();
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
    });

    const sceneGeometry = await page.locator(".solar-chapter").evaluateAll((chapters) => ({
      topPositions: [
        ...new Set(chapters.map((chapter) => Math.round(chapter.getBoundingClientRect().top))),
      ],
      positionModes: [...new Set(chapters.map((chapter) => getComputedStyle(chapter).position))],
    }));
    expect(sceneGeometry.topPositions).toHaveLength(1);
    expect(sceneGeometry.positionModes).toEqual(["absolute"]);

    const sample = async (progress: number) => {
      await page.evaluate((targetProgress) => {
        const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
        if (!root) return;
        const top = window.scrollY + root.getBoundingClientRect().top;
        window.scrollTo({
          top: top + targetProgress * (root.offsetHeight - window.innerHeight),
          behavior: "auto",
        });
      }, progress);
      await page.waitForTimeout(80);
      return page.evaluate(() => {
        const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
        const readable = [
          ...document.querySelectorAll<HTMLElement>(".solar-chapter__inner"),
        ].filter((element) => Number.parseFloat(getComputedStyle(element).opacity) > 0.05);
        return {
          textPhase: root?.dataset.textPhase,
          readableCount: readable.length,
          activeCount: root?.querySelectorAll('[aria-current="step"]').length ?? 0,
          activeHref: root?.querySelector<HTMLAnchorElement>('[aria-current="step"]')?.hash,
        };
      });
    };

    for (const [id, progress] of anchors) {
      const result = await sample(progress);
      expect(result.textPhase).toBe(id);
      expect(result.readableCount).toBe(1);
      expect(result.activeCount).toBe(1);
      expect(result.activeHref).toBe(`#solar-${id}`);
    }

    await expect(page.locator(".solar-chapter--morning .solar-lede")).toBeHidden();

    for (const progress of transitions) {
      const result = await sample(progress);
      expect(result.textPhase).toBe("transition");
      expect(result.readableCount).toBe(0);
      expect(result.activeCount).toBe(0);
    }
  }

  const timelineDensity = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
    if (!root) return { maxReadable: 0, readableSamples: 0 };
    const top = window.scrollY + root.getBoundingClientRect().top;
    const distance = root.offsetHeight - window.innerHeight;
    let maxReadable = 0;
    let readableSamples = 0;

    for (let index = 0; index <= 100; index += 1) {
      window.scrollTo({ top: top + distance * (index / 100), behavior: "auto" });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const readable = [...document.querySelectorAll<HTMLElement>(".solar-chapter__inner")].filter(
        (element) => Number.parseFloat(getComputedStyle(element).opacity) > 0.05,
      ).length;
      maxReadable = Math.max(maxReadable, readable);
      if (readable > 0) readableSamples += 1;
    }

    return { maxReadable, readableSamples };
  });
  expect(timelineDensity.maxReadable).toBe(1);
  expect(timelineDensity.readableSamples).toBeLessThan(45);
});

test("reduced motion renders every chapter as a static scene", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("[data-solar-stage]")).toBeHidden();
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
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const sample = async (progress: number) => {
    await page.evaluate((targetProgress) => {
      const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
      if (!root) return;
      const top = window.scrollY + root.getBoundingClientRect().top;
      window.scrollTo({
        top: top + targetProgress * (root.offsetHeight - window.innerHeight),
        behavior: "auto",
      });
    }, progress);
    await page.waitForTimeout(80);

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
  const noon = await sample(0.38);
  const golden = await sample(0.68);
  const night = await sample(1);

  expect(noon.altitude).toBeGreaterThan(0.85);
  expect(noon.panelLight).toBeGreaterThan(predawn.panelLight + 0.7);
  expect(noon.shadow).toBeLessThan(predawn.shadow);
  expect(predawn.battery).toBe(0);
  expect(golden.battery).toBeGreaterThan(0.95);
  expect(golden.homeLight).toBe(0);
  expect(night.homeLight).toBeGreaterThan(0.95);
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
