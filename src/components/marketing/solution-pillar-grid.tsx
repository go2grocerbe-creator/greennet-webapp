import type { SolutionPillar } from "@/lib/content/solar-solutions";

type SolutionPillarGridProps = {
  pillars: readonly SolutionPillar[];
};

export function SolutionPillarGrid({ pillars }: SolutionPillarGridProps) {
  return (
    <section
      className="solutions-section solutions-pillars"
      aria-labelledby="solution-pillars-title"
    >
      <div className="solutions-section__intro">
        <p>Four connected disciplines</p>
        <h2 id="solution-pillars-title">The system is more than the panels.</h2>
        <span>
          GreenNet brings generation, delivery, system care and emerging energy infrastructure into
          one practical conversation.
        </span>
      </div>

      <ol className="solution-pillar-ledger">
        {pillars.map((pillar, index) => (
          <li key={pillar.title}>
            <div className="solution-pillar-ledger__index" aria-hidden="true">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i />
            </div>
            <div className="solution-pillar-ledger__body">
              <h3>{pillar.title}</h3>
              <p>{pillar.summary}</p>
              <ul aria-label={`${pillar.title} capabilities`}>
                {pillar.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
