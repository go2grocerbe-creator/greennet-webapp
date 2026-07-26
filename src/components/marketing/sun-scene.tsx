import styles from "./solar-experience.module.css";

const panelCells = Array.from({ length: 15 }, (_, index) => index);
const stars = Array.from({ length: 30 }, (_, index) => ({
  x: (index * 37 + 11) % 97,
  y: (index * 23 + 7) % 58,
  size: index % 5 === 0 ? 2 : 1,
}));

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

      <div className={styles.panelField}>
        <div className={styles.panelPlane}>
          {panelCells.map((cell) => (
            <i key={cell} />
          ))}
        </div>
        <div className={styles.panelShadow} />
      </div>

      <svg className={styles.energyPath} viewBox="0 0 1200 720" preserveAspectRatio="none">
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

      <div className={styles.battery}>
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
      <div className={styles.nightHome}>
        <span className={styles.roof} />
        <span className={styles.houseBody} />
        <span className={styles.window} />
        <span className={styles.door} />
      </div>
      <div className={styles.shadowLine} />
      <p className={styles.solarReadout}>SOLAR DAY</p>
    </div>
  );
}
