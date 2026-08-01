/**
 * The canonical solar-day model. Every phase-derived output on the
 * homepage — `data-phase`, `data-text-phase`, the active navigation step,
 * the per-chapter `--opacity-*` properties and the five storytelling
 * emphasis variables — is computed from the thresholds and helpers here,
 * so no two consumers can drift apart at a boundary. Pure functions only:
 * no DOM, no React, no styling.
 */

export const solarPhases = [
  { id: "predawn", label: "Pre-dawn", progress: 0 },
  { id: "morning", label: "Morning", progress: 0.16 },
  { id: "noon", label: "Noon", progress: 0.32 },
  { id: "golden", label: "Golden hour", progress: 0.5 },
  { id: "sunset", label: "Sunset", progress: 0.68 },
  { id: "night", label: "Night", progress: 1 },
] as const;

export type SolarPhaseId = (typeof solarPhases)[number]["id"];

/** Upper bound (exclusive) of each named environment phase. */
const environmentThresholds: readonly { readonly id: SolarPhaseId; readonly below: number }[] = [
  { id: "predawn", below: 0.08 },
  { id: "morning", below: 0.25 },
  { id: "noon", below: 0.43 },
  { id: "golden", below: 0.62 },
  { id: "sunset", below: 0.82 },
] as const;

export type SolarChapterWindow = {
  id: SolarPhaseId;
  /** Fade-in begins. */
  start: number;
  /** Fully readable from here… */
  holdStart: number;
  /** …until here. */
  holdEnd: number;
  /** Fade-out completes. */
  end: number;
};

export const solarChapterWindows: readonly SolarChapterWindow[] = [
  { id: "predawn", start: 0, holdStart: 0, holdEnd: 0.075, end: 0.12 },
  { id: "morning", start: 0.105, holdStart: 0.13, holdEnd: 0.235, end: 0.28 },
  { id: "noon", start: 0.255, holdStart: 0.29, holdEnd: 0.415, end: 0.46 },
  { id: "golden", start: 0.435, holdStart: 0.47, holdEnd: 0.61, end: 0.655 },
  { id: "sunset", start: 0.63, holdStart: 0.665, holdEnd: 0.805, end: 0.86 },
  { id: "night", start: 0.835, holdStart: 0.875, holdEnd: 1, end: 1 },
] as const;

/** A chapter counts as readable once its opacity clears this value. */
export const READABLE_OPACITY_THRESHOLD = 0.05;

export function clamp(value: number, min = 0, max = 1): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export const clampProgress = (progress: number): number => clamp(progress);

/** Linear 0→1 ramp between `from` and `to`, clamped outside. */
export function ramp(progress: number, from: number, to: number): number {
  return clamp((progress - from) / Math.max(0.0001, to - from));
}

/** The environment phase (sky, light, shadow) for a scroll position. */
export function getSolarEnvironmentPhase(progress: number): SolarPhaseId {
  const value = clampProgress(progress);
  return environmentThresholds.find((threshold) => value < threshold.below)?.id ?? "night";
}

export function getSolarChapterOpacity(progress: number, window: SolarChapterWindow): number {
  const value = clampProgress(progress);
  if (value < window.start || value > window.end) return 0;
  if (value < window.holdStart) {
    return clamp((value - window.start) / Math.max(0.001, window.holdStart - window.start));
  }
  if (value <= window.holdEnd) return 1;
  return clamp((window.end - value) / Math.max(0.001, window.end - window.holdEnd));
}

/**
 * The chapter whose copy is currently readable, or `null` in the
 * deliberate transition gaps. Drives `data-text-phase` and the active
 * navigation step so the two can never disagree.
 */
export function getSolarTextPhase(progress: number): SolarPhaseId | null {
  const value = clampProgress(progress);
  let best: { id: SolarPhaseId; opacity: number } | null = null;
  for (const window of solarChapterWindows) {
    const opacity = getSolarChapterOpacity(value, window);
    if (opacity > READABLE_OPACITY_THRESHOLD && (!best || opacity > best.opacity)) {
      best = { id: window.id, opacity };
    }
  }
  return best?.id ?? null;
}

export const getActiveSolarPhase = getSolarTextPhase;

export function getSolarTextPhaseAttribute(progress: number): SolarPhaseId | "transition" {
  return getSolarTextPhase(progress) ?? "transition";
}

export const solarPhaseAnchors: readonly {
  readonly id: SolarPhaseId;
  readonly progress: number;
}[] = solarPhases.map(({ id, progress }) => ({ id, progress }));

/** Midpoints of the gaps between chapter windows — provably copy-free. */
export const solarTransitionMidpoints: readonly number[] = solarChapterWindows
  .slice(0, -1)
  .map((window, index) =>
    Number(((window.holdEnd + solarChapterWindows[index + 1].holdStart) / 2).toFixed(4)),
  );

/* ── Storytelling emphasis variables ─────────────────────────────────────
   Each function maps scroll progress to one CSS custom property. The
   documented range notes are the contract the scene CSS builds on. */

