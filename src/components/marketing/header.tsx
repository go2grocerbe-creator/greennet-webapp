"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { publicNav } from "@/lib/config";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const handleChange = () => {
      setIsMobile(mq.matches);
    };
    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Determine current page for nav highlighting
  const getCurrentPage = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/products")) return "products";
    if (pathname.startsWith("/solutions")) return "solutions";
    if (pathname.startsWith("/projects")) return "projects";
    if (pathname.startsWith("/monitoring")) return "monitoring";
    if (pathname.startsWith("/about")) return "about";
    return "";
  };

  const currentPage = getCurrentPage();

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "var(--midnight-navy)",
        borderBottom: "1px solid rgba(245, 242, 234, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "78px",
          gap: "24px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 700,
            fontSize: "20px",
            color: "var(--warm-white)",
            textDecoration: "none",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          GreenNet{" "}
          <span style={{ color: "var(--titanium-grey)", fontWeight: 500 }}>
            Energy
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <>
            <nav
              aria-label="Primary navigation"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "30px",
                flex: 1,
                justifyContent: "center",
              }}
            >
              {publicNav.map((item) => {
                const isActive =
                  (item.href === "/" && currentPage === "home") ||
                  (item.href !== "/" && currentPage === item.href.slice(1));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive
                        ? "var(--solar-amber)"
                        : "var(--text-muted)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      paddingBottom: "4px",
                      borderBottom: isActive
                        ? "2px solid var(--solar-amber)"
                        : "2px solid transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <a
              href="/quote"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--midnight-navy)",
                background: "var(--solar-amber)",
                padding: "11px 22px",
                borderRadius: "2px",
                textDecoration: "none",
                whiteSpace: "nowrap",
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
          </>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
              style={{
                background: "transparent",
                border: "1px solid rgba(245, 242, 234, 0.3)",
                color: "var(--warm-white)",
                width: "44px",
                height: "44px",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <line x1="2" y1="5" x2="18" y2="5" />
                <line x1="2" y1="10" x2="18" y2="10" />
                <line x1="2" y1="15" x2="18" y2="15" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          style={{
            background: "var(--midnight-navy)",
            borderTop: "1px solid rgba(245, 242, 234, 0.1)",
            padding: "8px 24px 24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {publicNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                color: "var(--warm-white)",
                textDecoration: "none",
                padding: "14px 0",
                borderBottom: "1px solid rgba(245, 242, 234, 0.08)",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/quote"
            style={{
              marginTop: "16px",
              fontFamily: "var(--font-inter)",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--midnight-navy)",
              background: "var(--solar-amber)",
              padding: "14px 22px",
              borderRadius: "2px",
              textDecoration: "none",
              textAlign: "center",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Request a Quotation
          </a>
        </nav>
      )}
    </header>
  );
}
