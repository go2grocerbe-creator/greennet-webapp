"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms, applied via CSS custom property. */
  delay?: number;
  as?: "div" | "section" | "li" | "figure";
};

/**
 * Scroll-reveal primitive. New component — nothing in the codebase owned
 * viewport-driven motion before. Server HTML renders fully visible; the
 * hidden state is only "armed" client-side after mount, so no-JS visitors,
 * crawlers, and prefers-reduced-motion users always see static content
 * (the CSS gating lives in globals.css under the reduced-motion query).
 * Reimplements the legacy demo's IntersectionObserver scroll-reveal pattern
 * in React idiom, per docs/architecture.md "Component reuse strategy".
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Tag = as as React.ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.setAttribute("data-armed", "");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.setAttribute("data-visible", "");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("gn-reveal", className)}
      style={delay ? ({ "--gn-reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
