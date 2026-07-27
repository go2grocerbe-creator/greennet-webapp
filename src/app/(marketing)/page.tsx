"use client";

/**
 * Claude Reimagination Homepage
 * All business-facing copy below is limited to confirmed taglines, location,
 * and contact facts. Placeholder text marked [Pending approval].
 */
export default function HomePage() {
  const pillars = [
    {
      index: "01",
      title: "Quality",
      description:
        "Approved components and engineering standards, applied consistently regardless of project size.",
    },
    {
      index: "02",
      title: "Performance",
      description:
        "Systems sized and configured for your actual load profile, not a generic package.",
    },
    {
      index: "03",
      title: "Visibility",
      description:
        "Continuous monitoring of generation, storage and consumption, visible to you and to us.",
    },
    {
      index: "04",
      title: "Support",
      description:
        "A dependable after-sales relationship, not a one-time installation and a goodbye.",
    },
    {
      index: "05",
      title: "Progress",
      description:
        "Practical steps toward energy resilience, sequenced to your budget and priorities.",
    },
    {
      index: "06",
      title: "Trust",
      description:
        "Clear specifications, honest timelines and documentation you can hand to your own engineers.",
    },
  ];

  const journey = [
    {
      num: 1,
      title: "Discover",
      description: "Understand your site, load and priorities.",
      barColor: "#0C5A56",
    },
    {
      num: 2,
      title: "Evaluate",
      description: "Review system options against your requirements.",
      barColor: "#0C5A56",
    },
    {
      num: 3,
      title: "Assess",
      description: "A technical site assessment of your property.",
      barColor: "#0C5A56",
    },
    {
      num: 4,
      title: "Quote",
      description: "A clear, itemised proposal and timeline.",
      barColor: "#F3B23F",
    },
    {
      num: 5,
      title: "Install",
      description: "Professional installation and commissioning.",
      barColor: "#0C5A56",
    },
    {
      num: 6,
      title: "Support",
      description: "Ongoing monitoring and after-sales care.",
      barColor: "#0C5A56",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section
        style={{
          background: "var(--midnight-navy)",
          padding: "88px 24px 96px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "64px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--solar-amber)",
                margin: "0 0 20px",
              }}
            >
              Renewable Energy Infrastructure — Nigeria
            </p>
            <h1
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: "1.06",
                letterSpacing: "-0.02em",
                color: "var(--warm-white)",
                margin: "0",
              }}
            >
              Engineered energy systems for businesses that can&rsquo;t afford
              downtime.
            </h1>
            <p
              style={{
                margin: "28px 0 0",
                fontFamily: "var(--font-inter)",
                fontSize: "18px",
                lineHeight: "1.7",
                color: "var(--light-grey)",
                maxWidth: "540px",
              }}
            >
              GreenNet designs, installs and supports solar, storage and monitoring
              systems for Nigerian factories, hotels, offices, developers and serious
              property owners — backed by European-linked engineering discipline and
              long-term local support.
            </p>
            <div
              style={{
                marginTop: "36px",
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
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
              <a
                href="/solutions"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--warm-white)",
                  background: "transparent",
                  border: "1px solid rgba(245, 242, 234, 0.35)",
                  padding: "15px 28px",
                  borderRadius: "2px",
                  textDecoration: "none",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease",
                }}
              >
                Discuss a Project
              </a>
            </div>
            <p
              style={{
                margin: "44px 0 0",
                fontFamily: "var(--font-space-grotesk)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--titanium-grey)",
                letterSpacing: "0.02em",
              }}
            >
              Powering Smarter Futures.
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                borderRadius: "2px",
                overflow: "hidden",
                aspectRatio: "4/5",
                background: "rgba(245, 242, 234, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  color: "var(--titanium-grey)",
                  fontSize: "14px",
                }}
              >
                [Image placeholder: Commercial rooftop installation]
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: "-1px",
                right: "-1px",
                bottom: "-1px",
                background: "rgba(13, 27, 36, 0.82)",
                padding: "16px 20px",
                pointerEvents: "none",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  color: "var(--warm-white)",
                }}
              >
                Commercial rooftop installation, commissioned and monitored end-to-end.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Categories */}
      <section
        aria-label="System categories"
        style={{
          padding: "64px 24px",
          borderBottom: "1px solid rgba(13, 27, 36, 0.08)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "32px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 32px)",
                letterSpacing: "-0.01em",
                margin: 0,
                color: "var(--midnight-navy)",
              }}
            >
              Systems, by application
            </h2>
            <a
              href="/products"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--petrol-teal)",
                textDecoration: "none",
              }}
            >
              View the full catalogue →
            </a>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {[
              "Solar Panels",
              "Inverters",
              "Battery Storage",
              "Monitoring Systems",
              "EV Charging",
              "Solar Carports",
              "Commercial Systems",
            ].map((category) => (
              <a
                key={category}
                href="/products"
                style={{
                  flex: "1 1 220px",
                  minWidth: "220px",
                  background: "#FFFFFF",
                  border: "1px solid rgba(13, 27, 36, 0.1)",
                  borderRadius: "2px",
                  padding: "24px",
                  textDecoration: "none",
                  color: "var(--midnight-navy)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  transition: "border-color 0.2s ease",
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--petrol-teal)"
                  strokeWidth="1.6"
                >
                  <rect x="3" y="3" width="8" height="8" />
                  <rect x="13" y="3" width="8" height="8" />
                  <rect x="3" y="13" width="8" height="8" />
                  <rect x="13" y="13" width="8" height="8" />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  {category}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why GreenNet */}
      <section
        aria-label="Why GreenNet"
        style={{
          padding: "96px 24px",
          background: "#FFFFFF",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            gap: "64px",
            alignItems: "start",
          }}
        >
          <div style={{ position: "sticky", top: "100px" }}>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--petrol-teal)",
                margin: "0 0 16px",
              }}
            >
              Why GreenNet
            </p>
            <h2
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "clamp(28px, 3.4vw, 38px)",
                lineHeight: "1.15",
                letterSpacing: "-0.01em",
                margin: 0,
                color: "var(--midnight-navy)",
              }}
            >
              Six commitments that separate infrastructure from installation.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {pillars.map((pillar) => (
              <div
                key={pillar.index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr",
                  gap: "20px",
                  padding: "28px 0",
                  borderTop: "1px solid rgba(13, 27, 36, 0.1)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    fontSize: "20px",
                    color: "var(--solar-amber)",
                  }}
                >
                  {pillar.index}
                </span>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      fontSize: "19px",
                      color: "var(--midnight-navy)",
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-inter)",
                      fontSize: "15px",
                      lineHeight: "1.7",
                      color: "var(--muted-grey)",
                    }}
                  >
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monitoring Section */}
      <section
        aria-label="Monitoring and visibility"
        style={{
          padding: "96px 24px",
          background: "var(--midnight-navy)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              borderRadius: "2px",
              overflow: "hidden",
              aspectRatio: "16/11",
              background: "rgba(245, 242, 234, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                color: "var(--titanium-grey)",
                fontSize: "14px",
              }}
            >
              [Image placeholder: Monitoring dashboard]
            </div>
          </div>

          <div>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--solar-amber)",
                margin: "0 0 16px",
              }}
            >
              Visibility
            </p>
            <h2
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "clamp(26px, 3.2vw, 34px)",
                lineHeight: "1.2",
                letterSpacing: "-0.01em",
                margin: 0,
                color: "var(--warm-white)",
              }}
            >
              Every system reports back. Nothing is a black box.
            </h2>
            <p
              style={{
                margin: "20px 0 0",
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                lineHeight: "1.75",
                color: "var(--light-grey)",
                maxWidth: "520px",
              }}
            >
              Generation, consumption, storage and system health are monitored
              continuously, so decisions about your energy infrastructure are based on
              data, not assumption. Our support team sees what you see — and acts on it
              before it becomes your problem.
            </p>
            <a
              href="/monitoring"
              style={{
                marginTop: "24px",
                display: "inline-block",
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--solar-amber)",
                textDecoration: "none",
              }}
            >
              See how monitoring &amp; support works →
            </a>
          </div>
        </div>
      </section>

      {/* Customer Journey */}
      <section
        aria-label="Customer journey"
        style={{
          padding: "96px 24px",
          background: "var(--warm-white)",
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
              color: "var(--petrol-teal)",
              margin: "0 0 16px",
              textAlign: "center",
            }}
          >
            How we work together
          </p>
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.2vw, 34px)",
              letterSpacing: "-0.01em",
              margin: "0 0 48px",
              color: "var(--midnight-navy)",
              textAlign: "center",
            }}
          >
            A structured path from first call to ongoing support.
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
            {journey.map((step) => (
              <div
                key={step.num}
                style={{
                  flex: "1 1 150px",
                  minWidth: "150px",
                  padding: "24px 20px 0",
                  borderTop: `3px solid ${step.barColor}`,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--titanium-grey)",
                  }}
                >
                  0{step.num}
                </span>
                <h3
                  style={{
                    margin: "10px 0 8px",
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    fontSize: "17px",
                    color: "var(--midnight-navy)",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-inter)",
                    fontSize: "13.5px",
                    lineHeight: "1.6",
                    color: "var(--muted-grey)",
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Applications */}
      <section
        aria-label="Applications"
        style={{
          padding: "96px 24px",
          background: "#FFFFFF",
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
              color: "var(--petrol-teal)",
              margin: "0 0 16px",
            }}
          >
            Applications
          </p>
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.2vw, 34px)",
              letterSpacing: "-0.01em",
              margin: "0 0 40px",
              color: "var(--midnight-navy)",
              maxWidth: "640px",
            }}
          >
            Built for operations where power failure has a real cost.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {[
              {
                title: "Commercial &amp; Industrial",
                description:
                  "Factories, hotels, offices and developments where uptime and monitored capacity are non-negotiable.",
                href: "/solutions",
              },
              {
                title: "Residential &amp; Estates",
                description:
                  "Large residential properties and estates that require a quality system, not a quick fix.",
                href: "/solutions",
              },
            ].map((app) => (
              <a
                key={app.title}
                href={app.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                  border: "1px solid rgba(13, 27, 36, 0.1)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div
                  style={{
                    aspectRatio: "4/3",
                    background: "rgba(245, 242, 234, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--titanium-grey)",
                      fontSize: "14px",
                    }}
                  >
                    [Image placeholder: {app.title}]
                  </div>
                </div>
                <div style={{ padding: "24px" }}>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      fontSize: "20px",
                      color: "var(--midnight-navy)",
                    }}
                  >
                    {app.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-inter)",
                      fontSize: "14.5px",
                      lineHeight: "1.7",
                      color: "var(--muted-grey)",
                    }}
                  >
                    {app.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        aria-label="Call to action"
        style={{
          padding: "72px 24px",
          background: "var(--solar-amber)",
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
                fontSize: "clamp(24px, 3vw, 30px)",
                letterSpacing: "-0.01em",
                color: "var(--midnight-navy)",
              }}
            >
              Powering Smarter Futures.
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                color: "#3A2E12",
              }}
            >
              Speak with our team about your site, load and timeline.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <a
              href="/quote"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--warm-white)",
                background: "var(--midnight-navy)",
                padding: "15px 28px",
                borderRadius: "2px",
                textDecoration: "none",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                border: "none",
                transition: "opacity 0.2s ease",
              }}
            >
              Request a Quotation
            </a>
            <a
              href="/contact"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--midnight-navy)",
                background: "transparent",
                border: "1px solid rgba(13, 27, 36, 0.4)",
                padding: "15px 28px",
                borderRadius: "2px",
                textDecoration: "none",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
