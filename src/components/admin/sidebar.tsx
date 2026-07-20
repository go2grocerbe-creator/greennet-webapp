import { NavList } from "./nav-list";

type SidebarProps = {
  activeHref?: string;
};

/** Always-visible desktop sidebar. Mobile uses MobileNavDrawer instead. */
export function Sidebar({ activeHref }: SidebarProps) {
  return (
    <aside className="border-border bg-background hidden w-56 shrink-0 border-r md:block">
      <NavList activeHref={activeHref} />
    </aside>
  );
}