/**
 * `--panel-focus` — how strongly the panel field is the story's subject.
 * 0 in pre-dawn, ramps in over 0.06–0.16, holds 1 through Morning and
 * Noon, recedes to ~0.35 across Golden (0.48–0.62) and dies out through
 * Sunset (0.74–0.9) so the night field reads as a silhouette.
 */
export function getPanelFocus(progress: number): number {
  const p = clampProgress(progress);
  return ramp(p, 0.045, 0.15) * (1 - 0.55 * ramp(p, 0.46, 0.6)) * (1 - ramp(p, 0.68, 0.83));
}

/**
 * `--conversion-flow` — the collection segment of the energy path
 * (panels → battery) and its confidence. Starts drawing at 0.14, fully
 * drawn just before the Noon anchor (0.37), then relaxes: −45% over
 * 0.62–0.8 and a further −60% of the remainder over 0.85–0.97 so it
 * survives at night only as a faint trace.
 */
export function getConversionFlow(progress: number): number {
  const p = clampProgress(progress);
  return ramp(p, 0.1, 0.32) * (1 - 0.35 * ramp(p, 0.56, 0.72)) * (1 - ramp(p, 0.78, 0.9));
}

/**
 * `--battery-focus` — how strongly the battery is the subject. 0 until
 * 0.45, 1 across Golden (0.56–0.7), then eases back to ~0.5 over
 * 0.72–0.88 and stays there: present and charged at night, but clearly
 * supporting the house rather than competing with it.
 */
export function getBatteryFocus(progress: number): number {
  const p = clampProgress(progress);
  return ramp(p, 0.4, 0.49) * (1 - 0.45 * ramp(p, 0.62, 0.78)) * (1 - ramp(p, 0.86, 0.94));
}

/**
 * `--handoff-flow` — the delivery segment of the energy path
 * (battery → home). Draws across Sunset, then softens to a supporting
 * trace once the illuminated home becomes the Night subject.
 */
export function getHandoffFlow(progress: number): number {
  const p = clampProgress(progress);
  return ramp(p, 0.62, 0.86) * (1 - 0.45 * ramp(p, 0.93, 1));
}

/**
 * `--home-focus` — the house's arrival: opacity, travel toward the
 * centered night position and scale. Begins during Sunset (0.72) and
 * completes at 0.92, before the sun settles into the final action.
 */
export function getHomeFocus(progress: number): number {
  return ramp(clampProgress(progress), 0.66, 0.9);
}

export type CurrentState = "off" | "forming" | "active" | "arriving" | "complete";

export type SolarStoryState = {
  progress: number;
  environmentPhase: SolarPhaseId;
  textPhase: SolarPhaseId | null;
  panelFocus: number;
  panelPresence: number;
  conversionFlow: number;
  currentState: CurrentState;
  batteryEntry: number;
  batteryFocus: number;
  batteryPresence: number;
  handoffFlow: number;
  homeFocus: number;
  houseContact: number;
  homeLight: number;
  houseCta: number;
};

export function getCurrentState(progress: number): CurrentState {
  const p = clampProgress(progress);
  if (p < 0.1) return "off";
  if (p < 0.26) return "forming";
  if (p < 0.52) return "active";
  if (p < 0.78) return "arriving";
  return "complete";
}

export function getHouseContact(progress: number): number {
  return ramp(clampProgress(progress), 0.88, 0.965);
}

export function getSolarStoryState(progress: number): SolarStoryState {
  const p = clampProgress(progress);
  const houseContact = getHouseContact(p);
  const batteryEntry = ramp(p, 0.4, 0.49);
  const batteryExit = 1 - ramp(p, 0.86, 0.94);
  const panelFocus = getPanelFocus(p);
  return {
    progress: p,
    environmentPhase: getSolarEnvironmentPhase(p),
    textPhase: getSolarTextPhase(p),
    panelFocus,
    panelPresence: panelFocus * (1 - ramp(p, 0.82, 0.9)),
    conversionFlow: getConversionFlow(p),
    currentState: getCurrentState(p),
    batteryEntry,
    batteryFocus: getBatteryFocus(p),
    batteryPresence: batteryEntry * batteryExit,
    handoffFlow: getHandoffFlow(p),
    homeFocus: getHomeFocus(p),
    houseContact,
    homeLight: houseContact >= 0.95 ? ramp(houseContact, 0.95, 1) : 0,
    houseCta: houseContact >= 0.95 ? ramp(houseContact, 0.95, 1) : 0,
  };
}

/**
 * The scrollable distance that maps to story progress. A deliberate hold
 * (`holdRatio` of the viewport, default 0.9) is excluded from the
 * mapping, so the story reaches progress = 1 while that much pinned
 * scroll remains — the settled Night scene holds before the next section
 * can enter. Never returns less than 1.
 */
export function getStoryDistance(
  rootHeight: number,
  viewportHeight: number,
  holdRatio = 0.9,
): number {
  return Math.max(1, rootHeight - viewportHeight - Math.round(viewportHeight * holdRatio));
}
