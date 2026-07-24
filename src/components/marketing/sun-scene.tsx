import Link from "next/link";

import styles from "./solar-experience.module.css";

const panelCells = Array.from({ length: 15 }, (_, index) => index);
const stars = Array.from({ length: 30 }, (_, index) => ({
  x: (index * 37 + 11) % 97,
  y: (index * 23 + 7) % 58,
  size: index % 5 === 0 ? 2 : 1,
}));

type Gateway = "panel" | "battery" | "home";

/** Layered illustrative environment; never presented as project photography. */
export function SunScene({
  activeGateway,
  finalCta,
}: {
  activeGateway: Gateway | null;
  finalCta: boolean;
}) {
  return (
    <div className={styles.world}>
      <div className={styles.skyPredawn} aria-hidden="true" />
      <div className={styles.skyDay} aria-hidden="true" />
      <div className={styles.skyGolden} aria-hidden="true" />
      <div className={styles.skyNight} aria-hidden="true" />
      <div className={styles.stars} aria-hidden="true">
        {stars.map((star, index) => (
          <i
            key={index}
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          />
        ))}
      </div>

      <div className={styles.horizonGlow} aria-hidden="true" />
      <div className={styles.horizon} aria-hidden="true" />

      <Link
        href="/services"
        className={`${styles.panelField} ${styles.sceneGateway}`}
        data-object-cue-link="panel"
        aria-label="Explore Solar Solutions"
        tabIndex={activeGateway === "panel" ? 0 : -1}
      >
        <div className={styles.panelPlane} aria-hidden="true">
          {panelCells.map((cell) => (
            <i key={cell} />
          ))}
        </div>
        <div className={styles.panelShadow} aria-hidden="true" />
        <span className={styles.panelGatewayLabel}>
          <small>Follow the current</small>
          Explore Solar Solutions <b aria-hidden="true">↓</b>
        </span>
      </Link>

      <svg
        className={styles.energyPath}
        viewBox="0 0 1200 720"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className={styles.energyPathGhost}
          d="M80 586 C290 520 360 178 650 140 S1040 330 1110 520 C950 600 760 556 600 504"
        />
        <path
          className={styles.energyPathLive}
          pathLength="1"
          d="M80 586 C290 520 360 178 650 140 S1040 330 1110 520 C950 600 760 556 600 504"
        />
        <circle className={styles.energyPathEnd} cx="600" cy="504" r="5" />
      </svg>

      <Link
        href="/products"
        className={`${styles.battery} ${styles.sceneGateway}`}
        data-object-cue-link="battery"
        aria-label="Explore batteries and inverters"
        tabIndex={activeGateway === "battery" ? 0 : -1}
      >
        <span className={styles.batteryCap} aria-hidden="true" />
        <span className={styles.batteryBody} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.batteryGatewayLabel}>
          <small>Stored for later</small>
          Explore Batteries &amp; Inverters <b aria-hidden="true">→</b>
        </span>
      </Link>
      <Link
        href="/services"
        className={`${styles.nightHome} ${styles.sceneGateway}`}
        data-solar-home
        data-object-cue-link="home"
        aria-label="View our solutions"
        tabIndex={activeGateway === "home" ? 0 : -1}
      >
        <span className={styles.homeLightWash} aria-hidden="true" />
        <span className={styles.homeGroundGlow} aria-hidden="true" />
        <span className={styles.homeEnergyPulse} aria-hidden="true" />
        <span className={styles.chimney} aria-hidden="true" />
        <span className={styles.roof} aria-hidden="true" />
        <span className={styles.houseBody} aria-hidden="true" />
        <span className={styles.houseSide} aria-hidden="true" />
        <span className={styles.window} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className={styles.sideWindow} aria-hidden="true">
          <i />
          <i />
        </span>
        <span className={styles.door} aria-hidden="true">
          <i />
        </span>
        <span className={styles.porch} aria-hidden="true" />
        <span className={styles.homeCtaLabel} aria-hidden={!finalCta}>
          <span>View our solutions</span>
        </span>
      </Link>
      <div className={styles.shadowLine} aria-hidden="true" />
      <p className={styles.solarReadout}>
        SOLAR DAY <span>05:42 — 19:11</span>
      </p>
    </div>
  );
}
