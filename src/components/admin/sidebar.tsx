import { NavList } from "./nav-list";

type SidebarProps = {
  activeHref?: string;
};

/** Always-visible desktop sidebar. Mobile uses MobileNavDrawer instead. */
export function Sidebar({ activeHref }: SidebarProps) {
  return (
    <aside className="border-border bg-sidebar hidden w-60 shrink-0 border-r md:block">
      <div className="border-border flex h-14 items-center gap-2 border-b px-6">
        <span className="bg-brand-primary size-2.5 rounded-full" aria-hidden="true" />
        <span className="font-heading text-brand-deep-forest text-sm font-bold tracking-tight">
          GreenNet Admin
        </span>
      </div>
      <NavList activeHref={activeHref} />
    </aside>
  );
}
