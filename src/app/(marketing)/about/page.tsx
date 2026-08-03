import type { Metadata } from "next";

import { SolarPageHero } from "@/components/marketing/solar-page-hero";
import { SolutionCta } from "@/components/marketing/solution-cta";
import { Container } from "@/components/ui/container";
import { ABOUT_PRINCIPLES } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "About GreenNet Energy and its quality-led approach to solar systems, installation, monitoring, and support.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <SolarPageHero
        tone="noon"
        eyebrow="About GreenNet"
        time="10:24"
        title="Dependable power starts with clear decisions."
        description="GreenNet provides quality solar systems, installation, monitoring, and support for dependable power infrastructure."
      />

      <Container className="solutions-editorial">
        <section className="solutions-section" aria-labelledby="about-positioning-title">
          <div className="solutions-section__intro">
            <p>Our focus</p>
            <h2 id="about-positioning-title">Systems shaped around the requirement.</h2>
            <span>
              GreenNet helps commercial, institutional, industrial, and selected large residential
              clients invest in dependable renewable-energy systems through quality product
              selection, professional installation, monitoring, and after-sales support.
            </span>
          </div>

          <div className="about-scope" aria-label="GreenNet scope">
            <p>Based in Benin City, Nigeria</p>
            <p>
              The work begins by understanding the property, operating need, available space, and
              priorities that should inform the system.
            </p>
          </div>
        </section>

        <section className="solutions-section" aria-labelledby="about-principles-title">
          <div className="solutions-section__intro">
            <p>Working principles</p>
            <h2 id="about-principles-title">Five signals guide the work.</h2>
            <span>
              These principles keep product, installation, monitoring, and support decisions tied to
              the approved project scope.
            </span>
          </div>

          <ol className="solution-sector-list">
            {ABOUT_PRINCIPLES.map((principle, index) => (
              <li key={principle.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </Container>

      <Container className="solutions-cta-wrap">
        <SolutionCta />
      </Container>
    </>
  );
}
