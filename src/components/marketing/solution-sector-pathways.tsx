import type { SolutionSector } from "@/lib/content/solar-solutions";

type SolutionSectorPathwaysProps = {
  sectors: readonly SolutionSector[];
};

export function SolutionSectorPathways({ sectors }: SolutionSectorPathwaysProps) {
  return (
    <section className="solutions-section solution-sectors" aria-labelledby="sector-pathways-title">
      <div className="solutions-section__intro">
        <p>Sector pathways</p>
        <h2 id="sector-pathways-title">Different properties. Different operating questions.</h2>
        <span>
          These pathways describe where a solution conversation may begin; they do not represent
          completed-project claims.
        </span>
      </div>

      <ul className="solution-sector-list">
        {sectors.map((sector, index) => (
          <li key={sector.title}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <h3>{sector.title}</h3>
            <p>{sector.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
