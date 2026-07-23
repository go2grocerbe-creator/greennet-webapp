import type { DataResult, QuotationSummary } from "@/lib/admin/quotations";

import { DataUnavailableNotice } from "./data-state-notice";

export function QuotationSummaryCards({ result }: { result: DataResult<QuotationSummary> }) {
  if (result.status === "unavailable") {
    return (
      <DataUnavailableNotice message="Quotation data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md." />
    );
  }

  const cards = [
    { label: "Total quotations", value: result.data.total, accent: "text-foreground" },
    { label: "New", value: result.data.new, accent: "text-blue-700 dark:text-blue-300" },
    {
      label: "Contacted",
      value: result.data.contacted,
      accent: "text-amber-700 dark:text-amber-300",
    },
    { label: "Closed", value: result.data.closed, accent: "text-brand-primary" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="border-border bg-card shadow-brand-xs rounded-xl border p-5"
        >
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {card.label}
          </p>
          <p className={`font-heading mt-2 text-3xl font-semibold tracking-tight ${card.accent}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
