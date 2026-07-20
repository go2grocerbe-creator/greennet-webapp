import Link from "next/link";

import { formatDateTime } from "@/lib/admin/format";
import type { DataResult, ServiceListItem } from "@/lib/admin/services";

import { DataUnavailableNotice, EmptyNotice } from "./data-state-notice";
import { ServiceStatusBadge } from "./service-status-badge";
import { ServiceStatusButton } from "./service-status-button";

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
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Service name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Last updated
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((service) => (
            <tr key={service.id} className="border-border border-t">
              <td className="px-4 py-3">{service.title}</td>
              <td className="px-4 py-3">
                <ServiceStatusBadge status={service.status} />
              </td>
              <td className="px-4 py-3">{formatDateTime(service.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/services/${service.id}/edit`}
                    className="focus-visible:ring-ring rounded underline underline-offset-2 outline-none focus-visible:ring-2"
                  >
                    Edit
                  </Link>
                  <ServiceStatusButton id={service.id} currentStatus={service.status} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
