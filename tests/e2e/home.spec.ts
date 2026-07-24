import { expect, test } from "@playwright/test";

test("home page opens with the quiet pre-dawn story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /harness the power of the sun/i })).toBeVisible();
  await expect(
    page.getByText("Powering homes and businesses with clean solar energy."),
  ).toBeVisible();
  await expect(page.getByText("Follow the sun")).toBeVisible();
  await expect(page.getByText("The day begins.", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /open solar day navigation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "About", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveCount(0);
});

test("the sun navigates the day and hands the final action to the home", async ({ page }) => {
  await page.goto("/");
  const sun = page.getByRole("button", { name: /open solar day navigation/i });
  await sun.focus();
  await page.keyboard.press("End");

  const finalHome = page.locator('[data-object-cue-link="home"]');
  await expect(finalHome).toBeVisible();
  await expect(finalHome).toHaveAttribute("tabindex", "0");
  await expect(page.getByRole("heading", { name: /the sun is still working/i })).toBeVisible();
  await finalHome.click();
  await expect(page).toHaveURL(/\/services$/);
});

test("phase copy windows are exclusive and synchronized on desktop and mobile", async ({
  page,
}) => {
  const anchors = [
    ["predawn", 0],
    ["predawn", 0.08],
    ["morning", 0.19],
    ["noon", 0.38],
    ["golden", 0.57],
    ["sunset", 0.76],
    ["night", 1],
  ] as const;
  const transitions = [0.16, 0.3, 0.49, 0.68, 0.86] as const;

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

    await sample(0.19);
    await expect(page.locator(".solar-chapter--morning .solar-lede")).toBeVisible();

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
    page.getByRole("heading", { name: "Sunlight becomes power.", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".solar-chapter--morning .solar-lede")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Power becomes possibility.", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /energy becomes reserve/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /the day transitions/i })).toBeVisible();
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

test("landscape objects become the contextual routes and energy reaches the home", async ({
  page,
}) => {
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
    await page.waitForTimeout(progress === 1 ? 500 : 100);
  };

  const panelCue = page.locator('[data-object-cue-link="panel"]');
  const batteryCue = page.locator('[data-object-cue-link="battery"]');
  const homeCue = page.locator('[data-object-cue-link="home"]');

  await sample(0.29);
  await expect(panelCue).toBeVisible();
  await expect(panelCue).toHaveAttribute("href", "/services");
  await expect(panelCue).toHaveAttribute("tabindex", "0");
  await expect(batteryCue).toHaveAttribute("tabindex", "-1");

  await sample(0.67);
  await expect(panelCue).toHaveAttribute("tabindex", "-1");
  await expect(batteryCue).toBeVisible();
  await expect(batteryCue).toHaveAttribute("href", "/products");
  await expect(batteryCue).toHaveAttribute("tabindex", "0");

  await sample(0.76);
  await expect(batteryCue).toHaveAttribute("tabindex", "-1");
  await expect(homeCue).toHaveAttribute("tabindex", "-1");

  await sample(0.94);
  await expect(homeCue).toHaveAttribute("tabindex", "-1");
  const roofArrival = await page.locator('[aria-label="A solar day"]').evaluate((root) => {
    const styles = getComputedStyle(root);
    return {
      sunDissolve: Number.parseFloat(styles.getPropertyValue("--sun-dissolve")),
      homeLight: Number.parseFloat(styles.getPropertyValue("--home-light")),
      ctaReveal: Number.parseFloat(styles.getPropertyValue("--cta-reveal")),
    };
  });
  expect(roofArrival.sunDissolve).toBeLessThan(0.05);
  expect(roofArrival.homeLight).toBeLessThan(0.05);
  expect(roofArrival.ctaReveal).toBeLessThan(0.05);

  await sample(0.972);
  const illuminatedHome = await page.locator('[aria-label="A solar day"]').evaluate((root) => {
    const styles = getComputedStyle(root);
    return {
      homeLight: Number.parseFloat(styles.getPropertyValue("--home-light")),
      doorLight: Number.parseFloat(styles.getPropertyValue("--door-light")),
      ctaReveal: Number.parseFloat(styles.getPropertyValue("--cta-reveal")),
    };
  });
  expect(illuminatedHome.homeLight).toBeGreaterThan(0.95);
  expect(illuminatedHome.doorLight).toBeLessThan(0.05);
  expect(illuminatedHome.ctaReveal).toBeLessThan(0.05);

  await sample(0.99);
  const illuminatedDoor = await page.locator('[aria-label="A solar day"]').evaluate((root) => {
    const styles = getComputedStyle(root);
    return {
      doorLight: Number.parseFloat(styles.getPropertyValue("--door-light")),
      ctaReveal: Number.parseFloat(styles.getPropertyValue("--cta-reveal")),
    };
  });
  expect(illuminatedDoor.doorLight).toBeGreaterThan(0.95);
  expect(illuminatedDoor.ctaReveal).toBeLessThan(0.05);

  await sample(1);
  await expect(panelCue).toHaveAttribute("tabindex", "-1");
  await expect(batteryCue).toHaveAttribute("tabindex", "-1");
  await expect(homeCue).toHaveAttribute("tabindex", "0");
  await expect(homeCue).toHaveAttribute("href", "/services");
  await expect(homeCue).toBeVisible();
  await expect(page.getByRole("link", { name: /^Call / })).toHaveCount(0);

  const handoff = await page.locator('[aria-label="A solar day"]').evaluate((root) => {
    const styles = getComputedStyle(root);
    const panel = root.querySelector<HTMLElement>('[data-object-cue-link="panel"]');
    return {
      sunDissolve: Number.parseFloat(styles.getPropertyValue("--sun-dissolve")),
      batteryVisibility: Number.parseFloat(styles.getPropertyValue("--battery-visibility")),
      panelOpacity: panel ? Number.parseFloat(getComputedStyle(panel).opacity) : 1,
      homeLight: Number.parseFloat(styles.getPropertyValue("--home-light")),
      ctaReveal: Number.parseFloat(styles.getPropertyValue("--cta-reveal")),
    };
  });
  expect(handoff.sunDissolve).toBeGreaterThan(0.95);
  expect(handoff.batteryVisibility).toBeLessThan(0.05);
  expect(handoff.panelOpacity).toBeLessThan(0.05);
  expect(handoff.homeLight).toBeGreaterThan(0.95);
  expect(handoff.ctaReveal).toBeGreaterThan(0.95);
});

for (const gateway of [
  { name: "solar panel", progress: 0.29, selector: "panel", destination: "/services" },
  { name: "battery", progress: 0.67, selector: "battery", destination: "/products" },
] as const) {
  test(`${gateway.name} gateway navigates from the landscape object`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator('[aria-label="A solar day"][data-enhanced="true"]')).toBeAttached();
    await page.locator('[aria-label="A solar day"]').evaluate((root, targetProgress) => {
      const top = window.scrollY + root.getBoundingClientRect().top;
      window.scrollTo({
        top: top + targetProgress * (root.scrollHeight - window.innerHeight),
        behavior: "auto",
      });
    }, gateway.progress);

    const object = page.locator(`[data-object-cue-link="${gateway.selector}"]`);
    await expect(object).toHaveAttribute("tabindex", "0");
    await object.click();
    await expect(page).toHaveURL(new RegExp(`${gateway.destination}$`));
  });
}

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
