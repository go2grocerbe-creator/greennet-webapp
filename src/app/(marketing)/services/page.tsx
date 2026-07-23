import type { Metadata } from "next";

import { PublicDataState } from "@/components/marketing/public-data-state";
import { SolarPageHero } from "@/components/marketing/solar-page-hero";
import { Container } from "@/components/ui/container";
import { listServicesForPublic } from "@/lib/admin/services";
import { getServerServicesDataSource } from "@/lib/admin/services-data-source";

export const metadata: Metadata = {
  title: "Solar Solutions",
  description: "Solar energy services offered by GreenNet Energy.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const ds = await getServerServicesDataSource();
  const result = await listServicesForPublic(ds);

  return (
    <>
      <SolarPageHero
        tone="noon"
        eyebrow="Solar Solutions"
        time="12:08"
        title="Work done in daylight."
        description="Published solar energy services offered by GreenNet Energy."
      />
      <Container className="public-catalogue">
        {result.status === "unavailable" ? (
          <PublicDataState kind="services" status="unavailable" />
        ) : result.data.length === 0 ? (
          <PublicDataState kind="services" status="empty" />
        ) : (
          <ol className="service-ledger">
            {result.data.map((service, index) => (
              <li key={service.id}>
                <div className="service-ledger__index">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {service.icon && <p>{service.icon}</p>}
                </div>
                <div className="service-ledger__content">
                  <h2>{service.title}</h2>
                  <p className="service-ledger__summary">{service.summary}</p>
                  <p className="service-ledger__body">{service.body}</p>
                </div>
                <div className="service-ledger__ray" aria-hidden="true" />
              </li>
            ))}
          </ol>
        )}
      </Container>
    </>
  );
}
