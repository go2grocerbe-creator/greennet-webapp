"use client";

import { useState } from "react";

/**
 * Claude Reimagination Products Page
 * Client-side category filtering with mock product data
 */
export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const products = [
    {
      slug: "monocrystalline-rooftop-array",
      name: "Monocrystalline Rooftop Panel Array",
      category: "Solar Panels",
      eyebrow: "High-density rooftop generation",
      shortDescription:
        "Rooftop panel arrays configured for commercial and industrial roof profiles.",
    },
    {
      slug: "ground-mount-array",
      name: "Ground-Mount Solar Array",
      category: "Solar Panels",
      eyebrow: "Utility-scale generation on available land",
      shortDescription:
        "Ground-mounted arrays for sites with available land and higher capacity needs.",
    },
    {
      slug: "three-phase-inverter",
      name: "Three-Phase Commercial Inverter",
      category: "Inverters",
      eyebrow: "Grid-tied and hybrid configurations",
      shortDescription:
        "Inverter platforms sized for three-phase commercial and industrial loads.",
    },
    {
      slug: "lithium-storage-bank",
      name: "Lithium Battery Storage Bank",
      category: "Battery Storage",
      eyebrow: "Dispatchable backup and load-shifting",
      shortDescription:
        "Battery banks for backup power, peak shaving and time-of-use load shifting.",
    },
    {
      slug: "modular-storage-cabinet",
      name: "Modular Storage Cabinet",
      category: "Battery Storage",
      eyebrow: "Scalable storage for growing sites",
      shortDescription:
        "Cabinet-based storage that scales in modules as demand grows.",
    },
    {
      slug: "remote-monitoring-platform",
      name: "Remote Monitoring Platform",
      category: "Monitoring Systems",
      eyebrow: "Real-time visibility and diagnostics",
      shortDescription:
        "Dashboard and alerting platform covering generation, storage and consumption.",
    },
    {
      slug: "ev-charging-station",
      name: "Commercial EV Charging Station",
      category: "EV Charging",
      eyebrow: "Fleet and visitor charging infrastructure",
      shortDescription:
        "Charging infrastructure for fleets, staff parking and visitor bays.",
    },
    {
      slug: "solar-carport-structure",
      name: "Solar Carport Structure",
      category: "Solar Carports",
      eyebrow: "Generation over parking infrastructure",
      shortDescription:
        "Structural carports that generate power while covering vehicle parking.",
    },
    {
      slug: "integrated-commercial-system",
      name: "Integrated Commercial Energy System",
      category: "Commercial Energy Systems",
      eyebrow: "Panels, storage and monitoring as one system",
      shortDescription:
        "A fully specified system combining generation, storage and monitoring.",
    },
  ];

  const categoryNames = [
    "Solar Panels",
    "Inverters",
    "Battery Storage",
    "Monitoring Systems",
    "EV Charging",
    "Solar Carports",
    "Commercial Energy Systems",
  ];

  const categories = ["All systems", ...categoryNames];
  const visibleProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

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
            Products &amp; Systems
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
            Engineered systems, evaluated on specification — not on price alone.
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
            Every system below is available with a documented specification, compatibility
            notes and a monitoring option. Where an approved specification is not yet
            published, the field is marked for follow-up.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section
        style={{
          padding: "40px 24px 96px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Category Tabs */}
          <div
            role="tablist"
            aria-label="Filter by category"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "40px",
              borderBottom: "1px solid rgba(13, 27, 36, 0.1)",
              paddingBottom: "24px",
            }}
          >
            {categories.map((category) => {
              const key = category === "All systems" ? "all" : category;
              const isActive = key === selectedCategory;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(key)}
                  aria-pressed={isActive}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--warm-white)" : "var(--midnight-navy)",
                    background: isActive
                      ? "var(--petrol-teal)"
                      : "var(--warm-white)",
                    border: isActive
                      ? "1px solid var(--petrol-teal)"
                      : "1px solid rgba(13, 27, 36, 0.15)",
                    padding: "10px 18px",
                    borderRadius: "2px",
                    cursor: "pointer",
                    minHeight: "44px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--petrol-teal)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor =
                        "rgba(13, 27, 36, 0.15)";
                    }
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {visibleProducts.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
              }}
            >
              {visibleProducts.map((product) => (
                <a
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid rgba(13, 27, 36, 0.1)",
                    borderRadius: "2px",
                    overflow: "hidden",
                    background: "var(--warm-white)",
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
                      [Image placeholder]
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--petrol-teal)",
                      }}
                    >
                      {product.category}
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-space-grotesk)",
                        fontWeight: 700,
                        fontSize: "18px",
                        color: "var(--midnight-navy)",
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-inter)",
                        fontSize: "13.5px",
                        color: "var(--muted-grey)",
                      }}
                    >
                      {product.eyebrow}
                    </p>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontFamily: "var(--font-inter)",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "var(--muted-grey)",
                        flex: 1,
                      }}
                    >
                      {product.shortDescription}
                    </p>
                    <span
                      style={{
                        marginTop: "10px",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "var(--petrol-teal)",
                      }}
                    >
                      View system →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                color: "var(--muted-grey)",
                padding: "48px 0",
                textAlign: "center",
              }}
            >
              No systems in this category yet — contact us to discuss a custom
              configuration.
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
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
              Not sure which system fits your site?
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                color: "#CFE3E0",
              }}
            >
              Tell us about your property and load, and we&rsquo;ll recommend a configuration.
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
