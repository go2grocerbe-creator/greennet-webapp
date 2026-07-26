"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { SunScene } from "@/components/marketing/sun-scene";
import {
  chapterOpacity,
  clamp,
  getSolarStoryState,
  solarChapterWindows,
  solarPhases,
  type SolarPhaseId,
} from "@/lib/solar-story";

import styles from "./solar-experience.module.css";

/**
 * The one client controller for the solar story. Native scroll remains the
 * input. Layout is read once per animation frame and motion is expressed as
 * CSS variables; React only re-renders when the named phase changes.
 */
export function SolarExperience({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const movedDuringDrag = useRef(false);
  const [phase, setPhase] = useState<SolarPhaseId>("predawn");
  const [visiblePhase, setVisiblePhase] = useState<SolarPhaseId>("predawn");
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
    let lastPhase: SolarPhaseId = "predawn";
    let lastVisiblePhase: SolarPhaseId = "predawn";
    let wasSettled = false;

    const render = () => {
      frame = 0;
      if (reducedQuery.matches) return;

      const rect = root.getBoundingClientRect();
      const distance = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      const story = getSolarStoryState(progress);
      const daylight = story.daylight;
      const solarAltitude = story.solarAltitude;
      const dawnWarmth = clamp((progress - 0.015) / 0.11) * (1 - clamp((progress - 0.2) / 0.16));
      const duskWarmth = clamp((progress - 0.5) / 0.17) * (1 - clamp((progress - 0.8) / 0.14));
      const shadowStrength =
        (0.2 + Math.abs(daylight - 0.5) * 1.15) * (1 - clamp((progress - 0.84) / 0.16) * 0.55);
      const panelLight = story.panelLight;
      const isMobile = window.innerWidth < 768;
      const baseX = isMobile ? 14 + daylight * 72 : 7 + daylight * 86;
      const baseY = isMobile
        ? 74 - Math.sin(Math.PI * daylight) * 48
        : 80 - Math.sin(Math.PI * daylight) * 68;
      const sunX = baseX * (1 - story.houseContact) + 50 * story.houseContact;
      const sunY = baseY * (1 - story.houseContact) + (isMobile ? 68 : 74) * story.houseContact;
      const nextPhase = story.phase;
      const nextVisiblePhase = story.textPhase;
      const nextSettled = story.ctaReveal >= 0.95;

      root.style.setProperty("--solar-progress", progress.toFixed(4));
      for (const window of solarChapterWindows) {
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
      root.style.setProperty("--panel-focus", story.panelFocus.toFixed(4));
      root.style.setProperty("--panel-presence", story.panelPresence.toFixed(4));
      root.style.setProperty("--current-flow", story.currentFlow.toFixed(4));
      root.style.setProperty("--terrain-lift", `${((1 - solarAltitude) * 1.8).toFixed(3)}vh`);
      root.style.setProperty("--atmosphere-shift", `${((progress - 0.5) * 2.4).toFixed(3)}vw`);
      root.style.setProperty("--battery-entry", story.batteryEntry.toFixed(4));
      root.style.setProperty("--battery-focus", story.batteryFocus.toFixed(4));
      root.style.setProperty("--battery-presence", story.batteryPresence.toFixed(4));
      root.style.setProperty("--charge-low", clamp((progress - 0.39) / 0.12).toFixed(4));
      root.style.setProperty("--charge-mid", clamp((progress - 0.48) / 0.12).toFixed(4));
      root.style.setProperty("--charge-high", clamp((progress - 0.57) / 0.12).toFixed(4));
      root.style.setProperty("--stored-glow", clamp((progress - 0.58) / 0.28).toFixed(4));
      root.style.setProperty("--home-focus", story.homeFocus.toFixed(4));
      root.style.setProperty("--handoff-flow", story.handoffFlow.toFixed(4));
      root.style.setProperty("--house-contact", story.houseContact.toFixed(4));
      root.style.setProperty("--home-light", story.homeLight.toFixed(4));
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
      root.style.setProperty("--sun-morph", story.houseContact.toFixed(4));
      root.style.setProperty("--cta-reveal", story.ctaReveal.toFixed(4));
      root.style.setProperty("--shadow-reach", `${((0.5 - daylight) * 56).toFixed(2)}vw`);
      root.style.setProperty("--camera-tilt", `${((progress - 0.5) * 7).toFixed(2)}deg`);
      root.dataset.currentState = story.currentState;

      if (nextPhase !== lastPhase) {
        lastPhase = nextPhase;
        root.dataset.phase = nextPhase;
        setPhase(nextPhase);
        if (nextPhase === "night") setNavOpen(false);
      }
      if (nextVisiblePhase !== lastVisiblePhase) {
        lastVisiblePhase = nextVisiblePhase;
        root.dataset.textPhase = nextVisiblePhase;
        setVisiblePhase(nextVisiblePhase);
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
      if (entry.isIntersecting) requestRender();
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

  const selectPhase = (target: (typeof solarPhases)[number]) => {
    setNavOpen(false);
    scrollToProgress(target.progress);
  };

  const handleSunKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = solarPhases.findIndex((item) => item.id === phase);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectPhase(solarPhases[Math.max(0, index - 1)]);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectPhase(solarPhases[Math.min(solarPhases.length - 1, index + 1)]);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectPhase(solarPhases[0]);
    } else if (event.key === "End") {
      event.preventDefault();
      selectPhase(solarPhases[solarPhases.length - 1]);
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

  const currentLabel = solarPhases.find((item) => item.id === phase)?.label ?? "Pre-dawn";

  return (
    <section
      ref={rootRef}
      className={styles.experience}
      data-phase={phase}
      data-text-phase={visiblePhase}
      data-sun-settled={sunSettled ? "true" : "false"}
      data-nav-open={navOpen ? "true" : "false"}
      aria-label="A solar day"
    >
      <a href="#after-solar-story" className={styles.skipStory}>
        Skip the solar story
      </a>
      <noscript>
        <nav className={styles.noScriptNavigation} aria-label="Solar day phases">
          {solarPhases.map((item) => (
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
              ? "Night. The sun has entered the house."
              : `${currentLabel}. Open solar day navigation. Use arrow keys to move through time.`
          }
          tabIndex={sunSettled ? -1 : undefined}
          aria-hidden={sunSettled ? "true" : undefined}
          onClick={() => {
            if (movedDuringDrag.current) {
              movedDuringDrag.current = false;
              return;
            }
            if (sunSettled) {
              scrollToProgress(1);
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
        </button>

        <div className={styles.progressRail} data-testid="solar-progress-rail" aria-hidden="true">
          <span className={styles.progressRailTrack}>
            <span className={styles.progressRailFill} data-testid="solar-progress-rail-fill" />
          </span>
          {solarPhases.map((item) => (
            <i
              key={item.id}
              className={visiblePhase === item.id ? styles.progressRailMarkerActive : undefined}
              style={{ top: `${item.progress * 100}%` }}
            />
          ))}
        </div>

        <Link
          href="/services"
          className={styles.panelSemanticLink}
          data-testid="solar-panel-link"
          aria-label="Open Solar Solutions from the solar panel"
        >
          <span>Explore Solar Solutions</span>
        </Link>

        <Link
          href="/products"
          className={styles.batterySemanticLink}
          data-testid="solar-battery-link"
          aria-label="Open Products for batteries and inverters"
        >
          <span>See Products</span>
        </Link>

        <Link
          href="/contact"
          className={styles.houseSemanticLink}
          data-testid="solar-house-link"
          aria-label="Request a quotation from the illuminated house"
        >
          <span>Request a quotation</span>
        </Link>

        <nav
          id="solar-phase-navigation"
          className={styles.phaseNavigation}
          aria-label="Solar day phases"
        >
          <p className={styles.phaseNavigationTitle}>Solar time</p>
          <ol>
            {solarPhases.map((item) => (
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
