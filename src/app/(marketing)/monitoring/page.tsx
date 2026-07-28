"use client";

/**
 * Monitoring & Support Page
 * Claude Reimagination Design - Phase 5
 * Platform features and support model stages
 */
export default function MonitoringPage() {
  const supportStages = [
    {
      num: 1,
      title: "Installation & Commissioning",
      description:
        "Professional installation, testing and formal system commissioning.",
    },
    {
      num: 2,
      title: "Monitoring",
      description: "Continuous visibility into system performance from day one.",
    },
    {
      num: 3,
      title: "Maintenance",
      description:
        "Scheduled checks and proactive attention to performance deviations.",
    },
    {
      num: 4,
      title: "Response",
      description:
        "A defined point of contact for faults, questions and system changes.",
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
            Monitoring &amp; Support
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
            A system is only as good as its visibility after installation.
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
            Every GreenNet system ships with monitoring, and every installation is
            followed by a defined support relationship &mdash; not a one-time handover.
          </p>
        </div>
      </section>

      {/* Platform Section */}
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
          <div
            style={{
              borderRadius: "2px",
              overflow: "hidden",
              aspectRatio: "4/3",
            }}
          >
            <img
              src="/images/greennet/monitoring-dashboard.png"
              alt="Monitoring dashboard showing real-time system performance"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
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
              The platform
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
              Generation, storage and consumption, in one view.
            </h2>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <li
                style={{
                  display: "flex",
                  gap: "12px",
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "var(--muted-grey)",
                }}
              >
                <span
                  style={{
                    color: "var(--solar-amber)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  &mdash;
                </span>
                Real-time generation, storage and consumption reporting
              </li>
              <li
                style={{
                  display: "flex",
                  gap: "12px",
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "var(--muted-grey)",
                }}
              >
                <span
                  style={{
                    color: "var(--solar-amber)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  &mdash;
                </span>
                Fault and performance-deviation alerting to our support team
              </li>
              <li
                style={{
                  display: "flex",
                  gap: "12px",
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "var(--muted-grey)",
                }}
              >
                <span
                  style={{
                    color: "var(--solar-amber)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  &mdash;
                </span>
                Historical reporting for maintenance and capacity-planning decisions
              </li>
              <li
                style={{
                  display: "flex",
                  gap: "12px",
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "var(--muted-grey)",
                }}
              >
                <span
                  style={{
                    color: "var(--solar-amber)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  &mdash;
                </span>
                Access for your own facilities or engineering team, alongside ours
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Support Model Section */}
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
            The support model
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
            Four stages, from commissioning onward.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1px",
              background: "rgba(13, 27, 36, 0.1)",
              border: "1px solid rgba(13, 27, 36, 0.1)",
            }}
          >
            {supportStages.map((stage) => (
              <div
                key={stage.num}
                style={{
                  background: "#FFFFFF",
                  padding: "28px 22px",
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
                  0{stage.num}
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
                  {stage.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-inter)",
                    fontSize: "13.5px",
                    lineHeight: "1.65",
                    color: "var(--muted-grey)",
                  }}
                >
                  {stage.description}
                </p>
              </div>
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
            Support that continues after commissioning.
          </h2>
          <a
            href="/contact"
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
            Talk to Support
          </a>
        </div>
      </section>
    </>
  );
}
