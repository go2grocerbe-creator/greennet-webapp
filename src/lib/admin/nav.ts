export type AdminNavItem = {
  label: string;
  href: string;
};

/**
 * Full planned admin IA. Services/Products/Projects/Site settings are
 * placeholder pages for now — see docs/decision-log.md. Order matches the
 * project's deliverable sequence.
 */
export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Quotations", href: "/admin/quotations" },
  { label: "Services", href: "/admin/services" },
  { label: "Products", href: "/admin/products" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Site settings", href: "/admin/settings" },
];

/** Longest-prefix match so nested routes (e.g. a quotation detail page) highlight their parent nav item. */
export function resolveActiveNavItem(pathname: string): AdminNavItem | undefined {
  return [...adminNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
