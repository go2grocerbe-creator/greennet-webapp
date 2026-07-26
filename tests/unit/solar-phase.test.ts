import { describe, expect, it } from "vitest";

import {
  clampProgress,
  getActiveSolarPhase,
  getBatteryPresence,
  getBatteryFocus,
  getConversionFlow,
  getFinalCtaActivation,
  getHandoffFlow,
  getHomeLight,
  getHomeFocus,
  getHouseContact,
  getPanelPresence,
  getPanelFocus,
  getSolarChapterOpacity,
  getSolarCurrentState,
  getSolarEnvironmentPhase,
  getSolarTextPhase,
  getSolarTextPhaseAttribute,
  getStoryDistance,
  READABLE_OPACITY_THRESHOLD,
  solarChapterWindows,
  solarPhaseAnchors,
  solarPhases,
  solarTransitionMidpoints,
} from "@/lib/solar/solar-phase";

const anchor = (id: string) => solarPhaseAnchors.find((entry) => entry.id === id)!.progress;

describe("clampProgress", () => {
  it("clamps below 0 and above 1 and absorbs NaN", () => {
    expect(clampProgress(-3)).toBe(0);
    expect(clampProgress(1.5)).toBe(1);
    expect(clampProgress(0.42)).toBe(0.42);
    expect(clampProgress(Number.NaN)).toBe(0);
  });
});

describe("getSolarEnvironmentPhase", () => {
  it("names every phase at its anchor", () => {
    for (const { id, progress } of solarPhaseAnchors) {
      expect(getSolarEnvironmentPhase(progress)).toBe(id);
    }
  });

  it("switches exactly at each threshold", () => {
    const boundaries = [
      [0.1, "predawn", "morning"],
      [0.3, "morning", "noon"],
      [0.5, "noon", "golden"],
      [0.7, "golden", "sunset"],
      [0.88, "sunset", "night"],
    ] as const;
    for (const [edge, before, after] of boundaries) {
      expect(getSolarEnvironmentPhase(edge - 1e-6)).toBe(before);
      expect(getSolarEnvironmentPhase(edge)).toBe(after);
      expect(getSolarEnvironmentPhase(edge + 1e-6)).toBe(after);
    }
  });
});

