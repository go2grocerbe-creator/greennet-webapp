import Link from "next/link";
import { ArrowDownRight } from "lucide-react";

import type { SolutionCapability } from "@/lib/content/solar-solutions";

type SolutionCapabilityListProps = {
  capabilities: readonly SolutionCapability[];
};

export function SolutionCapabilityList({ capabilities }: SolutionCapabilityListProps) {
  return (
    <section
      className="solutions-section solution-capabilities"
      aria-labelledby="capabilities-title"
    >
      <div className="solutions-section__intro solutions-section__intro--dark">
        <p>Detailed capabilities</p>
        <h2 id="capabilities-title">From site conditions to a working system.</h2>
        <span>
          Each capability answers a different part of the same question: what does this property
          actually require?
        </span>
      </div>

      <ol className="solution-capability-ledger">
        {capabilities.map((capability, index) => (
          <li key={capability.id} id={capability.id}>
            <div className="solution-capability-ledger__heading">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{capability.title}</h3>
              <p>{capability.outcome}</p>
            </div>
            <div className="solution-capability-ledger__detail">
              <p>{capability.description}</p>
              <p className="solution-capability-ledger__value">{capability.customerValue}</p>
              <ul aria-label={`${capability.title} deliverables`}>
                {capability.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
              <Link href={`/contact?interest=${capability.interest}`}>
                Discuss this capability
                <ArrowDownRight aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
