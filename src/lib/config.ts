export type NavItem = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  legalName: string;
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
 * Everything else (services copy, about copy, project content) is
 * ASSUMPTION-grade or MISSING and must not be hardcoded — see
 * docs/requirements-register.md §5. Do not add marketing copy to this
 * file; it belongs in Supabase-backed content once the CMS exists.
 */
export const siteConfig: SiteConfig = {
  name: "GreenNet Energy",
  legalName: "GreenNet Energy Ltd",
  description: "Solar energy company based in Benin City, Nigeria.",
  contact: {
    phone: "+234 906 312 1247",
    email: "oduwaogbeiwi@gmail.com",
    address: "No. 12 Imuentinyan Street, Off Arbico Street, Upper Sokponoba, Benin City, Nigeria",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Solar Solutions", href: "/solar-solutions" },
    { label: "Products", href: "/products" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ],
};
