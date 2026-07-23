import Link from "next/link";

import { formatDateTime } from "@/lib/admin/format";
import { setServiceStatusAction } from "@/lib/admin/service-actions";
import type { DataResult, ServiceListItem } from "@/lib/admin/services";

import { DataUnavailableNotice, EmptyNotice } from "./data-state-notice";
import { PublishStatusBadge } from "./publish-status-badge";
import { PublishStatusButton } from "./publish-status-button";

export function ServicesTable({ result }: { result: DataResult<ServiceListItem[]> }) {
  if (result.status === "unavailable") {
    return (
      <DataUnavailableNotice message="Service data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md." />
    );
  }

  if (result.data.length === 0) {
    return <EmptyNotice message="No services yet. Create the first one to get started." />;
  }

  return (
    <div className="border-border bg-card shadow-brand-xs overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              Service name
            </th>
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              Status
            </th>
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              Last updated
            </th>
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((service) => (
            <tr
              key={service.id}
              className="border-border hover:bg-muted/40 border-t transition-colors"
            >
              <td className="px-4 py-3">{service.title}</td>
              <td className="px-4 py-3">
                <PublishStatusBadge status={service.status} />
              </td>
              <td className="px-4 py-3">{formatDateTime(service.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/services/${service.id}/edit`}
                    className="text-brand-primary focus-visible:ring-ring rounded font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2"
                  >
                    Edit
                  </Link>
                  <PublishStatusButton
                    id={service.id}
                    currentStatus={service.status}
                    action={setServiceStatusAction}
                    testId={`service-status-toggle-${service.id}`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
