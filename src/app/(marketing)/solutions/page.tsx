"use client";

/**
 * Solutions Page
 * Claude Reimagination Design - Phase 5
 * Commercial & Industrial and Residential & Estates solutions
 */
export default function SolutionsPage() {
  const commercialUses = [
    {
      title: "Factories & Manufacturing",
      description:
        "Continuous-process operations where an unplanned outage stops production lines.",
      systems: "Commercial Energy Systems, Battery Storage",
      img: "/images/greennet/factory-rooftop-solar.png",
      alt: "Factory rooftop solar installation with integrated battery storage",
    },
    {
      title: "Hotels & Hospitality",
      description:
        "Guest-facing operations where power reliability protects both comfort and reputation.",
      systems: "Solar Panels, Monitoring Systems",
      img: "/images/greennet/hotel-exterior-solar.png",
      alt: "Hotel exterior with solar panels installed on roof",
    },
    {
      title: "Offices & Commercial Buildings",
      description:
        "Daytime-load buildings well suited to grid-tied generation with monitored consumption.",
      systems: "Solar Panels, Inverters",
      img: "/images/greennet/office-building-exterior.png",
      alt: "Commercial office building with rooftop solar array",
    },
    {
      title: "Property Developers",
      description:
        "New developments specifying energy infrastructure at the design stage, at scale.",
      systems: "Commercial Energy Systems, Solar Carports",
      img: "/images/greennet/development-construction-aerial.png",
      alt: "Aerial view of development construction site with solar infrastructure",
    },
  ];

  const residentialUses = [
    {
      title: "Large Residential Properties",
      description:
        "Homes with significant load and appliance demand that need a properly sized system.",
      systems: "Solar Panels, Battery Storage",
      img: "/images/greennet/residential-estate-house.png",
      alt: "Large residential property with solar installation",
    },
    {
      title: "Estates & Gated Communities",
      description:
        "Shared or per-unit infrastructure for multi-property developments and estates.",
      systems: "Commercial Energy Systems, Monitoring Systems",
      img: "/images/greennet/gated-estate-aerial.png",
      alt: "Aerial view of gated estate community",
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
            Solutions &amp; Applications
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
            The right system depends on how your property actually operates.
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
            We group applications into two categories, because the priorities &mdash;
            uptime, monitoring, scale, budget &mdash; differ meaningfully between them.
          </p>
        </div>
      </section>

      {/* Commercial & Industrial Section */}
      <section style={{ padding: "80px 24px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              marginBottom: "36px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "28px",
                color: "var(--petrol-teal)",
              }}
            >
              01
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 32px)",
                letterSpacing: "-0.01em",
                color: "var(--midnight-navy)",
              }}
            >
              Commercial &amp; Industrial
            </h2>
          </div>
          <p
            style={{
              margin: "0 0 40px",
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--muted-grey)",
              maxWidth: "680px",
            }}
          >
            Operations where downtime carries a direct cost, and where monitored,
            scalable capacity matters as much as the initial installation.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "24px",
            }}
          >
            {commercialUses.map((use, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: "20px",
                  border: "1px solid rgba(13, 27, 36, 0.1)",
                  borderRadius: "2px",
                  padding: "20px",
                  background: "#FFFFFF",
                }}
              >
                <div
                  style={{
                    borderRadius: "2px",
                    overflow: "hidden",
                    aspectRatio: "1/1",
                  }}
                >
                  <img
                    src={use.img}
                    alt={use.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      fontSize: "17px",
                      color: "var(--midnight-navy)",
                    }}
                  >
                    {use.title}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontFamily: "var(--font-inter)",
                      fontSize: "14px",
                      lineHeight: "1.65",
                      color: "var(--muted-grey)",
                    }}
                  >
                    {use.description}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-inter)",
                      fontSize: "12.5px",
                      color: "var(--titanium-grey)",
                    }}
                  >
                    Relevant systems: {use.systems}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Residential & Estates Section */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              marginBottom: "36px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "28px",
                color: "var(--petrol-teal)",
              }}
            >
              02
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 32px)",
                letterSpacing: "-0.01em",
                color: "var(--midnight-navy)",
              }}
            >
              Residential &amp; Estates
            </h2>
          </div>
          <p
            style={{
              margin: "0 0 40px",
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              lineHeight: "1.7",
              color: "var(--muted-grey)",
              maxWidth: "680px",
            }}
          >
            Serious property owners who want a quality, monitored system built to last
            &mdash; not the fastest quote on the market.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "24px",
            }}
          >
            {residentialUses.map((use, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: "20px",
                  border: "1px solid rgba(13, 27, 36, 0.1)",
                  borderRadius: "2px",
                  padding: "20px",
                  background: "#FFFFFF",
                }}
              >
                <div
                  style={{
                    borderRadius: "2px",
                    overflow: "hidden",
                    aspectRatio: "1/1",
                  }}
                >
                  <img
                    src={use.img}
                    alt={use.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      fontSize: "17px",
                      color: "var(--midnight-navy)",
                    }}
                  >
                    {use.title}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontFamily: "var(--font-inter)",
                      fontSize: "14px",
                      lineHeight: "1.65",
                      color: "var(--muted-grey)",
                    }}
                  >
                    {use.description}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-inter)",
                      fontSize: "12.5px",
                      color: "var(--titanium-grey)",
                    }}
                  >
                    Relevant systems: {use.systems}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
              Tell us about your property.
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                color: "rgba(245, 242, 234, 0.8)",
              }}
            >
              We&rsquo;ll recommend an application category and system configuration.
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
            Request a Quotation
          </a>
        </div>
      </section>
    </>
  );
}
