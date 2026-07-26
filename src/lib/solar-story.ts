export const solarPhases = [
  { id: "predawn", label: "Pre-dawn", progress: 0 },
  { id: "morning", label: "Morning", progress: 0.17 },
  { id: "noon", label: "Noon", progress: 0.34 },
  { id: "golden", label: "Golden hour", progress: 0.53 },
  { id: "sunset", label: "Sunset", progress: 0.72 },
  { id: "night", label: "Night", progress: 1 },
] as const;

export type SolarPhaseId = (typeof solarPhases)[number]["id"];
export type CurrentState = "off" | "forming" | "active" | "arriving" | "complete";

export type SolarStoryState = {
  progress: number;
  phase: SolarPhaseId;
  textPhase: SolarPhaseId;
  currentState: CurrentState;
  daylight: number;
  nightMorph: number;
  solarAltitude: number;
  panelLight: number;
  panelFocus: number;
  panelPresence: number;
  currentFlow: number;
  batteryEntry: number;
  batteryFocus: number;
  batteryPresence: number;
  homeFocus: number;
  handoffFlow: number;
  houseContact: number;
  homeLight: number;
  ctaReveal: number;
};

export type ChapterWindow = {
  id: SolarPhaseId;
  start: number;
  holdStart: number;
  holdEnd: number;
  end: number;
};

export const solarChapterWindows: readonly ChapterWindow[] = [
  { id: "predawn", start: 0, holdStart: 0, holdEnd: 0.09, end: 0.15 },
  { id: "morning", start: 0.095, holdStart: 0.14, holdEnd: 0.26, end: 0.325 },
  { id: "noon", start: 0.27, holdStart: 0.32, holdEnd: 0.46, end: 0.525 },
  { id: "golden", start: 0.46, holdStart: 0.51, holdEnd: 0.645, end: 0.705 },
  { id: "sunset", start: 0.64, holdStart: 0.695, holdEnd: 0.815, end: 0.88 },
  { id: "night", start: 0.815, holdStart: 0.87, holdEnd: 1, end: 1 },
] as const;

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function ease(value: number) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

export function ramp(progress: number, start: number, end: number) {
  return clamp((progress - start) / Math.max(0.001, end - start));
}

export function phaseForProgress(progress: number): SolarPhaseId {
  const value = clamp(progress);
  if (value < 0.1) return "predawn";
  if (value < 0.28) return "morning";
  if (value < 0.46) return "noon";
  if (value < 0.65) return "golden";
  if (value < 0.84) return "sunset";
  return "night";
}

export function chapterOpacity(progress: number, window: ChapterWindow) {
  const value = clamp(progress);
  if (value < window.start || value > window.end) return 0;
  if (value < window.holdStart) return ramp(value, window.start, window.holdStart);
  if (value <= window.holdEnd) return 1;
  return ramp(value, window.end, window.holdEnd);
}

export function textPhaseForProgress(progress: number): SolarPhaseId {
  let best = solarChapterWindows[0];
  let bestOpacity = -1;
  for (const window of solarChapterWindows) {
    const opacity = chapterOpacity(progress, window);
    if (opacity > bestOpacity) {
      best = window;
      bestOpacity = opacity;
    }
  }
  return best.id;
}

export function currentStateForProgress(progress: number): CurrentState {
  const value = clamp(progress);
  if (value < 0.115) return "off";
  if (value < 0.255) return "forming";
  if (value < 0.48) return "active";
  if (value < 0.66) return "arriving";
  return "complete";
}

export function getSolarStoryState(progress: number): SolarStoryState {
  const value = clamp(progress);
  const daylight = ramp(value, 0, 0.82);
  const solarAltitude = Math.sin(Math.PI * daylight);
  const nightMorph = ease(ramp(value, 0.82, 0.97));
  const houseContact = ease(ramp(value, 0.865, 0.97));
  const ctaReveal = ramp(houseContact, 0.95, 1);
  const homeLight = ctaReveal;
  const panelPresence = 1 - ease(ramp(value, 0.68, 0.88));
  const batteryEntry = ease(ramp(value, 0.43, 0.54));
  const batteryPresence = batteryEntry * (1 - ease(ramp(value, 0.76, 0.93)));

  return {
    progress: value,
    phase: phaseForProgress(value),
    textPhase: textPhaseForProgress(value),
    currentState: currentStateForProgress(value),
    daylight,
    nightMorph,
    solarAltitude,
    panelLight: clamp(solarAltitude * 1.18) * panelPresence,
    panelFocus: ease(ramp(value, 0.1, 0.2)) * (1 - ease(ramp(value, 0.42, 0.62))),
    panelPresence,
    currentFlow: ease(ramp(value, 0.115, 0.38)) * (1 - ease(ramp(value, 0.7, 0.9))),
    batteryEntry,
    batteryFocus: batteryEntry * (1 - ease(ramp(value, 0.64, 0.8))),
    batteryPresence,
    homeFocus: ease(ramp(value, 0.68, 0.88)),
    handoffFlow: ease(ramp(value, 0.62, 0.86)) * (1 - ease(ramp(value, 0.93, 1))),
    houseContact,
    homeLight,
    ctaReveal,
  };
}
