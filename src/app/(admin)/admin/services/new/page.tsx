import Link from "next/link";

import { ServiceForm } from "@/components/admin/service-form";
import { createServiceAction } from "@/lib/admin/service-actions";

export default function NewServicePage() {
  return (
    <div className="p-6">
      <Link
        href="/admin/services"
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        ← Back to services
      </Link>
      <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight">Create service</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        New services are created as drafts — publish from the services list when ready.
      </p>
      <div className="border-border bg-card shadow-brand-xs mt-6 max-w-2xl rounded-xl border p-6 sm:p-8">
        <ServiceForm action={createServiceAction} submitLabel="Create service" />
      </div>
    </div>
  );
}
