import { expect, type Page, test } from "@playwright/test";

/**
 * Scrolls the story to a progress value using the same mapping as the
 * controller (`getStoryDistance`: total height minus one viewport minus
 * the 0.9-viewport settled-night hold), then waits until the controller
 * reports the scene has caught up — the rendered `--solar-progress`
 * matches the live scroll position and `data-solar-ready` confirms the
 * React commit (aria-current) has landed.
 */
async function moveSolarStoryTo(page: Page, progress: number) {
  await page.evaluate((targetProgress) => {
    const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
    if (!root) return;
    document.documentElement.style.scrollBehavior = "auto";
    const top = window.scrollY + root.getBoundingClientRect().top;
    const distance = Math.max(
      1,
      root.offsetHeight - window.innerHeight - Math.round(window.innerHeight * 0.9),
    );
    window.scrollTo({ top: top + targetProgress * distance, behavior: "auto" });
  }, progress);
  await page.waitForFunction(() => {
    const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
    if (!root || root.dataset.solarReady !== "true") return false;
    const rect = root.getBoundingClientRect();
    const distance = Math.max(
      1,
      root.offsetHeight - window.innerHeight - Math.round(window.innerHeight * 0.9),
    );
    const live = Math.min(1, Math.max(0, -rect.top / distance));
    const rendered = Number.parseFloat(getComputedStyle(root).getPropertyValue("--solar-progress"));
    return Number.isFinite(rendered) && Math.abs(live - rendered) < 0.001;
  });
}

/**
 * Waits until an element's bounding box has been unchanged across three
 * consecutive samples 120ms apart — roughly 240ms of stillness. The sun
 * animates into its settled position over a 650ms CSS transition, and two
 * adjacent animation frames can round to the same box mid-flight, so
 * geometry assertions need sustained stillness rather than a single
 * frame-to-frame match.
 */
async function waitForStableBox(page: Page, selector: string) {
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector<HTMLElement>(sel);
      if (!element) return false;
      const box = element.getBoundingClientRect();
      const key = `${Math.round(box.left)},${Math.round(box.top)},${Math.round(
        box.width,
      )},${Math.round(box.height)}`;
      const store = window as unknown as {
        __boxes?: Record<string, { key: string; hits: number }>;
      };
      store.__boxes ??= {};
      const previous = store.__boxes[sel];
      const hits = previous && previous.key === key ? previous.hits + 1 : 0;
      store.__boxes[sel] = { key, hits };
      return hits >= 2;
    },
    selector,
    { polling: 120 },
  );
}

async function readSceneVariable(page: Page, name: string): Promise<number> {
  return page
    .locator('[aria-label="A solar day"]')
    .evaluate(
      (root, variable) => Number.parseFloat(getComputedStyle(root).getPropertyValue(variable)),
      name,
    );
}

async function expectSolarTextPhase(page: Page, phase: string) {
  await expect
    .poll(async () =>
      page.locator('[aria-label="A solar day"]').evaluate((root) => root.dataset.textPhase),
    )
    .toBe(phase);
}

function storyLink(page: Page, phase: "morning" | "golden") {
  return phase === "morning"
    ? page.locator('a[aria-label="Open Solar Solutions from the solar panel"]')
    : page.locator('a[aria-label="Open Products for batteries and inverters"]');
}

async function expectStoryLinkVisibility(
  page: Page,
  phase: "morning" | "golden",
  visibility: "hidden" | "visible",
) {
  const link = storyLink(page, phase);
  await expect
    .poll(async () => link.evaluate((element) => getComputedStyle(element).visibility))
    .toBe(visibility);
  if (visibility === "visible") {
    await expect(link).toBeVisible();
  } else {
    await expect(link).toBeHidden();
  }
}

async function expectStoryLinkFocusability(
  page: Page,
  phase: "morning" | "golden",
  canFocus: boolean,
) {
  const link = storyLink(page, phase);
  const focused = await link.evaluate((element) => {
    const target = element as HTMLElement;
    target.focus();
    return document.activeElement === target;
  });
  expect(focused).toBe(canFocus);
}

async function expectStoryLinksSkippedByTab(page: Page) {
  await page.locator("body").focus();
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    const activeStoryLink = await page.evaluate(() => {
      const active = document.activeElement;
      return Boolean(
        active?.matches(
          '.solar-chapter--morning .solar-text-link, .solar-chapter--golden .solar-text-link, a[aria-label="Open Solar Solutions from the solar panel"], a[aria-label="Open Products for batteries and inverters"]',
        ),
      );
    });
    expect(activeStoryLink).toBe(false);
  }
}

