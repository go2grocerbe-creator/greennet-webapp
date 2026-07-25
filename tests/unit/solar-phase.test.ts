import { describe, expect, it } from "vitest";

import {
  clampProgress,
  getActiveSolarPhase,
  getSolarChapterOpacity,
  getSolarEnvironmentPhase,
  getSolarTextPhase,
  getSolarTextPhaseAttribute,
  READABLE_OPACITY_THRESHOLD,
  solarChapterWindows,
  solarPhaseAnchors,
  solarPhases,
  solarTransitionMidpoints,
} from "@/lib/solar/solar-phase";

describe("clampProgress", () => {
  it("clamps below 0 and above 1", () => {
    expect(clampProgress(-3)).toBe(0);
    expect(clampProgress(-0.0001)).toBe(0);
    expect(clampProgress(1.5)).toBe(1);
    expect(clampProgress(0.42)).toBe(0.42);
  });

  it("treats NaN as the start of the day rather than propagating it", () => {
    expect(clampProgress(Number.NaN)).toBe(0);
  });
});

describe("getSolarEnvironmentPhase", () => {
  it("names every phase at its anchor", () => {
    expect(getSolarEnvironmentPhase(0)).toBe("predawn");
    expect(getSolarEnvironmentPhase(0.19)).toBe("morning");
    expect(getSolarEnvironmentPhase(0.38)).toBe("noon");
    expect(getSolarEnvironmentPhase(0.57)).toBe("golden");
    expect(getSolarEnvironmentPhase(0.76)).toBe("sunset");
    expect(getSolarEnvironmentPhase(1)).toBe("night");
  });

  it("switches exactly at each threshold, never between", () => {
    const boundaries = [
      [0.1, "predawn", "morning"],
      [0.3, "morning", "noon"],
      [0.5, "noon", "golden"],
      [0.7, "golden", "sunset"],
      [0.88, "sunset", "night"],
    ] as const;

    for (const [edge, before, after] of boundaries) {
      expect(getSolarEnvironmentPhase(edge - 1e-6)).toBe(before);
      // The threshold itself belongs to the later phase (`<` comparison).
      expect(getSolarEnvironmentPhase(edge)).toBe(after);
      expect(getSolarEnvironmentPhase(edge + 1e-6)).toBe(after);
    }
  });

  it("clamps out-of-range progress instead of returning undefined", () => {
    expect(getSolarEnvironmentPhase(-1)).toBe("predawn");
    expect(getSolarEnvironmentPhase(2)).toBe("night");
  });
});

describe("getSolarChapterOpacity", () => {
  const morning = solarChapterWindows.find((window) => window.id === "morning")!;

  it("is 0 outside the window and 1 across the hold", () => {
    expect(getSolarChapterOpacity(morning.start - 0.01, morning)).toBe(0);
    expect(getSolarChapterOpacity(morning.holdStart, morning)).toBe(1);
    expect(getSolarChapterOpacity(morning.holdEnd, morning)).toBe(1);
    expect(getSolarChapterOpacity(morning.end + 0.01, morning)).toBe(0);
  });

  it("ramps monotonically in and out", () => {
    const rampIn = getSolarChapterOpacity((morning.start + morning.holdStart) / 2, morning);
    const rampOut = getSolarChapterOpacity((morning.holdEnd + morning.end) / 2, morning);
    expect(rampIn).toBeGreaterThan(0);
    expect(rampIn).toBeLessThan(1);
    expect(rampOut).toBeGreaterThan(0);
    expect(rampOut).toBeLessThan(1);
  });

  it("never returns a value outside 0..1 for any progress", () => {
    for (let step = -5; step <= 105; step += 1) {
      for (const window of solarChapterWindows) {
        const opacity = getSolarChapterOpacity(step / 100, window);
        expect(opacity).toBeGreaterThanOrEqual(0);
        expect(opacity).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("getSolarTextPhase", () => {
  it("returns exactly the anchored chapter at every phase anchor", () => {
    for (const anchor of solarPhaseAnchors) {
      expect(getSolarTextPhase(anchor.progress)).toBe(anchor.id);
    }
  });

  it("returns null at every transition midpoint", () => {
    for (const midpoint of solarTransitionMidpoints) {
      expect(getSolarTextPhase(midpoint)).toBeNull();
      expect(getSolarTextPhaseAttribute(midpoint)).toBe("transition");
    }
  });

  it("keeps transition midpoints clear of both neighbouring windows", () => {
    solarTransitionMidpoints.forEach((midpoint, index) => {
      const before = solarChapterWindows[index];
      const after = solarChapterWindows[index + 1];
      // A midpoint sitting exactly on a window edge would make the assertion
      // depend on floating-point luck; each must have real clearance.
      expect(midpoint - before.end).toBeGreaterThan(0.02);
      expect(after.start - midpoint).toBeGreaterThan(0.02);
    });
  });

  it("never reports two readable chapters at once", () => {
    for (let step = 0; step <= 1000; step += 1) {
      const progress = step / 1000;
      const readable = solarChapterWindows.filter(
        (window) => getSolarChapterOpacity(progress, window) > READABLE_OPACITY_THRESHOLD,
      );
      expect(readable.length).toBeLessThanOrEqual(1);
    }
  });

  it("agrees with the readable-opacity definition on both sides of each edge", () => {
    for (const window of solarChapterWindows) {
      for (const edge of [window.start, window.holdStart, window.holdEnd, window.end]) {
        for (const progress of [edge - 1e-6, edge, edge + 1e-6]) {
          const readable =
            getSolarChapterOpacity(progress, window) > READABLE_OPACITY_THRESHOLD
              ? window.id
              : null;
          if (readable) expect(getSolarTextPhase(progress)).toBe(window.id);
        }
      }
    }
  });

  it("clamps rather than throwing outside 0..1", () => {
    expect(getSolarTextPhase(-2)).toBe("predawn");
    expect(getSolarTextPhase(4)).toBe("night");
  });
});

describe("getActiveSolarPhase", () => {
  it("is the same canonical calculation the text phase uses", () => {
    // Navigation highlight and chapter copy must never disagree — the flake
    // this module was extracted to remove.
    for (let step = 0; step <= 200; step += 1) {
      const progress = step / 200;
      expect(getActiveSolarPhase(progress)).toBe(getSolarTextPhase(progress));
    }
  });
});

describe("solar phase tables", () => {
  it("exposes one anchor per named phase, in order", () => {
    expect(solarPhaseAnchors.map((anchor) => anchor.id)).toEqual(
      solarPhases.map((phase) => phase.id),
    );
  });

  it("derives one transition midpoint per gap between chapters", () => {
    expect(solarTransitionMidpoints).toHaveLength(solarChapterWindows.length - 1);
  });

  it("keeps chapter windows ordered and non-overlapping", () => {
    solarChapterWindows.forEach((window, index) => {
      expect(window.start).toBeLessThanOrEqual(window.holdStart);
      expect(window.holdStart).toBeLessThanOrEqual(window.holdEnd);
      expect(window.holdEnd).toBeLessThanOrEqual(window.end);
      if (index > 0) {
        expect(window.start).toBeGreaterThan(solarChapterWindows[index - 1].end);
      }
    });
  });
});
