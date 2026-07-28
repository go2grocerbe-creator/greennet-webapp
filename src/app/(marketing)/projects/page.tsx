"use client";

/**
 * Projects & Capabilities Page
 * Claude Reimagination Design - Phase 5
 * Displays sectors and scopes (not fabricated case studies)
 */
export default function ProjectsPage() {
  const capabilities = [
    {
      sector: "Industrial",
      title: "Factory & manufacturing rooftops",
      description:
        "Rooftop and ground-mount generation paired with storage for continuous-process operations.",
      scope: "Site assessment, rooftop/ground array, storage, monitoring",
      img: "/images/greennet/factory-rooftop-solar.png",
      alt: "Factory rooftop solar installation with battery storage integration",
    },
    {
      sector: "Hospitality",
      title: "Hotel and guest-facility systems",
      description:
        "Generation and backup sized for guest-facing reliability across day and night operation.",
      scope: "Rooftop array, backup storage, monitoring dashboard",
      img: "/images/greennet/hotel-exterior-solar.png",
      alt: "Hotel exterior with solar panels supporting guest-facing operations",
    },
    {
      sector: "Commercial",
      title: "Office & mixed-use buildings",
      description:
        "Grid-tied systems for daytime-load commercial buildings with consumption monitoring.",
      scope: "Rooftop array, three-phase inverter, monitoring",
      img: "/images/greennet/office-building-exterior.png",
      alt: "Commercial office building with integrated solar system",
    },
    {
      sector: "Residential & Estates",
      title: "Estates and large residential sites",
      description:
        "Per-unit or shared infrastructure for multi-property developments and premium homes.",
      scope: "System design, phased installation, ongoing support",
      img: "/images/greennet/gated-estate-aerial.png",
      alt: "Aerial view of gated estate with solar infrastructure",
    },
    {
      sector: "Mobility",
      title: "EV charging infrastructure",
      description:
        "Charging bays for fleets, staff and visitors, integrated with on-site generation where relevant.",
      scope: "Charging stations, load management, monitoring",
      img: "/images/greennet/ev-charging-station.png",
      alt: "EV charging station powered by solar generation",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section
        style={{
          background: "var(--midnight-navy)",
          padding: "64px 24px 48px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--solar-amber)",
              margin: "0 0 14px",
            }}
          >
            Projects &amp; Capabilities
          </p>
          <h1
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "clamp(30px, 4vw, 46px)",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
              margin: 0,
              color: "var(--warm-white)",
              maxWidth: "760px",
            }}
          >
            What we deliver, across the sectors we work in.
          </h1>
          <p
            style={{
              margin: "20px 0 0",
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--light-grey)",
              maxWidth: "620px",
            }}
          >
            Named project details are shared with prospective clients on request, once
            approved for public reference. This page reflects the sectors and scopes we
            deliver in.
          </p>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section
        style={{
          padding: "72px 24px 96px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            background: "rgba(13, 27, 36, 0.1)",
          }}
        >
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--warm-white)",
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: "40px",
                padding: "40px 8px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  borderRadius: "2px",
                  overflow: "hidden",
                  aspectRatio: "16/10",
                }}
              >
                <img
                  src={cap.img}
                  alt={cap.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--petrol-teal)",
                  }}
                >
                  {cap.sector}
                </span>
                <h2
                  style={{
                    margin: "10px 0 12px",
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    fontSize: "22px",
                    color: "var(--midnight-navy)",
                  }}
                >
                  {cap.title}
                </h2>
                <p
                  style={{
                    margin: "0 0 14px",
                    fontFamily: "var(--font-inter)",
                    fontSize: "15px",
                    lineHeight: "1.75",
                    color: "var(--muted-grey)",
                    maxWidth: "560px",
                  }}
                >
                  {cap.description}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-inter)",
                    fontSize: "13px",
                    color: "var(--titanium-grey)",
                  }}
                >
                  Typical scope: {cap.scope}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        style={{
          padding: "64px 24px",
          background: "var(--petrol-teal)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 6px",
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "22px",
                color: "var(--warm-white)",
              }}
            >
              Have a project in mind?
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                color: "rgba(245, 242, 234, 0.8)",
              }}
            >
              We can share relevant reference projects once your requirements are clear.
            </p>
          </div>
          <a
            href="/quote"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--midnight-navy)",
              background: "var(--solar-amber)",
              padding: "15px 28px",
              borderRadius: "2px",
              textDecoration: "none",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              border: "none",
              transition: "background 0.2s ease",
            }}
          >
            Discuss a Project
          </a>
        </div>
      </section>
    </>
  );
}
