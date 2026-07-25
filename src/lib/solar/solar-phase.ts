/**
 * The canonical solar-day phase model (ADR-014, ADR-018).
 *
 * Every phase-derived output on the homepage — `data-phase`,
 * `data-text-phase`, the `aria-current="step"` navigation marker and the
 * per-chapter `--opacity-*` custom properties — is computed from the
 * thresholds and helpers in this module, so no two consumers can drift
 * apart at a boundary. Pure functions only: no DOM, no React, no styling.
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
  { id: "predawn", start: 0, holdStart: 0, holdEnd: 0.045, end: 0.065 },
  { id: "morning", start: 0.17, holdStart: 0.18, holdEnd: 0.22, end: 0.235 },
  { id: "noon", start: 0.36, holdStart: 0.37, holdEnd: 0.41, end: 0.425 },
  { id: "golden", start: 0.55, holdStart: 0.56, holdEnd: 0.6, end: 0.615 },
  { id: "sunset", start: 0.74, holdStart: 0.75, holdEnd: 0.79, end: 0.805 },
  { id: "night", start: 0.925, holdStart: 0.94, holdEnd: 1, end: 1 },
] as const;

/**
 * A chapter counts as readable to a viewer (and to the e2e suite) once its
 * opacity clears this value — the same threshold the tests sample with, kept
 * here so the definition of "readable" has a single home.
 */
export const READABLE_OPACITY_THRESHOLD = 0.05;

export function clamp(value: number, min = 0, max = 1): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export const clampProgress = (progress: number): number => clamp(progress);

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
 * The chapter whose copy is currently readable, or `null` in the deliberate
 * transition gaps between chapters. Drives both `data-text-phase` and the
 * active navigation step so the two can never disagree.
 */
export function getSolarTextPhase(progress: number): SolarPhaseId | null {
  const value = clampProgress(progress);
  return (
    solarChapterWindows.find(
      (window) => getSolarChapterOpacity(value, window) > READABLE_OPACITY_THRESHOLD,
    )?.id ?? null
  );
}

/** The navigation step to mark `aria-current="step"`; `null` during transitions. */
export const getActiveSolarPhase = getSolarTextPhase;

/** Serialized form of {@link getSolarTextPhase} used by the `data-text-phase` attribute. */
export function getSolarTextPhaseAttribute(progress: number): SolarPhaseId | "transition" {
  return getSolarTextPhase(progress) ?? "transition";
}

/** Scroll progress at which each named phase is centred. */
export const solarPhaseAnchors: readonly {
  readonly id: SolarPhaseId;
  readonly progress: number;
}[] = solarPhases.map(({ id, progress }) => ({ id, progress }));

/**
 * Midpoints of the gaps between consecutive chapter windows — the points the
 * e2e suite samples to prove no copy is readable mid-transition. Derived from
 * the windows themselves rather than hard-coded, so they stay centred (and
 * therefore unambiguous) if a window ever moves.
 */
export const solarTransitionMidpoints: readonly number[] = solarChapterWindows
  .slice(0, -1)
  .map((window, index) => {
    const next = solarChapterWindows[index + 1];
    return Number(((window.end + next.start) / 2).toFixed(4));
  });
