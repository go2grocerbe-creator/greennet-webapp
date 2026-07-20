import Link from "next/link";
import { notFound } from "next/navigation";

import { DataUnavailableNotice } from "@/components/admin/data-state-notice";
import { ServiceForm } from "@/components/admin/service-form";
import { updateServiceAction } from "@/lib/admin/service-actions";
import { getService } from "@/lib/admin/services";
import { getServerServicesDataSource } from "@/lib/admin/services-data-source";

type EditServicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const ds = await getServerServicesDataSource();
  const result = await getService(ds, id);

  if (result.status === "unavailable") {
    return (
      <DataUnavailableNotice
        className="m-6"
        message="Service data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md."
      />
    );
  }

  if (!result.data) {
    notFound();
  }

  const service = result.data;

  return (
    <div className="p-6">
      <Link
        href="/admin/services"
        className="text-muted-foreground text-sm underline underline-offset-2"
      >
        ← Back to services
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Edit service</h1>
      <div className="mt-6">
        <ServiceForm
          action={updateServiceAction}
          serviceId={service.id}
          submitLabel="Save changes"
          defaultValues={{
            title: service.title,
            summary: service.summary,
            body: service.body,
            icon: service.icon,
            sortOrder: service.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
