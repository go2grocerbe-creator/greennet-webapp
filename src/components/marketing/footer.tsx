import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { publicNav, siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="public-footer">
      <Container>
        <div className="public-footer__masthead">
          <p>GreenNet</p>
          <span>ENERGY / BENIN CITY</span>
        </div>
        <div className="public-footer__grid">
          <div className="public-footer__statement">
            <span className="public-footer__sun" aria-hidden="true" />
            <p>Powering Homes &amp; Businesses with Clean Solar Energy.</p>
          </div>
          <nav aria-label="Footer navigation" className="public-footer__nav">
            <p>Explore</p>
            {publicNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <address className="public-footer__contact">
            <p>Contact</p>
            <span>{siteConfig.contact.address}</span>
            <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}>
              {siteConfig.contact.phone}
            </a>
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
          </address>
        </div>
        <div className="public-footer__legal">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.legalName}
          </p>
          <p>Harness the Power of the Sun Today</p>
        </div>
      </Container>
    </footer>
  );
}
