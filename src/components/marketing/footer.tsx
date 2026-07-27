import Link from "next/link";

import { siteConfig } from "@/lib/config";

export function Footer() {
  const navLinks = [
    { label: "About GreenNet", href: "/about" },
    { label: "Projects &amp; Capabilities", href: "/projects" },
    { label: "Monitoring &amp; Support", href: "/monitoring" },
    { label: "Contact", href: "/contact" },
  ];

  const systemLinks = [
    { label: "All systems", href: "/products" },
    { label: "Commercial &amp; industrial", href: "/solutions" },
    { label: "Residential &amp; estates", href: "/solutions" },
    { label: "Request a quotation", href: "/quote" },
  ];

  return (
    <footer
      style={{
        background: "var(--midnight-navy)",
        borderTop: "1px solid rgba(245, 242, 234, 0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "64px 24px 32px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          gap: "40px",
        }}
      >
        {/* Company Info */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "19px",
              color: "var(--warm-white)",
            }}
          >
            GreenNet{" "}
            <span style={{ color: "var(--titanium-grey)", fontWeight: 500 }}>
              Energy
            </span>
          </div>
          <p
            style={{
              marginTop: "16px",
              fontFamily: "var(--font-inter)",
              fontSize: "14px",
              lineHeight: "1.7",
              color: "var(--light-grey)",
              maxWidth: "320px",
            }}
          >
            Premium renewable-energy infrastructure for Nigerian businesses and
            property owners — quality systems, professional installation and
            long-term support.
          </p>
          <p
            style={{
              marginTop: "20px",
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--solar-amber)",
              letterSpacing: "0.01em",
            }}
          >
            Powering Smarter Futures.
          </p>
        </div>

        {/* Company Navigation */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--titanium-grey)",
              marginBottom: "16px",
            }}
          >
            Company
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Systems Navigation */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--titanium-grey)",
              marginBottom: "16px",
            }}
          >
            Systems
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {systemLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--titanium-grey)",
              marginBottom: "16px",
            }}
          >
            Get in touch
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <li
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              [Phone number pending approval]
            </li>
            <li
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              [Email address pending approval]
            </li>
            <li
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              Lagos, Nigeria
            </li>
          </ul>
        </div>
      </div>

      {/* Legal Row */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "24px 24px 32px",
          borderTop: "1px solid rgba(245, 242, 234, 0.08)",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "12.5px",
            color: "var(--titanium-grey)",
            margin: 0,
          }}
        >
          &copy; {new Date().getFullYear()} {siteConfig.legalName}. All rights
          reserved.
        </p>
        <nav
          aria-label="Legal"
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          <a
            href="#"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "12.5px",
              color: "var(--titanium-grey)",
              textDecoration: "none",
              transition: "color 0.2s ease",
              cursor: "pointer",
            }}
          >
            Privacy Policy
          </a>
          <a
            href="#"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "12.5px",
              color: "var(--titanium-grey)",
              textDecoration: "none",
              transition: "color 0.2s ease",
              cursor: "pointer",
            }}
          >
            Terms of Service
          </a>
        </nav>
      </div>
    </footer>
  );
}
