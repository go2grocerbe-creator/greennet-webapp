"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import type { AdminProfile } from "@/lib/auth/session";

type TopbarProps = {
  admin: AdminProfile;
  pageTitle: string;
  onMenuClick: () => void;
};

export function Topbar({ admin, pageTitle, onMenuClick }: TopbarProps) {
  return (
    <header className="border-border bg-background flex h-14 items-center justify-between gap-4 border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="focus-visible:ring-ring -ml-1 rounded-md p-1.5 outline-none focus-visible:ring-2 md:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <h1 className="font-heading text-base font-semibold tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground hidden items-center gap-2 text-sm sm:inline-flex">
          {admin.fullName ?? admin.id}
          <span className="bg-brand-soft-green text-brand-deep-forest rounded-full px-2 py-0.5 text-xs font-medium capitalize">
            {admin.role}
          </span>
        </span>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm" data-testid="logout-button">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
