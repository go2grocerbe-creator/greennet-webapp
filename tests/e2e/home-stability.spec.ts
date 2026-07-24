import { expect, test } from "@playwright/test";

const viewports = [
  { name: "phone-320", width: 320, height: 844 },
  { name: "phone-360", width: 360, height: 800 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "phone-landscape", width: 844, height: 390 },
  { name: "desktop-1280", width: 1280, height: 720 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
] as const;

const samples = [0, 0.08, 0.19, 0.29, 0.38, 0.48, 0.57, 0.67, 0.76, 0.87, 1];

for (const viewport of viewports) {
  test(`${viewport.name} keeps the solar world inside its safe regions`, async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator('[aria-label="A solar day"][data-enhanced="true"]')).toBeAttached();
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
    });

    for (const progress of samples) {
      await page.evaluate((targetProgress) => {
        const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
        if (!root) return;
        const top = window.scrollY + root.getBoundingClientRect().top;
        window.scrollTo({
          top: top + targetProgress * (root.offsetHeight - window.innerHeight),
          behavior: "auto",
        });
      }, progress);
      await page.waitForTimeout(progress === 1 ? 800 : 80);

      const geometry = await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>('[aria-label="A solar day"]');
        if (!root) return null;
        const rect = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) return null;
          const box = element.getBoundingClientRect();
          return {
            top: box.top,
            right: box.right,
            bottom: box.bottom,
            left: box.left,
            width: box.width,
            height: box.height,
            opacity: Number.parseFloat(getComputedStyle(element).opacity),
          };
        };
        const rootStyles = getComputedStyle(root);
        const normalizedVariables = [
          "--solar-progress",
          "--solar-altitude",
          "--dawn-warmth",
          "--dusk-warmth",
          "--panel-light",
          "--battery-presence",
          "--battery-visibility",
          "--battery-hero",
          "--battery-handoff",
          "--charge-low",
          "--charge-mid",
          "--charge-high",
          "--stored-glow",
          "--home-light",
          "--door-light",
          "--home-pulse",
          "--pre-dawn",
          "--daylight",
          "--golden-hour",
          "--night",
          "--sun-morph",
          "--sun-dissolve",
          "--cta-reveal",
        ].map((name) => Number.parseFloat(rootStyles.getPropertyValue(name)));

        return {
          textPhase: root.dataset.textPhase,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          viewportHeight: window.innerHeight,
          header: rect(".public-header"),
          sun: rect("button[aria-controls='solar-phase-navigation']"),
          panel: rect("[data-solar-stage] [class*='panelField']"),
          battery: rect("[data-solar-stage] [class*='battery']"),
          home: rect("[data-solar-home]"),
          phaseNavigation: rect("#solar-phase-navigation"),
          visibleCopy: [...document.querySelectorAll<HTMLElement>(".solar-chapter__copy")]
            .map((element) => {
              const box = element.getBoundingClientRect();
              return {
                top: box.top,
                right: box.right,
                bottom: box.bottom,
                left: box.left,
                opacity: Number.parseFloat(getComputedStyle(element.parentElement!).opacity),
              };
            })
            .find((copy) => copy.opacity > 0.05),
          normalizedVariables,
        };
      });

      expect(geometry).not.toBeNull();
      if (!geometry) continue;

      expect(geometry.documentWidth, `horizontal overflow at ${progress}`).toBeLessThanOrEqual(
        geometry.viewportWidth,
      );
      expect(
        geometry.normalizedVariables.every((value) => value >= 0 && value <= 1),
        `unclamped timeline variable at ${progress}`,
      ).toBe(true);

      const withinViewport = (
        box: { top: number; right: number; bottom: number; left: number } | null,
        tolerance = 2,
      ) =>
        !box ||
        (box.left >= -tolerance &&
          box.right <= geometry.viewportWidth + tolerance &&
          box.top >= -tolerance &&
          box.bottom <= geometry.viewportHeight + tolerance);

      expect(withinViewport(geometry.sun), `sun escaped at ${progress}`).toBe(true);
      expect(
        withinViewport(geometry.panel, 16),
        `panel escaped at ${progress}: ${JSON.stringify(geometry.panel)}`,
      ).toBe(true);
      if ((geometry.battery?.opacity ?? 0) > 0.05) {
        expect(withinViewport(geometry.battery, 4), `battery escaped at ${progress}`).toBe(true);
      }
      if ((geometry.home?.opacity ?? 0) > 0.05) {
        expect(
          withinViewport(geometry.home, 4),
          `home escaped at ${progress}: ${JSON.stringify(geometry.home)}`,
        ).toBe(true);
      }

      if (geometry.header && geometry.sun) {
        expect(geometry.sun.top, `sun crossed the header at ${progress}`).toBeGreaterThanOrEqual(
          geometry.header.bottom - 2,
        );
      }

      const overlaps = (
        first: { top: number; right: number; bottom: number; left: number } | null | undefined,
        second: { top: number; right: number; bottom: number; left: number } | null | undefined,
      ) =>
        Boolean(
          first &&
          second &&
          first.left < second.right &&
          first.right > second.left &&
          first.top < second.bottom &&
          first.bottom > second.top,
        );

      if (geometry.visibleCopy) {
        expect(
          geometry.phaseNavigation &&
            geometry.phaseNavigation.opacity > 0.05 &&
            overlaps(geometry.visibleCopy, geometry.phaseNavigation),
          `copy overlapped phase navigation at ${progress}`,
        ).toBe(false);
        expect(
          (geometry.sun?.opacity ?? 0) > 0.05 && overlaps(geometry.visibleCopy, geometry.sun),
          `${geometry.textPhase} copy ${JSON.stringify(geometry.visibleCopy)} overlapped the sun or final CTA ${JSON.stringify(geometry.sun)} at ${progress}`,
        ).toBe(false);
        if ((geometry.battery?.opacity ?? 0) > 0.05) {
          expect(
            overlaps(geometry.visibleCopy, geometry.battery),
            `copy overlapped the battery at ${progress}`,
          ).toBe(false);
        }
        expect(
          overlaps(geometry.visibleCopy, geometry.panel),
          `copy ${JSON.stringify(geometry.visibleCopy)} overlapped the panel ${JSON.stringify(geometry.panel)} at ${progress}`,
        ).toBe(false);
      }
    }

    expect(browserErrors, "browser errors during the sampled timeline").toEqual([]);
  });
}

