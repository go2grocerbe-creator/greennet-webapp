import { cn } from "@/lib/utils";
import type { ServiceStatus } from "@/lib/admin/services";

const STATUS_LABELS: Record<ServiceStatus, string> = {
  draft: "Draft",
  published: "Published",
};

const STATUS_STYLES: Record<ServiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
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
