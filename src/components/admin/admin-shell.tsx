"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { resolveActiveNavItem } from "@/lib/admin/nav";
import type { AdminProfile } from "@/lib/auth/session";

import { MobileNavDrawer } from "./mobile-nav-drawer";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AdminShellProps = {
  admin: AdminProfile;
  children: React.ReactNode;
};

export function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = resolveActiveNavItem(pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar activeHref={activeItem?.href} />
      <MobileNavDrawer
        open={mobileNavOpen}
        activeHref={activeItem?.href}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex flex-1 flex-col">
        <Topbar
          admin={admin}
          pageTitle={activeItem?.label ?? "Dashboard"}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="bg-muted/30 flex-1">{children}</main>
      </div>
    </div>
  );
}
