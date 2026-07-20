import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

/**
 * Placeholder header. Layout/behavior only — no final nav styling,
 * mobile drawer, or scroll-spy yet (see legacy-demo for the reference
 * interaction pattern to reimplement, per docs/migration-strategy.md).
 */
export function Header() {
  return (
    <header className="border-border bg-background border-b">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-heading text-brand-deep-forest text-lg font-semibold">
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button render={<Link href="/contact" />} nativeButton={false} size="sm">
          Request a Quotation
        </Button>
      </Container>
    </header>
  );
}
