import { cn } from "@/lib/utils";
import type { QuotationStatus } from "@/lib/admin/quotations";

const STATUS_LABELS: Record<QuotationStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

const STATUS_STYLES: Record<QuotationStatus, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  contacted: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export function statusLabel(status: QuotationStatus): string {
  return STATUS_LABELS[status];
}

export function StatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
