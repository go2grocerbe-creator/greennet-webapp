import { describe, expect, it } from "vitest";

import {
  BATTERY_ENTRY_COMPLETE,
  BATTERY_ENTRY_START,
  BATTERY_EXIT_COMPLETE,
  BATTERY_EXIT_START,
  clampProgress,
  getActiveSolarPhase,
  getBatteryEntry,
  getBatteryFocus,
  getBatteryPresence,
  getConversionFlow,
  getFinalCtaActivation,
  getHandoffFlow,
  getHomeFocus,
  getHomeLight,
  getHouseContact,
  getPanelFocus,
  getPanelPresence,
  getSolarAltitude,
  getSolarBatteryState,
  getSolarChapterOpacity,
  getSolarCurrentState,
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
  it("names every phase at its release anchor", () => {
    for (const { id, progress } of solarPhaseAnchors) {
      expect(getSolarEnvironmentPhase(progress)).toBe(id);
    }
  });

  it("switches deterministically at each release threshold", () => {
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

  it("keeps every derived handoff midpoint readable", () => {
    for (const midpoint of solarTransitionMidpoints) {
      expect(getSolarTextPhase(midpoint)).not.toBeNull();
      expect(getSolarTextPhaseAttribute(midpoint)).not.toBe("transition");
    }
  });

  it("keeps handoff midpoints between the neighbouring full-opacity holds", () => {
    solarTransitionMidpoints.forEach((midpoint, index) => {
      const previous = solarChapterWindows[index];
      const next = solarChapterWindows[index + 1];
      expect(midpoint).toBeGreaterThan(previous.holdEnd);
      expect(midpoint).toBeLessThan(next.holdStart);
      expect(getSolarTextPhase(midpoint)).not.toBeNull();
    });
  });

  it("always exposes one or two readable chapters and selects one active step", () => {
    for (let step = 0; step <= 1000; step += 1) {
      const progress = step / 1000;
      const readable = solarChapterWindows.filter(
        (window) => getSolarChapterOpacity(progress, window) > READABLE_OPACITY_THRESHOLD,
      );
      expect(readable.length).toBeGreaterThanOrEqual(1);
      expect(readable.length).toBeLessThanOrEqual(2);
      expect(getActiveSolarPhase(progress)).toBe(getSolarTextPhase(progress));
      expect(getSolarTextPhase(progress)).not.toBeNull();
    }
  });
});

describe("solar phase tables", () => {
  it("keeps windows ordered with small intentional crossfades", () => {
    solarChapterWindows.forEach((window, index) => {
      expect(window.start).toBeLessThanOrEqual(window.holdStart);
      expect(window.holdStart).toBeLessThanOrEqual(window.holdEnd);
      expect(window.holdEnd).toBeLessThanOrEqual(window.end);
      if (index > 0) {
        const previous = solarChapterWindows[index - 1];
        expect(window.start).toBeGreaterThan(previous.start);
        expect(window.start).toBeLessThan(previous.end);
        expect(window.holdStart).toBeGreaterThan(previous.holdEnd);
      }
    });
    expect(solarPhaseAnchors.map((entry) => entry.id)).toEqual(
      solarPhases.map((phase) => phase.id),
    );
  });
});

describe("storytelling emphasis variables", () => {
  it("moves panel focus and collection from dawn through settled night", () => {
    expect(getPanelFocus(anchor("predawn"))).toBe(0);
    expect(getPanelFocus(anchor("morning"))).toBe(1);
    expect(getPanelFocus(anchor("noon"))).toBe(1);
    expect(getPanelFocus(anchor("golden"))).toBeLessThan(getPanelFocus(anchor("noon")));
    expect(getPanelPresence(anchor("morning"))).toBe(1);
    expect(getPanelPresence(anchor("sunset"))).toBeGreaterThan(0);
    expect(getPanelPresence(anchor("night"))).toBe(0);

    expect(getConversionFlow(anchor("predawn"))).toBe(0);
    expect(getConversionFlow(anchor("morning"))).toBeGreaterThan(0);
    expect(getConversionFlow(anchor("morning"))).toBeLessThan(1);
    expect(getConversionFlow(anchor("noon"))).toBe(1);
    expect(getConversionFlow(anchor("night"))).toBe(0);
  });

  it("synchronizes battery entry, presence, focus and semantic state", () => {
    expect(BATTERY_ENTRY_START).toBe(0.4);
    expect(BATTERY_ENTRY_COMPLETE).toBe(0.49);
    expect(BATTERY_EXIT_START).toBe(0.86);
    expect(BATTERY_EXIT_COMPLETE).toBe(0.94);
    expect(getBatteryEntry(BATTERY_ENTRY_START)).toBe(0);
    expect(getBatteryEntry(BATTERY_ENTRY_START + 0.001)).toBeGreaterThan(0);
    expect(getBatteryPresence(BATTERY_ENTRY_START + 0.001)).toBe(
      getBatteryEntry(BATTERY_ENTRY_START + 0.001),
    );

    expect(getBatteryFocus(anchor("morning"))).toBe(0);
    expect(getBatteryFocus(anchor("noon"))).toBe(0);
    expect(getBatteryFocus(anchor("golden"))).toBe(1);
    expect(getBatteryPresence(anchor("golden"))).toBe(1);
    expect(getBatteryPresence(anchor("sunset"))).toBe(1);
    expect(getBatteryPresence(anchor("night"))).toBe(0);

    expect(getSolarBatteryState(0.39)).toBe("inactive");
    expect(getSolarBatteryState(0.45)).toBe("entering");
    expect(getSolarBatteryState(0.55)).toBe("reserved");
    expect(getSolarBatteryState(0.68)).toBe("handoff");
    expect(getSolarBatteryState(1)).toBe("gone");
  });

  it("hands stored energy to the home before revealing the final action", () => {
    expect(getHandoffFlow(anchor("golden"))).toBe(0);
    expect(getHandoffFlow(anchor("sunset"))).toBeGreaterThan(0);
    expect(getHandoffFlow(anchor("night"))).toBeGreaterThan(0.5);

    expect(getHomeFocus(anchor("golden"))).toBe(0);
    expect(getHomeFocus(anchor("sunset"))).toBeGreaterThan(0);
    expect(getHomeFocus(0.9)).toBe(1);

    expect(getHouseContact(0.88)).toBe(0);
    expect(getHomeLight(0.94)).toBe(0);
    expect(getHomeLight(0.96)).toBe(0);
    expect(getFinalCtaActivation(0.965)).toBe(1);
  });

  it("names the current transformation reversibly at every boundary", () => {
    const boundaries = [
      [0.1, "off", "forming"],
      [0.26, "forming", "active"],
      [0.52, "active", "arriving"],
      [0.78, "arriving", "complete"],
    ] as const;
    for (const [edge, before, after] of boundaries) {
      expect(getSolarCurrentState(edge - 1e-6)).toBe(before);
      expect(getSolarCurrentState(edge)).toBe(after);
    }
  });

  it("keeps every numeric signal finite and inside 0..1", () => {
    const functions = [
      getSolarAltitude,
      getPanelFocus,
      getPanelPresence,
      getConversionFlow,
      getBatteryFocus,
      getBatteryEntry,
      getBatteryPresence,
      getHandoffFlow,
      getHomeFocus,
      getHouseContact,
      getHomeLight,
      getFinalCtaActivation,
    ];
    for (let step = -20; step <= 120; step += 1) {
      for (const fn of functions) {
        const value = fn(step / 100);
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it("exposes one aggregate state that agrees with every public signal", () => {
    let longestStaticRun = 0;
    let currentStaticRun = 0;
    let previousSignature = "";

    for (let step = 0; step <= 200; step += 1) {
      const progress = step / 200;
      const state = getSolarStoryState(progress);
      expect(state.environmentPhase).toBe(getSolarEnvironmentPhase(progress));
      expect(state.textPhase).toBe(getSolarTextPhase(progress));
      expect(state.solarAltitude).toBe(getSolarAltitude(progress));
      expect(state.currentState).toBe(getSolarCurrentState(progress));
      expect(state.batteryState).toBe(getSolarBatteryState(progress));
      expect(state.panelPresence).toBe(getPanelPresence(progress));
      expect(state.batteryEntry).toBe(getBatteryEntry(progress));
      expect(state.batteryPresence).toBe(getBatteryPresence(progress));
      expect(state.houseCta).toBe(getFinalCtaActivation(progress));

      const signature = [
        state.environmentPhase,
        state.textPhase,
        state.currentState,
        state.batteryState,
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
    expect(getStoryDistance(5760, 900)).toBe(4050);
  });

  it("honours a custom hold ratio and never returns less than 1", () => {
    expect(getStoryDistance(2000, 900, 0)).toBe(1100);
    expect(getStoryDistance(500, 900)).toBe(1);
  });
});
