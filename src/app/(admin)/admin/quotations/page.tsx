import { getServerQuotationsDataSource } from "@/lib/admin/quotations-data-source";
import { listQuotations } from "@/lib/admin/quotations";
import { QuotationsTable } from "@/components/admin/quotations-table";

export default async function QuotationsPage() {
  const ds = await getServerQuotationsDataSource();
  const result = await listQuotations(ds);

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Quotation requests</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Enquiries submitted through the public contact form.
      </p>
      <div className="mt-6">
        <QuotationsTable result={result} />
      </div>
    </div>
  );
}
