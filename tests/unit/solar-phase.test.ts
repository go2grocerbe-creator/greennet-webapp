import { describe, expect, it } from "vitest";

import {
  clampProgress,
  getActiveSolarPhase,
  getBatteryFocus,
  getConversionFlow,
  getHandoffFlow,
  getHomeFocus,
  getHouseContact,
  getPanelFocus,
  getSolarChapterOpacity,
  getSolarEnvironmentPhase,
  getSolarStoryState,
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
      [0.08, "predawn", "morning"],
      [0.25, "morning", "noon"],
      [0.43, "noon", "golden"],
      [0.62, "golden", "sunset"],
      [0.82, "sunset", "night"],
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

  it("keeps every derived transition midpoint readable", () => {
    for (const midpoint of solarTransitionMidpoints) {
      expect(getSolarTextPhase(midpoint)).not.toBeNull();
      expect(getSolarTextPhaseAttribute(midpoint)).not.toBe("transition");
    }
  });

  it("keeps transition midpoints inside a controlled crossfade", () => {
    solarTransitionMidpoints.forEach((midpoint, index) => {
      expect(midpoint).toBeGreaterThan(solarChapterWindows[index].holdEnd);
      expect(midpoint).toBeLessThan(solarChapterWindows[index + 1].holdStart);
    });
  });

  it("never has more than two readable chapters during crossfade", () => {
    for (let step = 0; step <= 1000; step += 1) {
      const progress = step / 1000;
      const readable = solarChapterWindows.filter(
        (window) => getSolarChapterOpacity(progress, window) > READABLE_OPACITY_THRESHOLD,
      );
      expect(readable.length).toBeGreaterThanOrEqual(1);
      expect(readable.length).toBeLessThanOrEqual(2);
    }
  });

  it("is the same calculation the active navigation step uses", () => {
    for (let step = 0; step <= 200; step += 1) {
      expect(getActiveSolarPhase(step / 200)).toBe(getSolarTextPhase(step / 200));
    }
  });
});

describe("solar phase tables", () => {
  it("keeps chapter windows ordered with small intentional crossfades", () => {
    solarChapterWindows.forEach((window, index) => {
      expect(window.start).toBeLessThanOrEqual(window.holdStart);
      expect(window.holdStart).toBeLessThanOrEqual(window.holdEnd);
      expect(window.holdEnd).toBeLessThanOrEqual(window.end);
      if (index > 0) {
        expect(window.start).toBeLessThan(solarChapterWindows[index - 1].end);
        expect(window.holdStart).toBeGreaterThan(solarChapterWindows[index - 1].holdEnd);
      }
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

  it("conversion flow: begins in Morning, peaks at Noon, only a trace remains at Night", () => {
    expect(getConversionFlow(anchor("predawn"))).toBe(0);
    expect(getConversionFlow(anchor("morning"))).toBeGreaterThan(0);
    expect(getConversionFlow(anchor("morning"))).toBeLessThan(1);
    expect(getConversionFlow(anchor("noon"))).toBe(1);
    expect(getConversionFlow(anchor("night"))).toBeLessThan(0.35);
  });

  it("battery focus: absent through Noon, dominant at Golden, gone at settled Night", () => {
    expect(getBatteryFocus(anchor("morning"))).toBe(0);
    expect(getBatteryFocus(anchor("noon"))).toBe(0);
    expect(getBatteryFocus(anchor("golden"))).toBe(1);
    expect(getSolarStoryState(anchor("night")).batteryPresence).toBe(0);
  });

  it("handoff flow: draws across Sunset and completes for Night", () => {
    expect(getHandoffFlow(anchor("golden"))).toBe(0);
    const sunset = getHandoffFlow(anchor("sunset"));
    expect(sunset).toBeGreaterThan(0);
    expect(sunset).toBeLessThan(1);
    expect(getHandoffFlow(0.88)).toBeGreaterThan(0.9);
  });

  it("home focus: begins during Sunset and resolves before the sun settles", () => {
    expect(getHomeFocus(anchor("golden"))).toBe(0);
    const sunset = getHomeFocus(anchor("sunset"));
    expect(sunset).toBeGreaterThan(0);
    expect(sunset).toBeLessThan(1);
    expect(getHomeFocus(0.9)).toBe(1);
    expect(getHomeFocus(anchor("night"))).toBe(1);
  });

  it("every emphasis variable stays inside 0..1 for any input", () => {
    const fns = [
      getPanelFocus,
      getConversionFlow,
      getBatteryFocus,
      getHandoffFlow,
      getHomeFocus,
      getHouseContact,
    ];
    for (let step = -20; step <= 120; step += 1) {
      for (const fn of fns) {
        const value = fn(step / 100);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it("samples the full story state without voids, conflicts, or invalid values", () => {
    let longestCopyVoid = 0;
    let currentVoid = 0;
    let longestStaticRun = 0;
    let currentStaticRun = 0;
    let previousSignature = "";

    for (let step = 0; step <= 200; step += 1) {
      const state = getSolarStoryState(step / 200);
      const numericValues = [
        state.progress,
        state.panelFocus,
        state.panelPresence,
        state.conversionFlow,
        state.batteryEntry,
        state.batteryFocus,
        state.batteryPresence,
        state.handoffFlow,
        state.homeFocus,
        state.houseContact,
        state.homeLight,
        state.houseCta,
      ];
      for (const value of numericValues) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }

      if (state.textPhase === null) currentVoid += 1;
      else currentVoid = 0;
      longestCopyVoid = Math.max(longestCopyVoid, currentVoid);

      const signature = [
        state.environmentPhase,
        state.textPhase,
        state.currentState,
        state.panelPresence.toFixed(2),
        state.conversionFlow.toFixed(2),
        state.batteryPresence.toFixed(2),
        state.handoffFlow.toFixed(2),
        state.houseContact.toFixed(2),
      ].join("|");
      if (signature === previousSignature) currentStaticRun += 1;
      else currentStaticRun = 0;
      previousSignature = signature;
      longestStaticRun = Math.max(longestStaticRun, currentStaticRun);
    }

    expect(longestCopyVoid).toBe(0);
    expect(longestStaticRun).toBeLessThan(20);
    expect(getSolarStoryState(0.94).homeLight).toBe(0);
    expect(getSolarStoryState(0.96).homeLight).toBe(0);
    expect(getSolarStoryState(1).homeLight).toBe(1);
    expect(getSolarStoryState(1).panelPresence).toBe(0);
    expect(getSolarStoryState(1).batteryPresence).toBe(0);
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
