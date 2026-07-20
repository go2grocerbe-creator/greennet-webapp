import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { listServicesForPublic } from "@/lib/admin/services";
import { getServerServicesDataSource } from "@/lib/admin/services-data-source";

export const metadata: Metadata = {
  title: "Solar Solutions",
  description: "Solar energy services offered by GreenNet Energy.",
  alternates: { canonical: "/services" },
};

/**
 * Reuses the admin Services data layer (src/lib/admin/services.ts) —
 * `listServicesForPublic` calls the exact same `ServicesDataSource.list()`
 * method the admin table uses; RLS (`services_public_read_published`) is
 * what actually restricts an anonymous visitor to published rows, not a
 * separate query — see docs/decision-log.md ADR-013.
 */
export default async function ServicesPage() {
  const ds = await getServerServicesDataSource();
  const result = await listServicesForPublic(ds);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="What we offer"
        title="Solar Solutions"
        description="Solar energy services offered by GreenNet Energy."
      />
      <div className="mt-10">
        {result.status === "unavailable" ? (
          <p className="border-border text-muted-foreground rounded-lg border p-6 text-sm">
            Services are unavailable right now. Please check back soon.
          </p>
        ) : result.data.length === 0 ? (
          <p className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
            No services are published yet. Please check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((service) => (
              <article key={service.id} className="border-border rounded-lg border p-6">
                {service.icon && (
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    {service.icon}
                  </p>
                )}
                <h2 className="font-heading mt-1 text-lg font-semibold">{service.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{service.summary}</p>
                <p className="mt-3 text-sm whitespace-pre-wrap">{service.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
