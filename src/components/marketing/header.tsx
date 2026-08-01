import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { publicNav, siteConfig } from "@/lib/config";

export function Header() {
  return (
    <header className="public-header">
      <Container className="public-header__inner">
        <Link href="/" className="public-wordmark" aria-label={`${siteConfig.name} home`}>
          <span className="public-wordmark__sun" aria-hidden="true" />
          <span>{siteConfig.shortName}</span>
        </Link>

        <nav className="public-desktop-nav" aria-label="Main navigation">
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="public-header__actions">
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            size="lg"
            className="public-quote-link"
          >
            <span className="public-quote-link__long">Request a quotation</span>
            <span className="public-quote-link__short">Enquire</span>
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>

          <details className="public-mobile-menu">
            <summary>
              <span>Menu</span>
              <i aria-hidden="true" />
            </summary>
            <div className="public-mobile-menu__panel">
              <p>Navigate</p>
              <nav aria-label="Mobile navigation">
                {publicNav.map((item, index) => (
                  <Link key={item.href} href={item.href}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
