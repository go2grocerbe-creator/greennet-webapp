import Link from "next/link";

import { ServiceForm } from "@/components/admin/service-form";
import { createServiceAction } from "@/lib/admin/service-actions";

export default function NewServicePage() {
  return (
    <div className="p-6">
      <Link
        href="/admin/services"
        className="text-muted-foreground text-sm underline underline-offset-2"
      >
        ← Back to services
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Create service</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        New services are created as drafts — publish from the services list when ready.
      </p>
      <div className="mt-6">
        <ServiceForm action={createServiceAction} submitLabel="Create service" />
      </div>
    </div>
  );
}
