import type { CSSProperties } from "react";

import styles from "./solar-experience.module.css";

const panelCells = Array.from({ length: 15 }, (_, index) => index);
const stars = Array.from({ length: 30 }, (_, index) => ({
  x: (index * 37 + 11) % 97,
  y: (index * 23 + 7) % 58,
  size: index % 5 === 0 ? 2 : 1,
}));

/**
 * The energy relay is drawn as two explicit journeys so its direction is
 * legible: collection (panel field → battery) drawn by --conversion-flow
 * across Morning/Noon, then delivery (battery → the centered night home)
 * drawn by --handoff-flow across Sunset/Night. Coordinates live in the
 * 1200×720 stage space and match the CSS object positions.
 */
const COLLECT_PATH = "M255 640 C420 560 650 540 905 600";
const DELIVER_PATH = "M905 600 C820 505 700 510 600 642";

/** Decorative layered environment; never presented as project photography. */
export function SunScene() {
  return (
    <div className={styles.world}>
      <div className={styles.skyPredawn} />
      <div className={styles.skyDay} />
      <div className={styles.skyGolden} />
      <div className={styles.skyNight} />
      <div className={styles.stars}>
        {stars.map((star, index) => (
          <i
            key={index}
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          />
        ))}
      </div>

      <div className={styles.horizonGlow} />
      <div className={styles.horizon} />

      <div className={styles.panelField} data-solar-panels>
        <div className={styles.panelPlane}>
          {panelCells.map((cell) => (
            <i key={cell} style={{ "--cell-i": cell } as CSSProperties} />
          ))}
        </div>
        <div className={styles.panelShadow} />
      </div>

      <svg
        className={styles.energyPath}
        viewBox="0 0 1200 720"
        preserveAspectRatio="none"
        data-solar-energy-path
      >
        <path className={styles.collectGhost} d={COLLECT_PATH} />
        <path className={styles.collectLive} pathLength="1" d={COLLECT_PATH} />
        <path className={styles.deliverGhost} d={DELIVER_PATH} />
        <path className={styles.deliverLive} pathLength="1" d={DELIVER_PATH} />
        <circle className={styles.collectNode} cx="905" cy="600" r="5" />
        <circle className={styles.deliverNode} cx="600" cy="642" r="6" />
      </svg>

      <div className={styles.battery} data-solar-battery>
        <span className={styles.batteryLabel} aria-hidden="true">
          Energy reserved
        </span>
        <span className={styles.batteryCap} />
        <span className={styles.batteryBody}>
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={styles.nightHome} data-solar-home>
        <span className={styles.roof} />
        <span className={styles.houseBody} />
        <span className={styles.window} />
        <span className={styles.door} />
      </div>
      <div className={styles.shadowLine} />
    </div>
  );
}