async function openSolarHome(page: Page) {
  await page.goto("/");
  await expect(page.locator('[aria-label="A solar day"][data-enhanced="true"]')).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
}

async function expectNoCollision(page: Page, linkSelector: string, headingSelector: string) {
  await expect
    .poll(async () =>
      page.evaluate(
        ({ linkSelector, headingSelector }) => {
          const link = document.querySelector<HTMLElement>(linkSelector);
          const heading = document.querySelector<HTMLElement>(headingSelector);
          const sun = document.querySelector<HTMLElement>(
            'button[aria-controls="solar-phase-navigation"]',
          );
          if (!link || !heading || !sun) return true;
          const overlap = (a: DOMRect, b: DOMRect) =>
            a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          const linkBox = link.getBoundingClientRect();
          return (
            overlap(linkBox, heading.getBoundingClientRect()) ||
            overlap(linkBox, sun.getBoundingClientRect())
          );
        },
        { linkSelector, headingSelector },
      ),
    )
    .toBe(false);
}

test("home page renders the hero with the confirmed brand tagline", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /powering homes & businesses with clean solar energy/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /open solar day navigation/i })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", {
      name: "About",
      exact: true,
    }),
  ).toHaveAttribute("href", "/about");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", {
      name: "Projects",
      exact: true,
    }),
  ).toHaveAttribute("href", "/projects");
});

