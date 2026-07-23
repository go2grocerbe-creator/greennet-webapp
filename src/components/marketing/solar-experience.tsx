"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { SunScene } from "@/components/marketing/sun-scene";

import styles from "./solar-experience.module.css";

const phases = [
  { id: "predawn", label: "Pre-dawn", progress: 0 },
  { id: "morning", label: "Morning", progress: 0.19 },
  { id: "noon", label: "Noon", progress: 0.38 },
  { id: "golden", label: "Golden hour", progress: 0.57 },
  { id: "sunset", label: "Sunset", progress: 0.76 },
  { id: "night", label: "Night", progress: 1 },
] as const;

type PhaseId = (typeof phases)[number]["id"];
type ObjectCue = "panel" | "battery";

type ChapterWindow = {
  id: PhaseId;
  start: number;
  holdStart: number;
  holdEnd: number;
  end: number;
};

const chapterWindows: readonly ChapterWindow[] = [
  { id: "predawn", start: 0, holdStart: 0, holdEnd: 0.045, end: 0.065 },
  { id: "morning", start: 0.17, holdStart: 0.18, holdEnd: 0.22, end: 0.235 },
  { id: "noon", start: 0.36, holdStart: 0.37, holdEnd: 0.41, end: 0.425 },
  { id: "golden", start: 0.55, holdStart: 0.56, holdEnd: 0.6, end: 0.615 },
  { id: "sunset", start: 0.74, holdStart: 0.75, holdEnd: 0.79, end: 0.805 },
  { id: "night", start: 0.925, holdStart: 0.94, holdEnd: 1, end: 1 },
] as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function phaseForProgress(progress: number): PhaseId {
  if (progress < 0.1) return "predawn";
  if (progress < 0.3) return "morning";
  if (progress < 0.5) return "noon";
  if (progress < 0.7) return "golden";
  if (progress < 0.88) return "sunset";
  return "night";
}

function chapterOpacity(progress: number, window: ChapterWindow) {
  if (progress < window.start || progress > window.end) return 0;
  if (progress < window.holdStart) {
    return clamp((progress - window.start) / Math.max(0.001, window.holdStart - window.start));
  }
  if (progress <= window.holdEnd) return 1;
  return clamp((window.end - progress) / Math.max(0.001, window.end - window.holdEnd));
}

function visiblePhaseForProgress(progress: number): PhaseId | null {
  return chapterWindows.find((window) => chapterOpacity(progress, window) > 0)?.id ?? null;
}

function objectCueForProgress(progress: number): ObjectCue | null {
  if (progress >= 0.245 && progress <= 0.345) return "panel";
  if (progress >= 0.625 && progress <= 0.725) return "battery";
  return null;
}

/**
 * The one client controller for the solar story. Native scroll remains the
 * input. Layout is read once per animation frame and motion is expressed as
 * CSS variables; React only re-renders when the named phase changes.
 */
