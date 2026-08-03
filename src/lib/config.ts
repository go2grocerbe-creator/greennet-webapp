export type NavItem = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  shortName: string;
  legalName: string;
  tagline: string;
  description: string;
  /** Client-confirmed facts only — see docs/content-register.md "Company identity". */
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  nav: NavItem[];
};

/**
 * Only values classified CONFIRMED in docs/content-register.md live here.
 * Do not add unsupported company facts, claims, or commercial terms here.
 * Editorial route copy must stay within the approved boundaries documented in
 * docs/content-register.md and docs/requirements-register.md.
 */
export const siteConfig: SiteConfig = {
  name: "GreenNet Energy",
  shortName: "GreenNet",
  legalName: "GreenNet Energy Ltd",
  tagline: "Powering Smarter Futures.",
  description:
    "GreenNet provides solar systems, installation, monitoring, and support for dependable power infrastructure.",
  contact: {
    phone: "+234 906 312 1247",
    email: "oduwaogbeiwi@gmail.com",
    address: "No. 12 Imuentinyan Street, Off Arbico Street, Upper Sokponoba, Benin City, Nigeria",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Solar Solutions", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ],
};

/** Every confirmed Phase 1 public route is implemented and safe to expose. */
export const publicNav = siteConfig.nav;
