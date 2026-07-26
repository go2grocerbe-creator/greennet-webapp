import { describe, expect, test } from "vitest";

import {
  chapterOpacity,
  getSolarStoryState,
  solarChapterWindows,
  solarPhases,
} from "@/lib/solar-story";

describe("solar story progress model", () => {
  test("maps phase anchors to their named phases without relying on browser state", () => {
    for (const phase of solarPhases) {
      expect(getSolarStoryState(phase.progress).phase).toBe(phase.id);
      expect(getSolarStoryState(phase.progress).textPhase).toBe(phase.id);
    }
  });

  test("keeps normalized story values finite and within range", () => {
    for (let index = 0; index <= 200; index += 1) {
      const state = getSolarStoryState(index / 200);
      const entries = Object.entries(state).filter(([, value]) => typeof value === "number");

      for (const [key, value] of entries) {
        expect(Number.isFinite(value), key).toBe(true);
        if (key !== "progress") expect(value, key).toBeGreaterThanOrEqual(0);
        if (key !== "progress") expect(value, key).toBeLessThanOrEqual(1);
      }
    }
  });

  test("has no copy voids longer than a small crossfade interval", () => {
    let longestVoid = 0;
    let currentVoid = 0;

    for (let index = 0; index <= 200; index += 1) {
      const progress = index / 200;
      const readable = solarChapterWindows.some(
        (window) => chapterOpacity(progress, window) > 0.05,
      );

      if (readable) {
        longestVoid = Math.max(longestVoid, currentVoid);
        currentVoid = 0;
      } else {
        currentVoid += 1;
      }
    }

    longestVoid = Math.max(longestVoid, currentVoid);
    expect(longestVoid).toBeLessThanOrEqual(4);
  });

  test("keeps house dark until sun contact and removes competing assets at settled night", () => {
    expect(getSolarStoryState(0.9).houseContact).toBeLessThan(0.95);
    expect(getSolarStoryState(0.9).homeLight).toBe(0);
    expect(getSolarStoryState(0.96).houseContact).toBeGreaterThanOrEqual(0.95);
    expect(getSolarStoryState(0.96).homeLight).toBeGreaterThan(0);

    const night = getSolarStoryState(1);
    expect(night.homeLight).toBe(1);
    expect(night.panelPresence).toBe(0);
    expect(night.batteryPresence).toBe(0);
  });

  test("expresses sunlight into current as reversible named states", () => {
    expect(getSolarStoryState(0.05).currentState).toBe("off");
    expect(getSolarStoryState(0.18).currentState).toBe("forming");
    expect(getSolarStoryState(0.36).currentState).toBe("active");
    expect(getSolarStoryState(0.56).currentState).toBe("arriving");
    expect(getSolarStoryState(0.72).currentState).toBe("complete");
    expect(getSolarStoryState(0.36).currentFlow).toBeGreaterThan(
      getSolarStoryState(0.18).currentFlow,
    );
  });
});