describe("getSolarTextPhase", () => {
  it("returns the anchored chapter at every phase anchor", () => {
    for (const { id, progress } of solarPhaseAnchors) {
      expect(getSolarTextPhase(progress)).toBe(id);
    }
  });

  it("returns null at every derived transition midpoint", () => {
    for (const midpoint of solarTransitionMidpoints) {
      expect(getSolarTextPhase(midpoint)).toBeNull();
      expect(getSolarTextPhaseAttribute(midpoint)).toBe("transition");
    }
  });

  it("keeps transition midpoints clear of both neighbouring windows", () => {
    solarTransitionMidpoints.forEach((midpoint, index) => {
      expect(midpoint - solarChapterWindows[index].end).toBeGreaterThan(0.02);
      expect(solarChapterWindows[index + 1].start - midpoint).toBeGreaterThan(0.02);
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

  it("is the same calculation the active navigation step uses", () => {
    for (let step = 0; step <= 200; step += 1) {
      expect(getActiveSolarPhase(step / 200)).toBe(getSolarTextPhase(step / 200));
    }
  });
});

describe("solar phase tables", () => {
  it("keeps chapter windows ordered and non-overlapping", () => {
    solarChapterWindows.forEach((window, index) => {
      expect(window.start).toBeLessThanOrEqual(window.holdStart);
      expect(window.holdStart).toBeLessThanOrEqual(window.holdEnd);
      expect(window.holdEnd).toBeLessThanOrEqual(window.end);
      if (index > 0) expect(window.start).toBeGreaterThan(solarChapterWindows[index - 1].end);
    });
    expect(solarPhaseAnchors.map((entry) => entry.id)).toEqual(solarPhases.map((p) => p.id));
  });
});

describe("storytelling emphasis variables", () => {
  it("panel focus: silent before dawn, dominant through Morning and Noon, receded by Golden, gone at Night", () => {
    expect(getPanelFocus(anchor("predawn"))).toBe(0);
    expect(getPanelFocus(anchor("morning"))).toBe(1);
    expect(getPanelFocus(anchor("noon"))).toBe(1);
    expect(getPanelFocus(anchor("golden"))).toBeLessThan(getPanelFocus(anchor("noon")));
    expect(getPanelFocus(anchor("sunset"))).toBeLessThan(getPanelFocus(anchor("noon")));
    expect(getPanelFocus(anchor("night"))).toBe(0);
  });

  it("panel presence: the physical panels leave the settled night frame", () => {
    expect(getPanelPresence(anchor("morning"))).toBe(1);
    expect(getPanelPresence(anchor("noon"))).toBe(1);
    expect(getPanelPresence(anchor("sunset"))).toBeGreaterThan(0);
    expect(getPanelPresence(anchor("night"))).toBe(0);
  });

  it("conversion flow: begins in Morning, peaks at Noon, only a trace remains at Night", () => {
    expect(getConversionFlow(anchor("predawn"))).toBe(0);
    expect(getConversionFlow(anchor("morning"))).toBeGreaterThan(0);
    expect(getConversionFlow(anchor("morning"))).toBeLessThan(1);
    expect(getConversionFlow(anchor("noon"))).toBe(1);
    expect(getConversionFlow(anchor("night"))).toBeLessThan(0.35);
  });

  it("battery focus: absent through Noon, dominant at Golden, gone by settled Night", () => {
    expect(getBatteryFocus(anchor("morning"))).toBe(0);
    expect(getBatteryFocus(anchor("noon"))).toBe(0);
    expect(getBatteryFocus(anchor("golden"))).toBe(1);
    expect(getBatteryFocus(anchor("night"))).toBe(0);
  });

  it("battery presence: enters for storage and fades after the handoff", () => {
    expect(getBatteryPresence(anchor("noon"))).toBe(0);
    expect(getBatteryPresence(anchor("golden"))).toBe(1);
    expect(getBatteryPresence(anchor("sunset"))).toBe(1);
    expect(getBatteryPresence(anchor("night"))).toBe(0);
  });

  it("handoff flow: draws across Sunset and completes for Night", () => {
    expect(getHandoffFlow(anchor("golden"))).toBe(0);
    const sunset = getHandoffFlow(anchor("sunset"));
    expect(sunset).toBeGreaterThan(0);
    expect(sunset).toBeLessThan(1);
    expect(getHandoffFlow(anchor("night"))).toBe(1);
  });

  it("home focus: begins during Sunset and resolves before the sun settles", () => {
    expect(getHomeFocus(anchor("golden"))).toBe(0);
    const sunset = getHomeFocus(anchor("sunset"));
    expect(sunset).toBeGreaterThan(0);
    expect(sunset).toBeLessThan(1);
    expect(getHomeFocus(0.92)).toBe(1);
    expect(getHomeFocus(anchor("night"))).toBe(1);
  });

  it("house contact gates home light and final CTA activation", () => {
    expect(getHouseContact(0.86)).toBe(0);
    expect(getHomeLight(0.9)).toBe(0);
    expect(getFinalCtaActivation(0.9)).toBe(0);
    expect(getHouseContact(0.97)).toBe(1);
    expect(getHomeLight(0.97)).toBe(1);
    expect(getFinalCtaActivation(0.97)).toBe(1);
  });

  it("names the current transformation reversibly", () => {
    expect(getSolarCurrentState(0.05)).toBe("off");
    expect(getSolarCurrentState(0.2)).toBe("forming");
    expect(getSolarCurrentState(anchor("noon"))).toBe("active");
    expect(getSolarCurrentState(anchor("golden"))).toBe("arriving");
    expect(getSolarCurrentState(anchor("sunset"))).toBe("complete");
  });

  it("every emphasis variable stays inside 0..1 for any input", () => {
    const fns = [
      getPanelFocus,
      getPanelPresence,
      getConversionFlow,
      getBatteryFocus,
      getBatteryPresence,
      getHandoffFlow,
      getHomeFocus,
      getHouseContact,
      getHomeLight,
      getFinalCtaActivation,
    ];
    for (let step = -20; step <= 120; step += 1) {
      for (const fn of fns) {
        const value = fn(step / 100);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("getStoryDistance", () => {
  it("excludes the settled-night hold from the progress mapping", () => {
    // 6.4 viewports tall, 900px viewport: 5760 − 900 − 810 = 4050.
    expect(getStoryDistance(5760, 900)).toBe(4050);
  });

  it("honours a custom hold ratio and never returns less than 1", () => {
    expect(getStoryDistance(2000, 900, 0)).toBe(1100);
    expect(getStoryDistance(500, 900)).toBe(1);
  });
});
