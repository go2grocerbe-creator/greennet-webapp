import Link from "next/link";

import { ProjectForm } from "@/components/admin/project-form";
import { createProjectAction } from "@/lib/admin/project-actions";

export default function NewProjectPage() {
  return (
    <div className="p-6">
      <Link
        href="/admin/projects"
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        ← Back to projects
      </Link>
      <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight">Create project</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        New projects are created as drafts — publish from the projects list when ready.
      </p>
      <div className="border-border bg-card shadow-brand-xs mt-6 max-w-2xl rounded-xl border p-6 sm:p-8">
        <ProjectForm action={createProjectAction} submitLabel="Create project" />
      </div>
    </div>
  );
}
