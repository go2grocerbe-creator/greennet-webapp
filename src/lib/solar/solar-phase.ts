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
  { id: "morning", label: "Morning", progress: 0.19 },
  { id: "noon", label: "Noon", progress: 0.38 },
  { id: "golden", label: "Golden hour", progress: 0.57 },
  { id: "sunset", label: "Sunset", progress: 0.76 },
  { id: "night", label: "Night", progress: 1 },
] as const;

export type SolarPhaseId = (typeof solarPhases)[number]["id"];

/** Upper bound (exclusive) of each named environment phase. */
const environmentThresholds: readonly { readonly id: SolarPhaseId; readonly below: number }[] = [
  { id: "predawn", below: 0.1 },
  { id: "morning", below: 0.3 },
  { id: "noon", below: 0.5 },
  { id: "golden", below: 0.7 },
  { id: "sunset", below: 0.88 },
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
  { id: "predawn", start: 0, holdStart: 0, holdEnd: 0.105, end: 0.135 },
  { id: "morning", start: 0.105, holdStart: 0.135, holdEnd: 0.26, end: 0.305 },
  { id: "noon", start: 0.275, holdStart: 0.315, holdEnd: 0.445, end: 0.49 },
  { id: "golden", start: 0.455, holdStart: 0.515, holdEnd: 0.645, end: 0.695 },
  { id: "sunset", start: 0.665, holdStart: 0.715, holdEnd: 0.82, end: 0.875 },
  { id: "night", start: 0.84, holdStart: 0.91, holdEnd: 1, end: 1 },
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

/** The sun's normalized altitude for the continuous daylight arc. */
export function getSolarAltitude(progress: number): number {
  return Math.sin(Math.PI * clamp(clampProgress(progress) / 0.82));
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
  return (
    solarChapterWindows.find(
      (window) => getSolarChapterOpacity(value, window) > READABLE_OPACITY_THRESHOLD,
    )?.id ?? null
  );
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
  .map((window, index) => {
    const next = solarChapterWindows[index + 1];
    return Number(((window.end + next.start) / 2).toFixed(4));
  });

export const BATTERY_ENTRY_START = 0.42;
export const BATTERY_ENTRY_COMPLETE = 0.54;

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
  return ramp(p, 0.06, 0.16) * (1 - 0.65 * ramp(p, 0.48, 0.62)) * (1 - ramp(p, 0.74, 0.9));
}

/**
 * `--panel-presence` — whether the physical panel should remain visible.
 * It holds through the generation story, then fades completely by settled
 * Night so the house owns the final frame.
 */
export function getPanelPresence(progress: number): number {
  return 1 - ramp(clampProgress(progress), 0.76, 0.94);
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
  return ramp(p, 0.14, 0.37) * (1 - 0.45 * ramp(p, 0.62, 0.8)) * (1 - 0.6 * ramp(p, 0.85, 0.97));
}

export type SolarCurrentState = "off" | "forming" | "active" | "arriving" | "complete";

/**
 * A semantic name for the panel-to-storage relay. This is intentionally
 * derived from progress, not from timers, so fast reverse scroll restores
 * the correct state immediately.
 */
export function getSolarCurrentState(progress: number): SolarCurrentState {
  const p = clampProgress(progress);
  if (p < 0.14) return "off";
  if (p < 0.3) return "forming";
  if (p < 0.52) return "active";
  if (p < 0.72) return "arriving";
  return "complete";
}

/**
 * `--battery-focus` — how strongly the battery is the subject. 0 until
 * 0.45, 1 across Golden (0.56–0.7), then eases away so settled Night can
 * resolve around the illuminated house without a competing product object.
 */
export function getBatteryFocus(progress: number): number {
  const p = clampProgress(progress);
  return ramp(p, 0.45, 0.56) * (1 - ramp(p, 0.72, 0.93));
}

/**
 * The canonical entry signal for the physical battery. The rendered
 * battery, decorative "Energy Reserved" label, products connector and pulse
 * activation all read this same output so they appear on the same frame.
 */
export function getBatteryEntry(progress: number): number {
  return ramp(clampProgress(progress), BATTERY_ENTRY_START, BATTERY_ENTRY_COMPLETE);
}

export type SolarBatteryState = "inactive" | "entering" | "reserved" | "handoff" | "gone";

export function getSolarBatteryState(progress: number): SolarBatteryState {
  const p = clampProgress(progress);
  if (getBatteryEntry(p) <= 0) return "inactive";
  if (p < BATTERY_ENTRY_COMPLETE) return "entering";
  if (p < 0.66) return "reserved";
  if (getBatteryPresence(p) > 0) return "handoff";
  return "gone";
}

/**
 * `--battery-presence` — physical entry/exit of the battery. It appears
 * before Golden Hour, stays available through the storage cue, and reaches
 * zero at settled Night after the handoff has done its job.
 */
export function getBatteryPresence(progress: number): number {
  const p = clampProgress(progress);
  return getBatteryEntry(p) * (1 - ramp(p, 0.76, 0.94));
}

/**
 * `--handoff-flow` — the delivery segment of the energy path
 * (battery → home). Draws across Sunset into Night, 0.66–0.88.
 */
export function getHandoffFlow(progress: number): number {
  return ramp(clampProgress(progress), 0.66, 0.88);
}

/**
 * `--home-focus` — the house's arrival: opacity, travel toward the
 * centered night position and scale. Begins during Sunset (0.72) and
 * completes at 0.92, before the sun settles into the final action.
 */
export function getHomeFocus(progress: number): number {
  return ramp(clampProgress(progress), 0.72, 0.92);
}

/**
 * `--house-contact` — the deterministic moment where the sun has reached
 * the home. Home light and final CTA activation are gated behind this so
 * the ending reads as cause-and-effect, not a floating overlay.
 */
export function getHouseContact(progress: number): number {
  return ramp(clampProgress(progress), 0.865, 0.97);
}

export function getHomeLight(progress: number): number {
  return ramp(getHouseContact(progress), 0.95, 1);
}

export const getFinalCtaActivation = getHomeLight;

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
