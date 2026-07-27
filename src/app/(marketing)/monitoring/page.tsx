"use client";

import Link from "next/link";

/**
 * Monitoring & Support Page
 * Placeholder for Phase 5 implementation
 */
export default function MonitoringPage() {
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
            Continuous visibility and support.
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
            Real-time monitoring dashboard and ongoing technical support.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ padding: "96px 24px", background: "var(--warm-white)" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
            color: "var(--muted-grey)",
            fontFamily: "var(--font-inter)",
          }}
        >
          <p>Monitoring page implementation coming in Phase 5.</p>
          <p style={{ marginTop: "24px" }}>
            <Link
              href="/"
              style={{
                color: "var(--petrol-teal)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
