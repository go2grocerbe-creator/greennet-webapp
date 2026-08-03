import type { Metadata } from "next";

import { SolarPageHero } from "@/components/marketing/solar-page-hero";
import { SolutionCapabilityList } from "@/components/marketing/solution-capability-list";
import { SolutionCta } from "@/components/marketing/solution-cta";
import { SolutionLifecycle } from "@/components/marketing/solution-lifecycle";
import { SolutionPillarGrid } from "@/components/marketing/solution-pillar-grid";
import { SolutionSectorPathways } from "@/components/marketing/solution-sector-pathways";
import { Container } from "@/components/ui/container";
import { listServicesForPublic } from "@/lib/admin/services";
import { getServerServicesDataSource } from "@/lib/admin/services-data-source";
import {
  SOLUTION_CAPABILITIES,
  SOLUTION_LIFECYCLE,
  SOLUTION_PILLARS,
  SOLUTION_SECTORS,
} from "@/lib/content/solar-solutions";

export const metadata: Metadata = {
  title: "Solar Solutions",
  description:
    "Solar and energy infrastructure assessment, supply, installation and support from GreenNet Energy.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const ds = await getServerServicesDataSource();
  const result = await listServicesForPublic(ds);

  return (
    <>
      <SolarPageHero
        tone="noon"
        eyebrow="GreenNet Solutions"
        time="12:08"
        title="Reliable energy begins with the right system."
        description="GreenNet assesses, supplies, installs and supports solar and energy infrastructure for businesses, commercial properties, estates and selected homes."
      />

      <Container className="solutions-editorial">
        <SolutionPillarGrid pillars={SOLUTION_PILLARS} />
      </Container>

      <div className="solution-capabilities-field">
        <Container>
          <SolutionCapabilityList capabilities={SOLUTION_CAPABILITIES} />
        </Container>
      </div>

      <Container className="solutions-editorial">
        <SolutionLifecycle steps={SOLUTION_LIFECYCLE} />
        <SolutionSectorPathways sectors={SOLUTION_SECTORS} />

        {result.status === "ok" && result.data.length > 0 && (
          <section className="published-services" aria-labelledby="published-services-title">
            <div className="solutions-section__intro">
              <p>Published catalogue</p>
              <h2 id="published-services-title">Approved service records.</h2>
              <span>
                This catalogue contains only service records GreenNet has explicitly published.
                Draft records never render on this route.
              </span>
            </div>

            <ol className="service-ledger">
              {result.data.map((service, index) => (
                <li key={service.id}>
                  <div className="service-ledger__index">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {service.icon && <p>{service.icon}</p>}
                  </div>
                  <div className="service-ledger__content">
                    <h3>{service.title}</h3>
                    <p className="service-ledger__summary">{service.summary}</p>
                    <p className="service-ledger__body">{service.body}</p>
                  </div>
                  <div className="service-ledger__ray" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </section>
        )}
      </Container>

      <Container className="solutions-cta-wrap">
        <SolutionCta />
      </Container>
    </>
  );
}