test("portrait mobile sun completes its arc without reversing toward the house", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const experience = page.locator('[aria-label="A solar day"]');
  const positions: Array<{ progress: number; x: number; y: number }> = [];

  for (const progress of [
    0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.86, 0.9, 0.94,
  ]) {
    await experience.evaluate((root, targetProgress) => {
      const element = root as HTMLElement;
      const top = window.scrollY + element.getBoundingClientRect().top;
      window.scrollTo({
        top: top + targetProgress * (element.offsetHeight - window.innerHeight),
        behavior: "auto",
      });
    }, progress);
    await page.waitForTimeout(120);

    const position = await page
      .getByRole("button", { name: /open solar day navigation/i })
      .evaluate((sun) => {
        const box = sun.getBoundingClientRect();
        return {
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        };
      });
    positions.push({ progress, ...position });
  }

  for (let index = 1; index < positions.length; index += 1) {
    expect(
      positions[index].x,
      `sun reversed horizontally between ${positions[index - 1].progress} and ${positions[index].progress}`,
    ).toBeGreaterThanOrEqual(positions[index - 1].x - 1);
  }

  const apexIndex = positions.reduce(
    (minimumIndex, position, index) =>
      position.y < positions[minimumIndex].y ? index : minimumIndex,
    0,
  );
  expect(positions[apexIndex].progress).toBeGreaterThanOrEqual(0.3);
  expect(positions[apexIndex].progress).toBeLessThanOrEqual(0.6);

  for (let index = apexIndex + 1; index < positions.length; index += 1) {
    expect(
      positions[index].y,
      `sun rose again after its apex between ${positions[index - 1].progress} and ${positions[index].progress}`,
    ).toBeGreaterThanOrEqual(positions[index - 1].y - 1);
  }

  const largestVerticalStep = Math.max(
    ...positions.slice(1).map((position, index) => Math.abs(position.y - positions[index].y)),
  );
  expect(
    largestVerticalStep,
    "sun moved too abruptly between sampled mobile positions",
  ).toBeLessThan(260);
  expect(positions[positions.length - 1].x).toBeCloseTo(195, 0);
});

test("rapid scrolling, reversal, and sun dragging remain stable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const experience = page.locator('[aria-label="A solar day"]');
  const sun = page.getByRole("button", { name: /open solar day navigation/i });

  for (const progress of [1, 0, 0.76, 0.19, 0.57, 0.08]) {
    await experience.evaluate((root, targetProgress) => {
      const top = window.scrollY + root.getBoundingClientRect().top;
      window.scrollTo({
        top: top + targetProgress * (root.scrollHeight - window.innerHeight),
        behavior: "auto",
      });
    }, progress);
  }

  const sunBox = await sun.boundingBox();
  expect(sunBox).not.toBeNull();
  if (sunBox) {
    await page.mouse.move(sunBox.x + sunBox.width / 2, sunBox.y + sunBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(1100, sunBox.y + sunBox.height / 2, { steps: 8 });
    await page.mouse.move(360, sunBox.y + sunBox.height / 2, { steps: 8 });
    await page.mouse.up();
  }

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const handle = document.querySelector<HTMLElement>(
            "button[aria-controls='solar-phase-navigation']",
          );
          const box = handle?.getBoundingClientRect();
          return {
            noHorizontalOverflow:
              document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            sunInside:
              Boolean(box) &&
              box!.left >= 0 &&
              box!.right <= window.innerWidth &&
              box!.top >= 0 &&
              box!.bottom <= window.innerHeight,
          };
        }),
      { timeout: 1_500 },
    )
    .toEqual({ noHorizontalOverflow: true, sunInside: true });
});

test("the mobile menu remains usable at several timeline phases", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const experience = page.locator('[aria-label="A solar day"]');
  const menu = page.getByText("Menu", { exact: true });

  for (const progress of [0.19, 0.67, 1]) {
    await experience.evaluate((root, targetProgress) => {
      const top = window.scrollY + root.getBoundingClientRect().top;
      window.scrollTo({
        top: top + targetProgress * (root.scrollHeight - window.innerHeight),
        behavior: "auto",
      });
    }, progress);
    await menu.click();
    await expect(page.getByRole("navigation", { name: /mobile navigation/i })).toBeVisible();
    await menu.click();
  }
});

test.describe("no JavaScript fallback", () => {
  test.use({ javaScriptEnabled: false });

  test("keeps the complete story readable and navigable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Solar day phases" })).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Harness the power of the sun.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Sunlight becomes power.", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Power becomes possibility.", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Energy becomes reserve." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The day transitions." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The sun is still working." })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
