"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { NavList } from "./nav-list";

type MobileNavDrawerProps = {
  open: boolean;
  activeHref?: string;
  onClose: () => void;
};

export function MobileNavDrawer({ open, activeHref, onClose }: MobileNavDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className="bg-background fixed inset-y-0 left-0 w-64 shadow-lg"
      >
        <div className="border-border flex items-center justify-between border-b p-4">
          <span className="font-heading text-sm font-semibold">GreenNet Admin</span>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="focus-visible:ring-ring rounded-md p-1 outline-none focus-visible:ring-2"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <NavList activeHref={activeHref} onNavigate={onClose} />
      </div>
    </div>
  );
}
