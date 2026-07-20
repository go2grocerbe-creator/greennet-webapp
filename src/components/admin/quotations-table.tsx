import Link from "next/link";

import { formatDateTime } from "@/lib/admin/format";
import type { DataResult, QuotationListItem } from "@/lib/admin/quotations";
import { INTERESTED_SOLUTION_OPTIONS } from "@/lib/validation/quote-request";

import { DataUnavailableNotice, EmptyNotice } from "./data-state-notice";
import { StatusBadge } from "./status-badge";

function interestedSolutionLabel(value: string | null): string {
  return INTERESTED_SOLUTION_OPTIONS.find((option) => option.value === value)?.label ?? "—";
}

export function QuotationsTable({ result }: { result: DataResult<QuotationListItem[]> }) {
  if (result.status === "unavailable") {
    return <DataUnavailableNotice />;
  }

  if (result.data.length === 0) {
    return <EmptyNotice message="No quotation requests yet." />;
  }

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Email
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Phone
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Interested solution
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Submitted
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((quotation) => (
            <tr key={quotation.id} className="border-border border-t">
              <td className="px-4 py-3">{quotation.name}</td>
              <td className="px-4 py-3">{quotation.email}</td>
              <td className="px-4 py-3">{quotation.phone ?? "—"}</td>
              <td className="px-4 py-3">{interestedSolutionLabel(quotation.interestedSolution)}</td>
              <td className="px-4 py-3">{formatDateTime(quotation.createdAt)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={quotation.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/quotations/${quotation.id}`}
                  className="focus-visible:ring-ring rounded underline underline-offset-2 outline-none focus-visible:ring-2"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
