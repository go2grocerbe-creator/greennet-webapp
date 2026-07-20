import Link from "next/link";
import { notFound } from "next/navigation";

import { QuotationStatusForm } from "@/components/admin/quotation-status-form";
import { DataUnavailableNotice } from "@/components/admin/data-state-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDateTime } from "@/lib/admin/format";
import { getQuotation } from "@/lib/admin/quotations";
import { getServerQuotationsDataSource } from "@/lib/admin/quotations-data-source";
import {
  CONTACT_METHOD_OPTIONS,
  INTERESTED_SOLUTION_OPTIONS,
  PROJECT_TIMELINE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/lib/validation/quote-request";

function labelFor(options: readonly { value: string; label: string }[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? "—";
}

type QuotationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  const { id } = await params;
  const ds = await getServerQuotationsDataSource();
  const result = await getQuotation(ds, id);

  if (result.status === "unavailable") {
    return <DataUnavailableNotice className="m-6" />;
  }

  if (!result.data) {
    notFound();
  }

  const quotation = result.data;

  return (
    <div className="p-6">
      <Link
        href="/admin/quotations"
        className="text-muted-foreground text-sm underline underline-offset-2"
      >
        ← Back to quotation requests
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{quotation.name}</h1>
        <StatusBadge status={quotation.status} />
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        Submitted {formatDateTime(quotation.createdAt)}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section
          aria-labelledby="contact-info-heading"
          className="border-border rounded-lg border p-4"
        >
          <h2 id="contact-info-heading" className="font-medium">
            Contact information
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{quotation.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{quotation.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Company</dt>
              <dd>{quotation.companyName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd>{quotation.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Preferred contact method</dt>
              <dd>{labelFor(CONTACT_METHOD_OPTIONS, quotation.preferredContactMethod)}</dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="project-info-heading"
          className="border-border rounded-lg border p-4"
        >
          <h2 id="project-info-heading" className="font-medium">
            Project information
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Property type</dt>
              <dd>{labelFor(PROPERTY_TYPE_OPTIONS, quotation.propertyType)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Interested solution</dt>
              <dd>{labelFor(INTERESTED_SOLUTION_OPTIONS, quotation.interestedSolution)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Electricity usage / bill</dt>
              <dd>{quotation.electricityUsage ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Timeline</dt>
              <dd>{labelFor(PROJECT_TIMELINE_OPTIONS, quotation.projectTimeline)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section
        aria-labelledby="message-heading"
        className="border-border mt-6 rounded-lg border p-4"
      >
        <h2 id="message-heading" className="font-medium">
          Message
        </h2>
        <p className="mt-2 text-sm whitespace-pre-wrap">{quotation.message}</p>
      </section>

      <section
        aria-labelledby="status-heading"
        className="border-border mt-6 rounded-lg border p-4"
      >
        <h2 id="status-heading" className="font-medium">
          Status
        </h2>
        <div className="mt-3">
          <QuotationStatusForm id={quotation.id} currentStatus={quotation.status} />
        </div>
      </section>
    </div>
  );
}
