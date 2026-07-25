import { expect, test } from "@playwright/test";

import { solarPhaseAnchors, solarTransitionMidpoints } from "../../src/lib/solar/solar-phase";

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
  // Anchors and transition midpoints come from the same canonical model the
  // page renders from, so the sampled points can never drift away from the
  // windows they are meant to probe. Each midpoint is provably clear of both
  // neighbouring windows (asserted in tests/unit/solar-phase.test.ts).
  const anchors = solarPhaseAnchors.map((anchor) => [anchor.id, anchor.progress] as const);
  const transitions = solarTransitionMidpoints;

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator('[aria-label="A solar day"][data-enhanced="true"]')).toBeAttached();
    // Web fonts change chapter geometry; measuring the scroll distance before
    // they settle is one of the ways this test used to drift in CI.
    await page.evaluate(() => document.fonts.ready);
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
      // Wait for the scene to actually catch up instead of for a fixed number
      // of milliseconds. Two things can lag an arbitrary amount under CI load:
      // the scroll event that schedules the controller's animation frame, and
      // the React commit that renders `aria-current="step"` after
      // `data-text-phase` was written. This waits until the progress the
      // controller has rendered matches where the page really is *and* the
      // controller reports that React has caught up.
      await page.waitForFunction(() => {
        const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
        if (!root || root.dataset.solarReady !== "true") return false;
        const rect = root.getBoundingClientRect();
        const distance = Math.max(1, root.offsetHeight - window.innerHeight);
        const live = Math.min(1, Math.max(0, -rect.top / distance));
        const rendered = Number.parseFloat(
          getComputedStyle(root).getPropertyValue("--solar-progress"),
        );
        return Number.isFinite(rendered) && Math.abs(live - rendered) < 0.001;
      });
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

  // All six chapters keep their heading and supporting copy.
  await expect(
    page.getByRole("heading", { name: /powering homes & businesses with clean solar energy/i }),
  ).toBeVisible();
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

  // Every chapter's supporting copy is readable, not just the morning one
  // that regressed.
  const ledeCount = await page.locator(".solar-lede").count();
  expect(ledeCount).toBeGreaterThan(0);
  for (let index = 0; index < ledeCount; index += 1) {
    await expect(page.locator(".solar-lede").nth(index)).toBeVisible();
  }

  // Chapters sit in normal document flow instead of being pinned on top of
  // one another, so the page reads as a sequence of static scenes.
  const layout = await page.locator(".solar-chapter").evaluateAll((chapters) => ({
    positionModes: [...new Set(chapters.map((chapter) => getComputedStyle(chapter).position))],
    distinctTops: new Set(
      chapters.map((chapter) => Math.round(chapter.getBoundingClientRect().top)),
    ).size,
    count: chapters.length,
  }));
  expect(layout.count).toBe(6);
  expect(layout.positionModes).toEqual(["relative"]);
  expect(layout.distinctTops).toBe(layout.count);

  // Calls to action remain usable without any animated navigation — the sun
  // control is hidden under reduced motion, so the in-chapter links are the
  // only route onward.
  const quotationAction = page.locator(".solar-night-action");
  await expect(quotationAction).toBeVisible();
  await expect(quotationAction).toHaveAttribute("href", /\/contact/);
  // The morning and golden chapters carry the in-story links; both are
  // hidden by the enhanced-state rules that regressed here.
  await expect(page.locator(".solar-chapter--morning .solar-text-link")).toBeVisible();
  await expect(page.locator(".solar-chapter--golden .solar-text-link")).toBeVisible();

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.locator(".solar-chapter--morning .solar-lede")).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  }
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
