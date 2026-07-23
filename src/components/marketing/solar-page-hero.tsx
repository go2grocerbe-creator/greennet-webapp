type SolarPageHeroProps = {
  tone: "noon" | "golden" | "night";
  eyebrow: string;
  title: string;
  description: string;
  time: string;
};

export function SolarPageHero({ tone, eyebrow, title, description, time }: SolarPageHeroProps) {
  return (
    <header className={`solar-page-hero solar-page-hero--${tone}`}>
      <div className="solar-page-hero__orbit" aria-hidden="true">
        <i />
        <span />
      </div>
      <div className="solar-page-hero__plane" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="solar-page-hero__content">
        <p className="solar-page-hero__time">
          <span>{eyebrow}</span>
          <time>{time}</time>
        </p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
