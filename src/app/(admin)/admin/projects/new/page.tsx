import Link from "next/link";

import { ProjectForm } from "@/components/admin/project-form";
import { createProjectAction } from "@/lib/admin/project-actions";

export default function NewProjectPage() {
  return (
    <div className="p-6">
      <Link
        href="/admin/projects"
        className="text-muted-foreground text-sm underline underline-offset-2"
      >
        ← Back to projects
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Create project</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        New projects are created as drafts — publish from the projects list when ready.
      </p>
      <div className="mt-6">
        <ProjectForm action={createProjectAction} submitLabel="Create project" />
      </div>
    </div>
  );
}
