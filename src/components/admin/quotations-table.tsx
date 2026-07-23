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
    return (
      <DataUnavailableNotice message="Quotation data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md." />
    );
  }

  if (result.data.length === 0) {
    return <EmptyNotice message="No quotation requests yet." />;
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
              Name
            </th>
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              Email
            </th>
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              Phone
            </th>
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              Interested solution
            </th>
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              Submitted
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
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((quotation) => (
            <tr
              key={quotation.id}
              className="border-border hover:bg-muted/40 border-t transition-colors"
            >
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
                  className="text-brand-primary focus-visible:ring-ring rounded font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2"
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
