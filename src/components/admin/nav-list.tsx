"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { adminNavItems } from "@/lib/admin/nav";

type NavListProps = {
  activeHref?: string;
  onNavigate?: () => void;
};

export function NavList({ activeHref, onNavigate }: NavListProps) {
  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-1 p-4">
      {adminNavItems.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
