"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getServerProjectsDataSource } from "./projects-data-source";
import { createProject, setProjectStatus, updateProject } from "./projects";

export type ProjectFormState =
  { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

function readProjectFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    location: String(formData.get("location") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    completionDate: String(formData.get("completionDate") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
  };
}

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const ds = await getServerProjectsDataSource();
  const result = await createProject(ds, readProjectFormData(formData));

  if (result.status === "invalid") {
    return { fieldErrors: result.fieldErrors };
  }
  if (result.status === "unavailable") {
    return { error: "Could not create the project. Please try again." };
  }

  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function updateProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing project reference." };

  const ds = await getServerProjectsDataSource();
  const result = await updateProject(ds, id, readProjectFormData(formData));

  if (result.status === "invalid") {
    return { fieldErrors: result.fieldErrors };
  }
  if (result.status === "unavailable") {
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}/edit`);
  redirect("/admin/projects");
}

export type UpdateStatusState = { error?: string } | undefined;

export async function setProjectStatusAction(
  _prevState: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) return { error: "Missing project reference." };

  const ds = await getServerProjectsDataSource();
  const result = await setProjectStatus(ds, id, status);

  if (result.status === "invalid") {
    return { error: "Invalid status value." };
  }
  if (result.status === "unavailable") {
    return { error: "Could not update status. Please try again." };
  }

  revalidatePath("/admin/projects");
  return undefined;
}
