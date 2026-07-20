import { getServerQuotationsDataSource } from "@/lib/admin/quotations-data-source";
import { getQuotationSummary } from "@/lib/admin/quotations";
import { QuotationSummaryCards } from "@/components/admin/quotation-summary-cards";

export default async function AdminDashboardPage() {
  const ds = await getServerQuotationsDataSource();
  const summary = await getQuotationSummary(ds);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-1 text-sm">Overview of quotation requests.</p>
      <div className="mt-6">
        <QuotationSummaryCards result={summary} />
      </div>
    </div>
  );
}
