import type { Metadata } from "next";

import { SolarPageHero } from "@/components/marketing/solar-page-hero";
import { SolutionCta } from "@/components/marketing/solution-cta";
import { Container } from "@/components/ui/container";
import { listProjectsForPublic } from "@/lib/admin/projects";
import { getServerProjectsDataSource } from "@/lib/admin/projects-data-source";
import { SOLUTION_SECTORS } from "@/lib/content/solar-solutions";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "GreenNet project pathways and approved published project information for commercial and selected residential solar work.",
  alternates: { canonical: "/projects" },
};

function formatCompletionDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function ProjectsPage() {
  const ds = await getServerProjectsDataSource();
  const result = await listProjectsForPublic(ds);
  const projects = result.status === "ok" ? result.data : [];

  return (
    <>
      <SolarPageHero
        tone="golden"
        eyebrow="Projects"
        time="16:42"
        title="Every site asks a different question."
        description="Explore the environments GreenNet can assess and the approved project records published by the team."
      />

      <Container className="solutions-editorial">
        <section className="solutions-section" aria-labelledby="project-pathways-title">
          <div className="solutions-section__intro">
            <p>Installation environments</p>
            <h2 id="project-pathways-title">A pathway for each operating context.</h2>
            <span>
              These are intended project pathways, not claims about completed GreenNet work. A site
              assessment determines the appropriate next step for a specific property.
            </span>
          </div>

          <ul className="solution-sector-list">
            {SOLUTION_SECTORS.map((sector, index) => (
              <li key={sector.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{sector.title}</h3>
                <p>{sector.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="project-proof-policy" aria-labelledby="project-proof-title">
          <p>Portfolio standard</p>
          <h2 id="project-proof-title">Project evidence is published after approval.</h2>
          <p>
            GreenNet project entries appear here only after their details are published. Project
            photography remains withheld until its authenticity and usage rights are confirmed.
          </p>
        </section>

        {projects.length > 0 && (
          <section className="published-services" aria-labelledby="published-projects-title">
            <div className="solutions-section__intro">
              <p>Published portfolio</p>
              <h2 id="published-projects-title">Approved project records.</h2>
              <span>
                These records contain only information GreenNet has explicitly moved to published
                status. Draft records never render on this route.
              </span>
            </div>

            <ol className="service-ledger">
              {projects.map((project, index) => {
                const completionDate = formatCompletionDate(project.completionDate);
                return (
                  <li key={project.id}>
                    <div className="service-ledger__index">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="service-ledger__content">
                      <h3>{project.title}</h3>
                      <p className="project-record__meta">
                        <span>{project.location}</span>
                        {completionDate && (
                          <time dateTime={project.completionDate!}>{completionDate}</time>
                        )}
                      </p>
                      <p className="service-ledger__summary">{project.summary}</p>
                      <p className="service-ledger__body">{project.description}</p>
                    </div>
                    <div className="service-ledger__ray" aria-hidden="true" />
                  </li>
                );
              })}
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
