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
  return page.locator(`.solar-chapter--${phase} .solar-text-link`);
}

function semanticStoryLink(page: Page, target: "panel" | "battery" | "house") {
  return page.getByTestId(`solar-${target}-link`);
}

function expectedEnvironmentPhase(progress: number) {
  if (progress < 0.1) return "predawn";
  if (progress < 0.3) return "morning";
  if (progress < 0.5) return "noon";
  if (progress < 0.7) return "golden";
  if (progress < 0.88) return "sunset";
  return "night";
}

function expectedCurrentState(progress: number) {
  if (progress < 0.14) return "off";
  if (progress < 0.3) return "forming";
  if (progress < 0.52) return "active";
  if (progress < 0.72) return "arriving";
  return "complete";
}

function expectedTextPhase(progress: number) {
  const windows = [
    ["predawn", 0, 0.135],
    ["morning", 0.105, 0.305],
    ["noon", 0.275, 0.49],
    ["golden", 0.455, 0.695],
    ["sunset", 0.665, 0.875],
    ["night", 0.84, 1],
  ] as const;
  return (
    windows.find(([, start, end]) => progress >= start && progress <= end)?.[0] ?? "transition"
  );
}

async function readSolarSnapshot(page: Page) {
  return page.locator('[aria-label="A solar day"]').evaluate((root) => {
    const styles = getComputedStyle(root);
    const attr = (name: string) => root.getAttribute(name);
    const active = document.activeElement;
    const visibleAndFocusable = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return false;
      const computed = getComputedStyle(element);
      return (
        computed.visibility !== "hidden" &&
        computed.display !== "none" &&
        element.tabIndex !== -1 &&
        element.getAttribute("aria-hidden") !== "true"
      );
    };
    return {
      progress: Number.parseFloat(styles.getPropertyValue("--solar-progress")),
      phase: root.getAttribute("data-phase"),
      textPhase: root.getAttribute("data-text-phase"),
      currentState: root.getAttribute("data-current-state"),
      solarReady: root.getAttribute("data-solar-ready"),
      panelPresence: Number.parseFloat(styles.getPropertyValue("--panel-presence")),
      batteryPresence: Number.parseFloat(styles.getPropertyValue("--battery-presence")),
      batteryEntry: Number.parseFloat(styles.getPropertyValue("--battery-entry")),
      houseContact: Number.parseFloat(styles.getPropertyValue("--house-contact")),
      homeLight: Number.parseFloat(styles.getPropertyValue("--home-light")),
      activeMarker: document
        .querySelector("#solar-phase-navigation [aria-current='step']")
        ?.textContent?.trim(),
      panelFocusable: visibleAndFocusable('[data-testid="solar-panel-link"]'),
      batteryFocusable: visibleAndFocusable('[data-testid="solar-battery-link"]'),
      houseFocusable: visibleAndFocusable('[data-testid="solar-house-link"]'),
      sunFocusable:
        document.querySelector<HTMLElement>('button[aria-controls="solar-phase-navigation"]')
          ?.tabIndex !== -1,
      hiddenActiveElement: Boolean(active?.closest("[aria-hidden='true']")),
      rootDataPhase: attr("data-phase"),
    };
  });
}

