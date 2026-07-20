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
        className="text-muted-foreground text-sm underline underline-offset-2"
      >
        ← Back to projects
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Edit project</h1>
      <div className="mt-6">
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
