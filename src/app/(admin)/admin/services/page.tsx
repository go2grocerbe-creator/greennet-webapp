import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ServicesTable } from "@/components/admin/services-table";
import { listServices } from "@/lib/admin/services";
import { getServerServicesDataSource } from "@/lib/admin/services-data-source";

export default async function AdminServicesPage() {
  const ds = await getServerServicesDataSource();
  const result = await listServices(ds);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Services</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the Solar Solutions page content. Only published services will appear on the
            public site.
          </p>
        </div>
        <Button render={<Link href="/admin/services/new" />} nativeButton={false}>
          Create service
        </Button>
      </div>
      <div className="mt-6">
        <ServicesTable result={result} />
      </div>
    </div>
  );
}
