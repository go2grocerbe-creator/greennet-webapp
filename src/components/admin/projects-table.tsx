import Link from "next/link";

import { formatDateTime } from "@/lib/admin/format";
import { setProjectStatusAction } from "@/lib/admin/project-actions";
import type { DataResult, ProjectListItem } from "@/lib/admin/projects";

import { DataUnavailableNotice, EmptyNotice } from "./data-state-notice";
import { PublishStatusBadge } from "./publish-status-badge";
import { PublishStatusButton } from "./publish-status-button";

export function ProjectsTable({ result }: { result: DataResult<ProjectListItem[]> }) {
  if (result.status === "unavailable") {
    return (
      <DataUnavailableNotice message="Project data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md." />
    );
  }

  if (result.data.length === 0) {
    return <EmptyNotice message="No projects yet. Create the first one to get started." />;
  }

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Project name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Last updated
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((project) => (
            <tr key={project.id} className="border-border border-t">
              <td className="px-4 py-3">{project.title}</td>
              <td className="px-4 py-3">
                <PublishStatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3">{formatDateTime(project.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="focus-visible:ring-ring rounded underline underline-offset-2 outline-none focus-visible:ring-2"
                  >
                    Edit
                  </Link>
                  <PublishStatusButton
                    id={project.id}
                    currentStatus={project.status}
                    action={setProjectStatusAction}
                    testId={`project-status-toggle-${project.id}`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
