import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SolutionCta() {
  return (
    <section className="solution-cta" aria-labelledby="solution-cta-title">
      <div className="solution-cta__sun" aria-hidden="true" />
      <div className="solution-cta__copy">
        <p>Start with the requirement</p>
        <h2 id="solution-cta-title">Plan the system around the property.</h2>
      </div>
      <div className="solution-cta__actions">
        <Link href="/contact?interest=site_assessment">
          Request a Site Assessment
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/contact?interest=general_enquiry">Discuss Your Energy Requirement</Link>
      </div>
    </section>
  );
}
