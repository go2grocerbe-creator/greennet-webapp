import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config";

/** Placeholder footer — final layout/columns pending content decisions. */
export function Footer() {
  return (
    <footer className="border-border bg-brand-cream border-t">
      <Container className="text-muted-foreground flex flex-col gap-2 py-10 text-sm">
        <p className="text-foreground font-medium">{siteConfig.legalName}</p>
        <p>{siteConfig.contact.address}</p>
        <p>
          {siteConfig.contact.phone} · {siteConfig.contact.email}
        </p>
        <p className="mt-4 text-xs">
          &copy; {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
