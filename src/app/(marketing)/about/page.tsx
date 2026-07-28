"use client";

/**
 * About Page
 * Claude Reimagination Design - Phase 5
 * Company narrative, positioning, and core values
 * All facts sourced from Brand Book only - no fabricated claims
 */
export default function AboutPage() {
  const focusValues = [
    "Quality",
    "Performance",
    "Visibility",
    "Support",
    "Progress",
    "Trust",
  ];

  const disciplines = [
    {
      title: "Engineering discipline",
      description:
        "Specification, sizing and installation practices informed by European engineering standards, applied consistently on every site.",
    },
    {
      title: "Local market understanding",
      description:
        "Systems designed around real Nigerian grid conditions, site constraints and operating environments — not adapted from a different market.",
    },
    {
      title: "Long-term accountability",
      description:
        "Monitoring and support continue after commissioning — we remain accountable for how a system performs over time.",
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
            About GreenNet
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
            A renewable-energy infrastructure partner, built for how Nigerian businesses
            actually operate.
          </h1>
        </div>
      </section>

      {/* Positioning Section */}
      <section
        style={{
          padding: "80px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "56px",
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
                color: "var(--petrol-teal)",
                margin: "0 0 16px",
              }}
            >
              Positioning
            </p>
            <h2
              style={{
                margin: "0 0 20px",
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 30px)",
                lineHeight: "1.25",
                letterSpacing: "-0.01em",
                color: "var(--midnight-navy)",
              }}
            >
              We work with businesses and property owners who need a quality system,
              professional installation and support that continues after commissioning
              &mdash; not a low-cost transaction.
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                lineHeight: "1.75",
                color: "var(--muted-grey)",
              }}
            >
              GreenNet Energy designs, installs and supports solar, storage and
              monitoring systems for commercial, industrial and premium residential
              properties across Nigeria, combining European-linked engineering discipline
              with a practical understanding of the Nigerian market.
            </p>
          </div>
          <div
            style={{
              borderRadius: "2px",
              overflow: "hidden",
              aspectRatio: "4/3",
            }}
          >
            <img
              src="/images/greennet/engineers-onsite-review.png"
              alt="Technical team conducting on-site system review and assessment"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section
        style={{
          padding: "80px 24px",
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
            How we work
          </p>
          <h2
            style={{
              margin: "0 0 40px",
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 30px)",
              letterSpacing: "-0.01em",
              color: "var(--midnight-navy)",
              maxWidth: "640px",
            }}
          >
            Three disciplines that shape every project.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "32px",
            }}
          >
            {disciplines.map((discipline, idx) => (
              <div
                key={idx}
                style={{
                  borderTop: "3px solid var(--petrol-teal)",
                  paddingTop: "20px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px",
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "var(--midnight-navy)",
                  }}
                >
                  {discipline.title}
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
                  {discipline.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Focus Values Section */}
      <section
        style={{
          padding: "80px 24px",
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
            What we focus on
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {focusValues.map((value, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--midnight-navy)",
                  background: "#FFFFFF",
                  border: "1px solid rgba(13, 27, 36, 0.1)",
                  borderRadius: "2px",
                  padding: "16px 18px",
                  textAlign: "center",
                }}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        style={{
          padding: "64px 24px",
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
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "clamp(22px, 3vw, 28px)",
              letterSpacing: "-0.01em",
              color: "var(--midnight-navy)",
            }}
          >
            Powering Smarter Futures.
          </h2>
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