test("the sun is a keyboard-operable phase navigator and hands off to the final action", async ({
  page,
}) => {
  await page.goto("/");
  const sun = page.getByRole("button", { name: /open solar day navigation/i });
  await sun.focus();
  await page.keyboard.press("End");

  const finalAction = page.getByRole("link", {
    name: /request a quotation from the illuminated house/i,
  });
  await expect(finalAction).toBeVisible();
  await expect(page.getByRole("heading", { name: /the sun is still working/i })).toBeVisible();
  await finalAction.click();
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
  const transitions = [0.1175, 0.2975, 0.4875, 0.6775, 0.865] as const;

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await openSolarHome(page);

    const sceneGeometry = await page.locator(".solar-chapter").evaluateAll((chapters) => ({
      topPositions: [
        ...new Set(chapters.map((chapter) => Math.round(chapter.getBoundingClientRect().top))),
      ],
      positionModes: [...new Set(chapters.map((chapter) => getComputedStyle(chapter).position))],
    }));
    expect(sceneGeometry.topPositions).toHaveLength(1);
    expect(sceneGeometry.positionModes).toEqual(["absolute"]);

    const sample = async (progress: number) => {
      await moveSolarStoryTo(page, progress);
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
      expect(result.textPhase).not.toBe("transition");
      expect(result.readableCount).toBeGreaterThanOrEqual(1);
      expect(result.readableCount).toBeLessThanOrEqual(2);
      expect(result.activeCount).toBe(1);
      expect(result.activeHref).toBe(`#solar-${result.textPhase}`);
    }
  }

  const timelineDensity = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
    if (!root) return { maxReadable: 0, readableSamples: 0 };
    const top = window.scrollY + root.getBoundingClientRect().top;
    const distance = Math.max(
      1,
      root.offsetHeight - window.innerHeight - Math.round(window.innerHeight * 0.9),
    );
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
  expect(timelineDensity.maxReadable).toBeLessThanOrEqual(2);
  expect(timelineDensity.readableSamples).toBe(101);
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
  await expect(
    page.getByRole("heading", { name: "Sunlight becomes current.", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /energy becomes reserve/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /light changes hands/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /the sun is still working/i })).toBeVisible();

  const ledeCount = await page.locator(".solar-lede").count();
  expect(ledeCount).toBe(6);
  for (let index = 0; index < ledeCount; index += 1) {
    await expect(page.locator(".solar-lede").nth(index)).toBeVisible();
  }

  // Chapters sit in normal document flow instead of being pinned on top
  // of one another.
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

  // Story links are usable in their static chapters.
  await expect(page.locator(".solar-chapter--morning .solar-text-link")).toBeVisible();
  await expect(page.locator(".solar-chapter--golden .solar-text-link")).toBeVisible();

  // Night: exactly one visible quotation action inside the story, no
  // phone link anywhere on the page.
  const nightChapter = page.locator(".solar-chapter--night");
  await expect(nightChapter.locator(".solar-night-action")).toBeVisible();
  await expect(nightChapter.getByText(/request a quotation/i)).toHaveCount(1);
  await expect(nightChapter.locator('a[href="/contact"]')).toHaveCount(1);
  await expect(page.locator('[aria-label="A solar day"] a[href^="tel:"]')).toHaveCount(0);

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
  await openSolarHome(page);

  const sample = async (progress: number) => {
    await moveSolarStoryTo(page, progress);
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
  await expect(page.getByRole("link", { name: "About", exact: true }).last()).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects", exact: true }).last()).toBeVisible();
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

test.describe("story links", () => {
  test("hide inactive story links from keyboard focus", async ({ page }) => {
    await openSolarHome(page);
    await expectSolarTextPhase(page, "predawn");
    await expectStoryLinkVisibility(page, "morning", "hidden");
    await expectStoryLinkVisibility(page, "golden", "hidden");
    await expectStoryLinkFocusability(page, "morning", false);
    await expectStoryLinkFocusability(page, "golden", false);
    await expectStoryLinksSkippedByTab(page);

    for (const [phase, progress, panelVisible] of [
      ["noon", 0.38, true],
      ["sunset", 0.76, false],
      ["night", 1, false],
    ] as const) {
      await moveSolarStoryTo(page, progress);
      await expectSolarTextPhase(page, phase);
      await expectStoryLinkVisibility(page, "morning", panelVisible ? "visible" : "hidden");
      await expectStoryLinkVisibility(page, "golden", "hidden");
      await expectStoryLinkFocusability(page, "morning", panelVisible);
      await expectStoryLinkFocusability(page, "golden", false);
      if (!panelVisible) await expectStoryLinksSkippedByTab(page);
    }
  });

  test("show the in-story navigation links in their intended phases without overflow", async ({
    page,
  }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await openSolarHome(page);

      await moveSolarStoryTo(page, 0.2);
      await expectSolarTextPhase(page, "morning");
      const servicesLink = page.getByRole("link", {
        name: /open solar solutions from the solar panel/i,
      });
      await expect(servicesLink).toBeVisible();
      await expectStoryLinkVisibility(page, "morning", "visible");
      await expect(servicesLink).toHaveAttribute("href", "/services");
      await servicesLink.focus();
      await expect(servicesLink).toBeFocused();
      await expectStoryLinkFocusability(page, "morning", true);
      await expectStoryLinkVisibility(page, "golden", "hidden");
      await expectStoryLinkFocusability(page, "golden", false);
      await expectNoCollision(
        page,
        'a[aria-label="Open Solar Solutions from the solar panel"] span',
        "#morning-title",
      );

      await moveSolarStoryTo(page, 0.58);
      await expectSolarTextPhase(page, "golden");
      const productsLink = page.getByRole("link", {
        name: /open products for batteries and inverters/i,
      });
      await expect(productsLink).toBeVisible();
      await expectStoryLinkVisibility(page, "golden", "visible");
      await expect(productsLink).toHaveAttribute("href", "/products");
      await productsLink.focus();
      await expect(productsLink).toBeFocused();
      await expectStoryLinkFocusability(page, "golden", true);
      await expectStoryLinkVisibility(page, "morning", "hidden");
      await expectStoryLinkFocusability(page, "morning", false);
      await expectNoCollision(
        page,
        'a[aria-label="Open Products for batteries and inverters"] span',
        "#golden-title",
      );

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    }
  });

  test("navigate to the intended public routes", async ({ page }) => {
    await openSolarHome(page);
    await moveSolarStoryTo(page, 0.2);
    await expectSolarTextPhase(page, "morning");
    await page.getByRole("link", { name: /open solar solutions from the solar panel/i }).click();
    await expect(page).toHaveURL(/\/services$/);

    await openSolarHome(page);
    await moveSolarStoryTo(page, 0.58);
    await expectSolarTextPhase(page, "golden");
    await page.getByRole("link", { name: /open products for batteries and inverters/i }).click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test("preserve sun drag, keyboard phase navigation, and the final night action", async ({
    page,
  }) => {
    await openSolarHome(page);
    const root = page.locator('[aria-label="A solar day"]');
    const sun = page.getByRole("button", { name: /open solar day navigation/i });
    await sun.focus();
    await page.keyboard.press("ArrowDown");
    await expect
      .poll(async () => root.evaluate((element) => element.dataset.phase))
      .toBe("morning");

    const box = await sun.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(page.viewportSize()!.width * 0.72, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect
      .poll(async () => root.evaluate((element) => element.dataset.phase))
      .not.toBe("predawn");

    await sun.focus();
    await page.keyboard.press("End");
    const finalAction = page.getByRole("link", {
      name: /request a quotation from the illuminated house/i,
    });
    await expect(finalAction).toBeVisible();
    await finalAction.click();
    await expect(page).toHaveURL(/\/contact$/);
  });
});

test.describe("solar story", () => {
  test("the scene contains the relay objects and none of the removed chrome", async ({ page }) => {
    await openSolarHome(page);
    const stage = page.locator("[data-solar-stage]");
    await expect(stage.locator("[data-solar-panels]")).toHaveCount(1);
    await expect(stage.locator("[data-solar-energy-path]")).toHaveCount(1);
    await expect(stage.locator("[data-solar-battery]")).toHaveCount(1);
    await expect(stage.locator("[data-solar-home]")).toHaveCount(1);
    // The decorative "SOLAR DAY 05:42 — 19:11" readout is gone.
    await expect(page.getByText(/05:42 — 19:11/)).toHaveCount(0);
    // Individual chapter timestamps are gone too; phase labels can
    // orient the story without creating a technical readout.
    await expect(page.locator(".solar-time time")).toHaveCount(0);
    // The night phone link is gone from the story (the footer's
    // site-wide contact link is outside the solar experience).
    await expect(page.locator('[aria-label="A solar day"] a[href^="tel:"]')).toHaveCount(0);
  });

  test("morning activates the panels and starts the collection flow", async ({ page }) => {
    await openSolarHome(page);
    await moveSolarStoryTo(page, 0);
    const predawnFocus = await readSceneVariable(page, "--panel-focus");
    const predawnFlow = await readSceneVariable(page, "--conversion-flow");
    expect(predawnFocus).toBe(0);
    expect(predawnFlow).toBe(0);

    await moveSolarStoryTo(page, 0.19);
    await expectSolarTextPhase(page, "morning");
    const morningFocus = await readSceneVariable(page, "--panel-focus");
    const morningFlow = await readSceneVariable(page, "--conversion-flow");
    expect(morningFocus).toBeGreaterThan(predawnFocus);
    expect(morningFocus).toBe(1);
    expect(morningFlow).toBeGreaterThan(0);
    await expectStoryLinkVisibility(page, "morning", "visible");
    await expectStoryLinkFocusability(page, "golden", false);
  });

  test("noon is a measurably stronger conversion state than morning", async ({ page }) => {
    await openSolarHome(page);
    await moveSolarStoryTo(page, 0.19);
    const morningFlow = await readSceneVariable(page, "--conversion-flow");

    await moveSolarStoryTo(page, 0.38);
    await expectSolarTextPhase(page, "noon");
    const noonFlow = await readSceneVariable(page, "--conversion-flow");
    const noonAltitude = await readSceneVariable(page, "--solar-altitude");
    expect(noonFlow).toBe(1);
    expect(noonFlow).toBeGreaterThan(morningFlow);
    expect(noonAltitude).toBeGreaterThan(0.85);
    await expectStoryLinkFocusability(page, "morning", true);
    await expectStoryLinkFocusability(page, "golden", false);
  });

  test("golden hour makes the battery the charged subject", async ({ page }) => {
    await openSolarHome(page);
    await moveSolarStoryTo(page, 0.19);
    const morningBattery = await readSceneVariable(page, "--battery-focus");

    await moveSolarStoryTo(page, 0.57);
    await expectSolarTextPhase(page, "golden");
    const goldenBattery = await readSceneVariable(page, "--battery-focus");
    expect(morningBattery).toBe(0);
    expect(goldenBattery).toBe(1);
    for (const variable of ["--charge-low", "--charge-mid", "--charge-high"]) {
      expect(await readSceneVariable(page, variable)).toBe(1);
    }
    expect(await readSceneVariable(page, "--stored-glow")).toBeGreaterThan(0);
    await expect(page.locator("[data-solar-battery]")).toBeVisible();
    await expectStoryLinkVisibility(page, "golden", "visible");
  });

  test("sunset hands collection over to stored power and the home approaches", async ({ page }) => {
    await openSolarHome(page);
    await moveSolarStoryTo(page, 0.38);
    const noonPanels = await readSceneVariable(page, "--panel-focus");

    await moveSolarStoryTo(page, 0.76);
    await expectSolarTextPhase(page, "sunset");
    const sunsetPanels = await readSceneVariable(page, "--panel-focus");
    const handoff = await readSceneVariable(page, "--handoff-flow");
    const home = await readSceneVariable(page, "--home-focus");
    const battery = await readSceneVariable(page, "--battery-presence");
    expect(sunsetPanels).toBeLessThan(noonPanels);
    expect(handoff).toBeGreaterThan(0);
    expect(home).toBeGreaterThan(0);
    expect(battery).toBe(1);
    await expectStoryLinksSkippedByTab(page);
  });

  test("night centers the lit home and resolves the journey", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
      { width: 320, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await openSolarHome(page);
      await moveSolarStoryTo(page, 1);
      await expectSolarTextPhase(page, "night");

      expect(await readSceneVariable(page, "--home-focus")).toBe(1);
      expect(await readSceneVariable(page, "--home-light")).toBeGreaterThan(0.95);
      expect(await readSceneVariable(page, "--handoff-flow")).toBeGreaterThan(0.5);

      await waitForStableBox(page, 'button[aria-controls="solar-phase-navigation"]');
      await waitForStableBox(page, "[data-solar-home]");

      const geometry = await page.evaluate(() => {
        const home = document.querySelector<HTMLElement>("[data-solar-home]");
        const heading = document.querySelector<HTMLElement>("#night-title");
        const sun = document.querySelector<HTMLElement>(
          'button[aria-controls="solar-phase-navigation"]',
        );
        if (!home || !heading || !sun) return null;
        const homeBox = home.getBoundingClientRect();
        const overlap = (a: DOMRect, b: DOMRect) =>
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        return {
          homeCenterOffset:
            Math.abs(homeBox.left + homeBox.width / 2 - window.innerWidth / 2) / window.innerWidth,
          homeFullyOnScreen:
            homeBox.left >= 0 &&
            homeBox.right <= window.innerWidth &&
            homeBox.bottom <= window.innerHeight,
          headingOverlapsHome: overlap(heading.getBoundingClientRect(), homeBox),
          sunVisible: getComputedStyle(sun).visibility === "visible",
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });
      expect(geometry).not.toBeNull();
      // Optical centering: bounding-box center within 12% of viewport center.
      expect(geometry!.homeCenterOffset).toBeLessThan(0.12);
      expect(geometry!.homeFullyOnScreen).toBe(true);
      expect(geometry!.headingOverlapsHome).toBe(false);
      expect(geometry!.sunVisible).toBe(false);
      expect(geometry!.overflow).toBe(false);
    }
  });

  test("settled night shows exactly one quotation action and no phone link", async ({ page }) => {
    await openSolarHome(page);
    await moveSolarStoryTo(page, 1);
    await expect(
      page.locator('[aria-label="A solar day"][data-sun-settled="true"]'),
    ).toBeAttached();

    const story = page.locator('[aria-label="A solar day"]');
    // The illuminated house is the single visible quotation action…
    await expect(
      story.getByRole("link", { name: /request a quotation from the illuminated house/i }),
    ).toBeVisible();
    // …the in-chapter fallback stays hidden under normal motion…
    await expect(story.locator(".solar-night-action")).toBeHidden();
    // …no phone link exists inside the story…
    await expect(story.locator('a[href^="tel:"]')).toHaveCount(0);
    // …and the hidden fallback never enters the tab order.
    await page.locator("body").focus();
    for (let index = 0; index < 15; index += 1) {
      await page.keyboard.press("Tab");
      const onHiddenCta = await page.evaluate(() =>
        Boolean(document.activeElement?.matches(".solar-night-action")),
      );
      expect(onHiddenCta).toBe(false);
    }
  });

  test("the settled night scene holds before the next section can enter", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await openSolarHome(page);
      await moveSolarStoryTo(page, 1);
      await expect(
        page.locator('[aria-label="A solar day"][data-sun-settled="true"]'),
      ).toBeAttached();

      // At settle, the next section stays entirely below the viewport.
      const exitTop = await page
        .locator("#after-solar-story")
        .evaluate((element) => element.getBoundingClientRect().top);
      expect(exitTop).toBeGreaterThanOrEqual(await page.evaluate(() => window.innerHeight));

      // A deliberate scroll beyond the hold reaches it normally — scroll
      // is not trapped.
      await page.locator("#after-solar-story").scrollIntoViewIfNeeded();
      await expect(page.locator("#after-solar-story")).toBeInViewport();
      await expect(page.getByRole("navigation", { name: /continue exploring/i })).toBeVisible();
    }
  });

  test("the phase menu opens intentionally and closes after selection", async ({ page }) => {
    await openSolarHome(page);
    const nav = page.locator("#solar-phase-navigation");
    await expect(nav).toBeHidden();

    const sun = page.getByRole("button", { name: /open solar day navigation/i });
    await sun.click();
    await expect(nav).toBeVisible();

    await nav.getByRole("link", { name: "Noon" }).click();
    await expect
      .poll(async () =>
        page.locator('[aria-label="A solar day"]').evaluate((root) => root.dataset.navOpen),
      )
      .toBe("false");
    await expect
      .poll(async () =>
        page.locator('[aria-label="A solar day"]').evaluate((root) => root.dataset.textPhase),
      )
      .toBe("noon");
  });
});