export function SolarExperience({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const movedDuringDrag = useRef(false);
  const [phase, setPhase] = useState<PhaseId>("predawn");
  const [visiblePhase, setVisiblePhase] = useState<PhaseId | null>("predawn");
  const [sunSettled, setSunSettled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const scrollToProgress = useCallback((progress: number, behavior: ScrollBehavior = "smooth") => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = window.scrollY + root.getBoundingClientRect().top;
    const distance = Math.max(1, root.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: top + clamp(progress) * distance,
      behavior: reduced ? "auto" : behavior,
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.dataset.enhanced = "true";
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let lastPhase: PhaseId = "predawn";
    let lastVisiblePhase: PhaseId | null = "predawn";
    let lastObjectCue: ObjectCue | null | undefined;
    let wasSettled = false;

    const render = () => {
      frame = 0;
      if (!visible || reducedQuery.matches) return;

      const rect = root.getBoundingClientRect();
      const distance = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      const daylight = clamp(progress / 0.82);
      const nightMorph = clamp((progress - 0.82) / 0.16);
      const solarAltitude = Math.sin(Math.PI * daylight);
      const dawnWarmth = clamp((progress - 0.015) / 0.11) * (1 - clamp((progress - 0.2) / 0.16));
      const duskWarmth = clamp((progress - 0.5) / 0.17) * (1 - clamp((progress - 0.8) / 0.14));
      const shadowStrength =
        (0.2 + Math.abs(daylight - 0.5) * 1.15) * (1 - clamp((progress - 0.84) / 0.16) * 0.55);
      const panelLight = clamp(solarAltitude * 1.18) * (1 - clamp((progress - 0.72) / 0.24) * 0.72);
      const baseX = 7 + daylight * 86;
      const baseY = 80 - Math.sin(Math.PI * daylight) * 68;
      const sunX = baseX * (1 - nightMorph) + 50 * nightMorph;
      const endpointLiftProgress = clamp((progress - 0.97) / 0.03);
      const endpointLift =
        endpointLiftProgress * endpointLiftProgress * (3 - 2 * endpointLiftProgress);
      const sunY = baseY * (1 - endpointLift) + 70 * endpointLift;
      const nextPhase = phaseForProgress(progress);
      const nextVisiblePhase = visiblePhaseForProgress(progress);
      const nextObjectCue = objectCueForProgress(progress);
      const nextSettled = progress >= 0.997;

      root.style.setProperty("--solar-progress", progress.toFixed(4));
      for (const window of chapterWindows) {
        root.style.setProperty(
          `--opacity-${window.id}`,
          chapterOpacity(progress, window).toFixed(4),
        );
      }
      root.style.setProperty("--sun-x", `${sunX.toFixed(2)}%`);
      root.style.setProperty("--sun-y", `${sunY.toFixed(2)}%`);
      root.style.setProperty("--solar-altitude", solarAltitude.toFixed(4));
      root.style.setProperty("--dawn-warmth", dawnWarmth.toFixed(4));
      root.style.setProperty("--dusk-warmth", duskWarmth.toFixed(4));
      root.style.setProperty("--shadow-strength", shadowStrength.toFixed(4));
      root.style.setProperty("--shadow-softness", `${(0.6 + solarAltitude * 1.3).toFixed(3)}rem`);
      root.style.setProperty("--panel-light", panelLight.toFixed(4));
      root.style.setProperty("--terrain-lift", `${((1 - solarAltitude) * 1.8).toFixed(3)}vh`);
      root.style.setProperty("--atmosphere-shift", `${((progress - 0.5) * 2.4).toFixed(3)}vw`);
      root.style.setProperty("--battery-presence", clamp((progress - 0.47) / 0.11).toFixed(4));
      root.style.setProperty("--charge-low", clamp((progress - 0.39) / 0.13).toFixed(4));
      root.style.setProperty("--charge-mid", clamp((progress - 0.52) / 0.13).toFixed(4));
      root.style.setProperty("--charge-high", clamp((progress - 0.65) / 0.13).toFixed(4));
      root.style.setProperty("--stored-glow", clamp((progress - 0.58) / 0.28).toFixed(4));
      root.style.setProperty("--home-light", clamp((progress - 0.84) / 0.12).toFixed(4));
      root.style.setProperty("--pre-dawn", clamp(1 - progress / 0.12).toFixed(4));
      root.style.setProperty(
        "--daylight",
        (clamp((progress - 0.04) / 0.19) * (1 - clamp((progress - 0.56) / 0.18))).toFixed(4),
      );
      root.style.setProperty(
        "--golden-hour",
        (clamp((progress - 0.38) / 0.16) * (1 - clamp((progress - 0.69) / 0.13))).toFixed(4),
      );
      root.style.setProperty("--night", clamp((progress - 0.69) / 0.25).toFixed(4));
      root.style.setProperty("--sun-morph", nightMorph.toFixed(4));
      root.style.setProperty("--cta-reveal", clamp((progress - 0.992) / 0.008).toFixed(4));
      root.style.setProperty("--phone-reveal", clamp((progress - 0.97) / 0.015).toFixed(4));
      root.style.setProperty("--shadow-reach", `${((0.5 - daylight) * 56).toFixed(2)}vw`);
      root.style.setProperty("--camera-tilt", `${((progress - 0.5) * 7).toFixed(2)}deg`);

      if (nextPhase !== lastPhase) {
        lastPhase = nextPhase;
        root.dataset.phase = nextPhase;
        setPhase(nextPhase);
        if (nextPhase === "night") setNavOpen(false);
      }
      if (nextVisiblePhase !== lastVisiblePhase) {
        lastVisiblePhase = nextVisiblePhase;
        root.dataset.textPhase = nextVisiblePhase ?? "transition";
        setVisiblePhase(nextVisiblePhase);
      }
      if (nextObjectCue !== lastObjectCue) {
        lastObjectCue = nextObjectCue;
        root.dataset.objectCue = nextObjectCue ?? "none";
      }
      if (nextSettled !== wasSettled) {
        wasSettled = nextSettled;
        root.dataset.sunSettled = nextSettled ? "true" : "false";
        setSunSettled(nextSettled);
      }
    };

    const requestRender = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestRender();
    });
    observer.observe(root);

    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender, { passive: true });
    reducedQuery.addEventListener("change", requestRender);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      reducedQuery.removeEventListener("change", requestRender);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const selectPhase = (target: (typeof phases)[number]) => {
    setNavOpen(false);
    scrollToProgress(target.progress);
  };

  const handleSunKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = phases.findIndex((item) => item.id === phase);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectPhase(phases[Math.max(0, index - 1)]);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectPhase(phases[Math.min(phases.length - 1, index + 1)]);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectPhase(phases[0]);
    } else if (event.key === "End") {
      event.preventDefault();
      selectPhase(phases[phases.length - 1]);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || !rootRef.current) return;
    const stage = rootRef.current.querySelector<HTMLElement>("[data-solar-stage]");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const normalized = clamp((event.clientX - rect.left) / rect.width, 0.07, 0.93);
    movedDuringDrag.current = true;
    scrollToProgress(((normalized - 0.07) / 0.86) * 0.78, "auto");
  };

  const currentLabel = phases.find((item) => item.id === phase)?.label ?? "Pre-dawn";

  return (
    <section
      ref={rootRef}
      className={styles.experience}
      data-phase={phase}
      data-text-phase={visiblePhase ?? "transition"}
      data-sun-settled={sunSettled ? "true" : "false"}
      data-nav-open={navOpen ? "true" : "false"}
      aria-label="A solar day"
    >
      <a href="#after-solar-story" className={styles.skipStory}>
        Skip the solar story
      </a>
      <noscript>
        <nav className={styles.noScriptNavigation} aria-label="Solar day phases">
          {phases.map((item) => (
            <a key={item.id} href={`#solar-${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </noscript>
      <div className={styles.solarControl}>
        <button
          type="button"
          className={styles.sunHandle}
          aria-expanded={navOpen}
          aria-controls="solar-phase-navigation"
          aria-label={
            sunSettled
              ? "Night. Request a quotation"
              : `${currentLabel}. Open solar day navigation. Use arrow keys to move through time.`
          }
          onClick={() => {
            if (movedDuringDrag.current) {
              movedDuringDrag.current = false;
              return;
            }
            if (sunSettled) {
              window.location.assign("/contact");
              return;
            }
            if (phase === "night") {
              scrollToProgress(1);
              return;
            }
            setNavOpen((open) => !open);
          }}
          onKeyDown={handleSunKeyDown}
          onPointerDown={(event) => {
            if (event.pointerType === "touch" || phase === "night") return;
            movedDuringDrag.current = false;
            setDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => {
            setDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => setDragging(false)}
        >
          <span className={styles.sunCore} aria-hidden="true" />
          <span className={styles.sunCtaLabel}>Request a quotation</span>
        </button>

        <nav
          id="solar-phase-navigation"
          className={styles.phaseNavigation}
          aria-label="Solar day phases"
        >
          <p className={styles.phaseNavigationTitle}>Solar time</p>
          <ol>
            {phases.map((item) => (
              <li key={item.id}>
                <a
                  href={`#solar-${item.id}`}
                  aria-current={visiblePhase === item.id ? "step" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    selectPhase(item);
                  }}
                >
                  <span>{item.label}</span>
                  <i aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className={styles.stage} data-solar-stage aria-hidden="true">
        <SunScene />
      </div>

      <nav className={styles.objectCues} aria-label="Explore GreenNet">
        <Link
          href="/services"
          className={`${styles.objectCue} ${styles.panelCue}`}
          data-object-cue-link="panel"
        >
          <span>Follow the current</span>
          <strong>Solar Solutions</strong>
          <i aria-hidden="true" />
        </Link>
        <Link
          href="/products"
          className={`${styles.objectCue} ${styles.batteryCue}`}
          data-object-cue-link="battery"
        >
          <span>Use what the day stored</span>
          <strong>Batteries &amp; inverters</strong>
          <i aria-hidden="true" />
        </Link>
      </nav>

      <div className={styles.chapters}>{children}</div>
    </section>
  );
}
