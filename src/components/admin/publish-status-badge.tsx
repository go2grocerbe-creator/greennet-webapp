import { cn } from "@/lib/utils";

export type PublishStatus = "draft" | "published";

const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: "Draft",
  published: "Published",
};

const STATUS_STYLES: Record<PublishStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

/**
 * Shared by services/products/projects — all three use the exact same
 * two-state draft/published model (see docs/decision-log.md ADR-013).
 * `quote_requests`' new/contacted/closed status has different semantics
 * and keeps its own `StatusBadge` (src/components/admin/status-badge.tsx).
 */
export function PublishStatusBadge({ status }: { status: PublishStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
