"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SunScene } from "@/components/marketing/sun-scene";
import {
  clamp,
  getSolarChapterOpacity,
  getSolarEnvironmentPhase,
  getSolarTextPhase,
  solarChapterWindows,
  solarPhases,
  type SolarPhaseId,
} from "@/lib/solar/solar-phase";

import styles from "./solar-experience.module.css";

const phases = solarPhases;

type PhaseId = SolarPhaseId;

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

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let lastPhase: PhaseId = "predawn";
    let lastVisiblePhase: PhaseId | null = "predawn";
    let wasSettled = false;

    /**
     * Enhanced mode is what pins the chapters into one stacked, phase-gated
     * scene. Under reduced motion the controller never animates, so entering
     * it would leave the chapters overlapping with their supporting copy
     * hidden by the enhanced-only rules. Staying unenhanced hands those users
     * the server-rendered static document instead — progressive enhancement
     * as ADR-014 intends, rather than a second set of overrides fighting the
     * enhanced cascade on specificity.
     */
    const applyEnhancedState = () => {
      if (reducedQuery.matches) {
        delete root.dataset.enhanced;
        delete root.dataset.solarReady;
        return;
      }
      root.dataset.enhanced = "true";
    };
    applyEnhancedState();

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
      const nextPhase = getSolarEnvironmentPhase(progress);
      const nextVisiblePhase = getSolarTextPhase(progress);
      const nextSettled = progress >= 0.997;

      root.style.setProperty("--solar-progress", progress.toFixed(4));
      for (const window of solarChapterWindows) {
        root.style.setProperty(
          `--opacity-${window.id}`,
          getSolarChapterOpacity(progress, window).toFixed(4),
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

      // `data-text-phase` is written synchronously here, but the matching
      // `aria-current="step"` marker is React-rendered and only lands on the
      // next commit. Anything that needs the whole scene to agree — the e2e
      // suite included — waits for `data-solar-ready`, which stays "false"
      // until that commit has happened.
      const awaitsCommit =
        nextPhase !== lastPhase ||
        nextVisiblePhase !== lastVisiblePhase ||
        nextSettled !== wasSettled;

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
      if (nextSettled !== wasSettled) {
        wasSettled = nextSettled;
        root.dataset.sunSettled = nextSettled ? "true" : "false";
        setSunSettled(nextSettled);
      }

      // Nothing was queued for React, so what is already in the DOM is the
      // finished result for this scroll position.
      if (!awaitsCommit) root.dataset.solarReady = "true";
    };

    const requestRender = () => {
      if (reducedQuery.matches) return;
      // A frame is outstanding: the DOM no longer reflects the current scroll
      // position until `render` runs.
      root.dataset.solarReady = "false";
      if (!frame) frame = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestRender();
    });
    observer.observe(root);

    const handleReducedChange = () => {
      applyEnhancedState();
      requestRender();
    };

    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender, { passive: true });
    reducedQuery.addEventListener("change", handleReducedChange);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      reducedQuery.removeEventListener("change", handleReducedChange);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /**
   * Runs after every commit that can change the rendered phase, so the marker
   * only reads "true" once the DOM genuinely reflects the latest computed
   * phase — including the `aria-current="step"` navigation state.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || root.dataset.enhanced !== "true") return;
    root.dataset.solarReady = "true";
  }, [visiblePhase, phase, sunSettled]);

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

      <div className={styles.chapters}>{children}</div>
    </section>
  );
}
