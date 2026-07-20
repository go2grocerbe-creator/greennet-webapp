import type { DataResult, QuotationSummary } from "@/lib/admin/quotations";

import { DataUnavailableNotice } from "./data-state-notice";

export function QuotationSummaryCards({ result }: { result: DataResult<QuotationSummary> }) {
  if (result.status === "unavailable") {
    return <DataUnavailableNotice />;
  }

  const cards = [
    { label: "Total quotations", value: result.data.total },
    { label: "New", value: result.data.new },
    { label: "Contacted", value: result.data.contacted },
    { label: "Closed", value: result.data.closed },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="border-border rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
