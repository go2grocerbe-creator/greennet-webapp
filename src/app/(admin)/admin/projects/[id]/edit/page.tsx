import Link from "next/link";
import { notFound } from "next/navigation";

import { DataUnavailableNotice } from "@/components/admin/data-state-notice";
import { ProjectForm } from "@/components/admin/project-form";
import { updateProjectAction } from "@/lib/admin/project-actions";
import { getProject } from "@/lib/admin/projects";
import { getServerProjectsDataSource } from "@/lib/admin/projects-data-source";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const ds = await getServerProjectsDataSource();
  const result = await getProject(ds, id);

  if (result.status === "unavailable") {
    return (
      <DataUnavailableNotice
        className="m-6"
        message="Project data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md."
      />
    );
  }

  if (!result.data) {
    notFound();
  }

  const project = result.data;

  return (
    <div className="p-6">
      <Link
        href="/admin/projects"
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        ← Back to projects
      </Link>
      <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight">Edit project</h1>
      <div className="border-border bg-card shadow-brand-xs mt-6 max-w-2xl rounded-xl border p-6 sm:p-8">
        <ProjectForm
          action={updateProjectAction}
          projectId={project.id}
          submitLabel="Save changes"
          defaultValues={{
            title: project.title,
            location: project.location,
            summary: project.summary,
            description: project.description,
            completionDate: project.completionDate,
            coverImage: project.coverImage,
            sortOrder: project.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
