import type { SolutionLifecycleStep } from "@/lib/content/solar-solutions";

type SolutionLifecycleProps = {
  steps: readonly SolutionLifecycleStep[];
};

export function SolutionLifecycle({ steps }: SolutionLifecycleProps) {
  return (
    <section className="solutions-section solution-lifecycle" aria-labelledby="lifecycle-title">
      <div className="solutions-section__intro">
        <p>Project lifecycle</p>
        <h2 id="lifecycle-title">A clear route from requirement to support.</h2>
      </div>

      <ol className="solution-lifecycle__track" aria-label="Solar solution lifecycle">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
