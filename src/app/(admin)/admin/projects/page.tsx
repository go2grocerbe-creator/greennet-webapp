import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProjectsTable } from "@/components/admin/projects-table";
import { listProjects } from "@/lib/admin/projects";
import { getServerProjectsDataSource } from "@/lib/admin/projects-data-source";

export default async function AdminProjectsPage() {
  const ds = await getServerProjectsDataSource();
  const result = await listProjects(ds);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the Projects page content. Only published projects will appear on the public
            site.
          </p>
        </div>
        <Button render={<Link href="/admin/projects/new" />} nativeButton={false}>
          Create project
        </Button>
      </div>
      <div className="mt-6">
        <ProjectsTable result={result} />
      </div>
    </div>
  );
}