async function expectSnapshotMatchesProgress(page: Page, progress: number) {
  const snapshot = await readSolarSnapshot(page);
  expect(snapshot.solarReady).toBe("true");
  expect(snapshot.progress).toBeCloseTo(progress, 2);
  expect(snapshot.phase).toBe(expectedEnvironmentPhase(progress));
  expect(snapshot.currentState).toBe(expectedCurrentState(progress));
  expect(snapshot.textPhase).toBe(expectedTextPhase(progress));
  expect(snapshot.hiddenActiveElement).toBe(false);
  if (progress < 0.84) expect(snapshot.houseFocusable).toBe(false);
  if (snapshot.textPhase !== "transition") {
    const marker = snapshot.activeMarker?.toLowerCase().replace(/[^a-z]/g, "");
    const phase = String(snapshot.textPhase)
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    expect(marker).toContain(phase);
  }
  if (progress >= 0.95) {
    expect(snapshot.sunFocusable).toBe(false);
    expect(snapshot.houseFocusable).toBe(true);
    expect(snapshot.panelPresence).toBe(0);
    expect(snapshot.batteryPresence).toBe(0);
    expect(snapshot.houseContact).toBeGreaterThan(0.8);
  }
  if (progress >= 0.42 && progress < 0.94) expect(snapshot.batteryEntry).toBeGreaterThan(0);
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
          ".solar-chapter--morning .solar-text-link, .solar-chapter--golden .solar-text-link",
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
  await expect(page.getByRole("link", { name: "About", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveCount(0);
});

test("the sun is a keyboard-operable phase navigator before the house becomes the final action", async ({
  page,
}) => {
  await page.goto("/");
  const sun = page.getByRole("button", { name: /open solar day navigation/i });
  await sun.focus();
  await page.keyboard.press("End");

  await expect(page.getByRole("heading", { name: /the sun is still working/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /night\./i })).toHaveCount(0);
  const houseCta = page.getByRole("link", {
    name: /request a quotation from the illuminated house/i,
  });
  await expect(houseCta).toBeVisible();
  await houseCta.click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("phase copy windows crossfade deliberately and stay synchronized on desktop and mobile", async ({
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
  expect(timelineDensity.readableSamples).toBeGreaterThan(82);
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
        panelPresence: read("--panel-presence"),
        battery: read("--battery-presence"),
        houseContact: read("--house-contact"),
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
  expect(night.panelPresence).toBe(0);
  expect(night.battery).toBe(0);
  expect(night.houseContact).toBeGreaterThan(0.95);
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

test.describe("story links", () => {
  test("hide inactive story links from keyboard focus", async ({ page }) => {
    await openSolarHome(page);
    await expectSolarTextPhase(page, "predawn");
    await expectStoryLinkVisibility(page, "morning", "hidden");
    await expectStoryLinkVisibility(page, "golden", "hidden");
    await expectStoryLinkFocusability(page, "morning", false);
    await expectStoryLinkFocusability(page, "golden", false);
    await expectStoryLinksSkippedByTab(page);

    for (const [phase, progress] of [
      ["noon", 0.38],
      ["sunset", 0.76],
      ["night", 1],
    ] as const) {
      await moveSolarStoryTo(page, progress);
      await expectSolarTextPhase(page, phase);
      await expectStoryLinkVisibility(page, "morning", "hidden");
      await expectStoryLinkVisibility(page, "golden", "hidden");
      await expectStoryLinkFocusability(page, "morning", false);
      await expectStoryLinkFocusability(page, "golden", false);
      await expectStoryLinksSkippedByTab(page);
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
      const servicesLink = semanticStoryLink(page, "panel");
      await expect(servicesLink).toBeVisible();
      await expectStoryLinkVisibility(page, "morning", "hidden");
      await expect(servicesLink).toHaveAttribute("href", "/services");
      await servicesLink.focus();
      await expect(servicesLink).toBeFocused();
      await expectStoryLinkFocusability(page, "morning", false);
      await expectStoryLinkVisibility(page, "golden", "hidden");
      await expectStoryLinkFocusability(page, "golden", false);
      await expectNoCollision(page, '[data-testid="solar-panel-link"]', "#morning-title");

      await moveSolarStoryTo(page, 0.58);
      await expectSolarTextPhase(page, "golden");
      const productsLink = semanticStoryLink(page, "battery");
      await expect(productsLink).toBeVisible();
      await expectStoryLinkVisibility(page, "golden", "hidden");
      await expect(productsLink).toHaveAttribute("href", "/products");
      await productsLink.focus();
      await expect(productsLink).toBeFocused();
      await expectStoryLinkFocusability(page, "golden", false);
      await expectStoryLinkVisibility(page, "morning", "hidden");
      await expectStoryLinkFocusability(page, "morning", false);
      await expectNoCollision(page, '[data-testid="solar-battery-link"]', "#golden-title");

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
    await semanticStoryLink(page, "panel").click();
    await expect(page).toHaveURL(/\/services$/);

    await openSolarHome(page);
    await moveSolarStoryTo(page, 0.58);
    await expectSolarTextPhase(page, "golden");
    await semanticStoryLink(page, "battery").click();
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
    await expect(page.getByRole("button", { name: /night\./i })).toHaveCount(0);
    const houseCta = semanticStoryLink(page, "house");
    await expect(houseCta).toBeVisible();
    await expect(houseCta).toBeFocused();
    await houseCta.click();
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
    await expectStoryLinkVisibility(page, "morning", "hidden");
    await expect(semanticStoryLink(page, "panel")).toBeVisible();
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
    await expectStoryLinkFocusability(page, "morning", false);
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
    await expectStoryLinkVisibility(page, "golden", "hidden");
    await expect(semanticStoryLink(page, "battery")).toBeVisible();
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
      expect(await readSceneVariable(page, "--house-contact")).toBeGreaterThan(0.95);
      expect(await readSceneVariable(page, "--handoff-flow")).toBe(1);
      expect(await readSceneVariable(page, "--panel-presence")).toBe(0);
      expect(await readSceneVariable(page, "--battery-presence")).toBe(0);

      await waitForStableBox(page, "[data-solar-home]");

      const geometry = await page.evaluate(() => {
        const home = document.querySelector<HTMLElement>("[data-solar-home]");
        const heading = document.querySelector<HTMLElement>("#night-title");
        const houseCta = document.querySelector<HTMLElement>('[data-testid="solar-house-link"]');
        if (!home || !heading || !houseCta) return null;
        const homeBox = home.getBoundingClientRect();
        const ctaBox = houseCta.getBoundingClientRect();
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
          ctaOverlapsHeading: overlap(ctaBox, heading.getBoundingClientRect()),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });
      expect(geometry).not.toBeNull();
      // Optical centering: bounding-box center within 12% of viewport center.
      expect(geometry!.homeCenterOffset).toBeLessThan(0.12);
      expect(geometry!.homeFullyOnScreen).toBe(true);
      expect(geometry!.headingOverlapsHome).toBe(false);
      expect(geometry!.ctaOverlapsHeading).toBe(false);
      expect(geometry!.overflow).toBe(false);
    }
  });

  test("settled night shows exactly one house quotation action and no phone link", async ({
    page,
  }) => {
    await openSolarHome(page);
    await moveSolarStoryTo(page, 1);
    await expect(
      page.locator('[aria-label="A solar day"][data-sun-settled="true"]'),
    ).toBeAttached();

    const story = page.locator('[aria-label="A solar day"]');
    // The illuminated house is the single visible quotation action.
    const houseCta = story.getByRole("link", {
      name: /request a quotation from the illuminated house/i,
    });
    await expect(houseCta).toBeVisible();
    await expect(houseCta).toHaveAttribute("href", "/contact");
    await expect(story.getByRole("button", { name: /night\./i })).toHaveCount(0);
    // The in-chapter fallback stays hidden under normal motion.
    await expect(story.locator(".solar-night-action")).toBeHidden();
    // No phone link exists inside the story.
    await expect(story.locator('a[href^="tel:"]')).toHaveCount(0);
    // The hidden fallback never enters the tab order.
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

test.describe("solar story refinement", () => {
  test("decorative progress rail tracks progress without becoming UI", async ({ page }) => {
    await openSolarHome(page);
    const rail = page.getByTestId("solar-progress-rail");
    await expect(rail).toBeVisible();
    await expect(rail).toHaveAttribute("aria-hidden", "true");

    for (const progress of [0.05, 0.38, 0.76, 1]) {
      await moveSolarStoryTo(page, progress);
      const geometry = await rail.evaluate((element) => {
        const railBox = element.getBoundingClientRect();
        const fill = element.querySelector<HTMLElement>("span span");
        const fillBox = fill?.getBoundingClientRect();
        const header = document.querySelector<HTMLElement>(".public-header");
        const sun = document.querySelector<HTMLElement>(
          'button[aria-controls="solar-phase-navigation"]',
        );
        const phaseNav = document.querySelector<HTMLElement>("#solar-phase-navigation");
        const collide = (a: DOMRect, b: DOMRect) =>
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        return {
          pointerEvents: getComputedStyle(element).pointerEvents,
          rightGap: window.innerWidth - railBox.right,
          fillRatio: fillBox ? fillBox.height / railBox.height : 0,
          overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          hitsHeader: header ? collide(railBox, header.getBoundingClientRect()) : true,
          hitsSun:
            sun && getComputedStyle(sun).visibility !== "hidden"
              ? collide(railBox, sun.getBoundingClientRect())
              : false,
          hitsPhaseMenu:
            phaseNav && getComputedStyle(phaseNav).visibility !== "hidden"
              ? collide(railBox, phaseNav.getBoundingClientRect())
              : false,
        };
      });
      expect(geometry.pointerEvents).toBe("none");
      expect(geometry.rightGap).toBeGreaterThanOrEqual(0);
      expect(geometry.rightGap).toBeLessThan(32);
      expect(geometry.fillRatio).toBeGreaterThanOrEqual(Math.max(0, progress - 0.08));
      expect(geometry.fillRatio).toBeLessThanOrEqual(Math.min(1, progress + 0.08));
      expect(geometry.overflows).toBe(false);
      expect(geometry.hitsHeader).toBe(false);
      expect(geometry.hitsSun).toBe(false);
      expect(geometry.hitsPhaseMenu).toBe(false);
    }
  });

  test("header remains fixed, opaque and collision-free during reversal", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await openSolarHome(page);
      let expectedHeight: number | null = null;
      for (const progress of [0, 0.22, 0.58, 0.9, 0.15, 1, 0.3]) {
        await moveSolarStoryTo(page, progress);
        const evidence = await page.evaluate(() => {
          const header = document.querySelector<HTMLElement>(".public-header");
          const rail = document.querySelector<HTMLElement>('[data-testid="solar-progress-rail"]');
          const sun = document.querySelector<HTMLElement>(
            'button[aria-controls="solar-phase-navigation"]',
          );
          const phaseNav = document.querySelector<HTMLElement>("#solar-phase-navigation");
          if (!header || !rail || !sun || !phaseNav) return null;
          const headerBox = header.getBoundingClientRect();
          const collide = (a: DOMRect, b: DOMRect) =>
            a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          const sunVisible = getComputedStyle(sun).visibility !== "hidden";
          return {
            top: headerBox.top,
            height: headerBox.height,
            backgroundAlpha: getComputedStyle(header).backgroundColor,
            hitsSun: sunVisible && collide(headerBox, sun.getBoundingClientRect()),
            hitsPhaseMenu:
              getComputedStyle(phaseNav).visibility !== "hidden" &&
              collide(headerBox, phaseNav.getBoundingClientRect()),
            hitsRail: collide(headerBox, rail.getBoundingClientRect()),
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          };
        });
        expect(evidence).not.toBeNull();
        expectedHeight ??= evidence!.height;
        expect(Math.abs(evidence!.top)).toBeLessThanOrEqual(1);
        expect(Math.abs(evidence!.height - expectedHeight)).toBeLessThanOrEqual(1);
        expect(evidence!.backgroundAlpha).not.toContain("0)");
        expect(evidence!.hitsSun).toBe(false);
        expect(evidence!.hitsPhaseMenu).toBe(false);
        expect(evidence!.hitsRail).toBe(false);
        expect(evidence!.overflow).toBe(false);
      }
    }
  });

  test("semantic artwork links are outside aria-hidden stage and phase-gated", async ({ page }) => {
    await openSolarHome(page);

    const focusableInsideHiddenStage = await page.locator("[aria-hidden='true'] a").count();
    expect(focusableInsideHiddenStage).toBe(0);

    await moveSolarStoryTo(page, 0);
    await expect(semanticStoryLink(page, "panel")).toBeHidden();
    await expect(semanticStoryLink(page, "battery")).toBeHidden();
    await expect(semanticStoryLink(page, "house")).toBeHidden();

    await moveSolarStoryTo(page, 0.2);
    await expect(semanticStoryLink(page, "panel")).toBeVisible();
    await expect(semanticStoryLink(page, "panel")).toHaveAttribute("href", "/services");
    await expect(semanticStoryLink(page, "battery")).toBeHidden();
    await expect(semanticStoryLink(page, "house")).toBeHidden();

    await moveSolarStoryTo(page, 0.58);
    await expect(semanticStoryLink(page, "battery")).toBeVisible();
    await expect(semanticStoryLink(page, "battery")).toHaveAttribute("href", "/products");
    await expect(semanticStoryLink(page, "panel")).toBeHidden();

    await moveSolarStoryTo(page, 1);
    await expect(semanticStoryLink(page, "house")).toBeVisible();
    await expect(semanticStoryLink(page, "house")).toHaveAttribute("href", "/contact");
    await expect(semanticStoryLink(page, "panel")).toBeHidden();
    await expect(semanticStoryLink(page, "battery")).toBeHidden();
  });

  test("battery label and products module share the canonical entry signal", async ({ page }) => {
    await openSolarHome(page);

    await moveSolarStoryTo(page, 0.419);
    await expect
      .poll(async () =>
        page.locator('[aria-label="A solar day"]').evaluate((root) => root.dataset.batteryState),
      )
      .toBe("inactive");
    expect(await readSceneVariable(page, "--battery-entry")).toBe(0);

    await moveSolarStoryTo(page, 0.421);
    await expect
      .poll(async () =>
        page.locator('[aria-label="A solar day"]').evaluate((root) => root.dataset.batteryState),
      )
      .toBe("entering");
    expect(await readSceneVariable(page, "--battery-entry")).toBeGreaterThan(0);

    await moveSolarStoryTo(page, 0.58);
    await expect(semanticStoryLink(page, "battery")).toBeVisible();
    const batteryAnimation = await page
      .locator("[data-solar-battery] span")
      .nth(1)
      .evaluate((element) => getComputedStyle(element).animationName);
    const batteryTransformAnimation = await page
      .locator("[data-solar-battery]")
      .evaluate((element) => getComputedStyle(element).animationName);
    expect(batteryAnimation).not.toBe("none");
    expect(batteryTransformAnimation).toBe("none");
  });

  test("keyboard settlement transfers focus to the implanted house link", async ({ page }) => {
    await openSolarHome(page);
    const sun = page.getByRole("button", { name: /open solar day navigation/i });
    await sun.focus();
    await page.keyboard.press("End");
    const houseCta = semanticStoryLink(page, "house");
    await expect(houseCta).toBeVisible();
    await expect(houseCta).toBeFocused();
    await expect(houseCta).toHaveCSS("outline-style", /solid|auto/);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("scroll settlement does not steal focus and reverse removes hidden focus stops", async ({
    page,
  }) => {
    await openSolarHome(page);
    await page.getByRole("link", { name: /greennet energy home/i }).focus();
    await moveSolarStoryTo(page, 1);
    await expect(semanticStoryLink(page, "house")).toBeVisible();
    await expect(semanticStoryLink(page, "house")).not.toBeFocused();

    await semanticStoryLink(page, "house").focus();
    await expect(semanticStoryLink(page, "house")).toBeFocused();
    await moveSolarStoryTo(page, 0.58);
    await expect(semanticStoryLink(page, "house")).toBeHidden();
    await expect(semanticStoryLink(page, "house")).not.toBeFocused();
    const hiddenActive = await page.evaluate(() =>
      Boolean(document.activeElement?.closest("[aria-hidden='true']")),
    );
    expect(hiddenActive).toBe(false);
  });

  test("current transformation, house contact and settled assets are deterministic", async ({
    page,
  }) => {
    await openSolarHome(page);

    for (const [progress, state] of [
      [0.05, "off"],
      [0.2, "forming"],
      [0.38, "active"],
      [0.58, "arriving"],
      [0.76, "complete"],
    ] as const) {
      await moveSolarStoryTo(page, progress);
      await expect
        .poll(async () =>
          page.locator('[aria-label="A solar day"]').evaluate((root) => root.dataset.currentState),
        )
        .toBe(state);
    }

    await moveSolarStoryTo(page, 0.9);
    expect(await readSceneVariable(page, "--house-contact")).toBeLessThan(0.95);
    expect(await readSceneVariable(page, "--home-light")).toBe(0);

    await moveSolarStoryTo(page, 1);
    expect(await readSceneVariable(page, "--house-contact")).toBeGreaterThan(0.95);
    expect(await readSceneVariable(page, "--home-light")).toBeGreaterThan(0.95);
    expect(await readSceneVariable(page, "--panel-presence")).toBe(0);
    expect(await readSceneVariable(page, "--battery-presence")).toBe(0);
  });

  test("sun coordinates have no scroll-driven transition lag", async ({ page }) => {
    await openSolarHome(page);

    for (const progress of [0.12, 0.48, 0.9, 0.2, 1]) {
      await moveSolarStoryTo(page, progress);
      const delta = await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
        const sun = document.querySelector<HTMLElement>(
          'button[aria-controls="solar-phase-navigation"]',
        );
        if (!root || !sun) return { x: 0, y: 0 };
        const rootStyles = getComputedStyle(root);
        const sunStyles = getComputedStyle(sun);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        return {
          x: Math.abs(
            (Number.parseFloat(rootStyles.getPropertyValue("--sun-x")) / 100) * viewportWidth -
              Number.parseFloat(sunStyles.left),
          ),
          y: Math.abs(
            (Number.parseFloat(rootStyles.getPropertyValue("--sun-y")) / 100) * viewportHeight -
              Number.parseFloat(sunStyles.top),
          ),
        };
      });
      expect(delta.x).toBeLessThan(0.2);
      expect(delta.y).toBeLessThan(0.2);
    }
  });

  test("survives 50 rapid direction changes with state agreement after every reversal", async ({
    page,
  }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await openSolarHome(page);
      const pairs = [
        [0.04, 0.19],
        [0.19, 0.38],
        [0.38, 0.57],
        [0.57, 0.76],
        [0.76, 0.98],
        [0.98, 0.57],
        [0.98, 0.04],
      ] as const;
      for (let index = 0; index < 56; index += 1) {
        const pair = pairs[index % pairs.length];
        const progress = index % 2 === 0 ? pair[0] : pair[1];
        await moveSolarStoryTo(page, progress);
        await expectSnapshotMatchesProgress(page, progress);
      }
    }
  });
});
