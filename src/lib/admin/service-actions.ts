"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getServerServicesDataSource } from "./services-data-source";
import { createService, setServiceStatus, updateService } from "./services";

export type ServiceFormState =
  { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

function readServiceFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    body: String(formData.get("body") ?? ""),
    icon: String(formData.get("icon") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
  };
}

export async function createServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const ds = await getServerServicesDataSource();
  const result = await createService(ds, readServiceFormData(formData));

  if (result.status === "invalid") {
    return { fieldErrors: result.fieldErrors };
  }
  if (result.status === "unavailable") {
    return { error: "Could not create the service. Please try again." };
  }

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function updateServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing service reference." };

  const ds = await getServerServicesDataSource();
  const result = await updateService(ds, id, readServiceFormData(formData));

  if (result.status === "invalid") {
    return { fieldErrors: result.fieldErrors };
  }
  if (result.status === "unavailable") {
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}/edit`);
  redirect("/admin/services");
}

export type UpdateStatusState = { error?: string } | undefined;

export async function setServiceStatusAction(
  _prevState: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) return { error: "Missing service reference." };

  const ds = await getServerServicesDataSource();
  const result = await setServiceStatus(ds, id, status);

  if (result.status === "invalid") {
    return { error: "Invalid status value." };
  }
  if (result.status === "unavailable") {
    return { error: "Could not update status. Please try again." };
  }

  revalidatePath("/admin/services");
  return undefined;
}
