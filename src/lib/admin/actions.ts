"use server";

import { revalidatePath } from "next/cache";

import { getServerQuotationsDataSource } from "./quotations-data-source";
import { updateQuotationStatus } from "./quotations";

export type UpdateStatusState = { error?: string } | undefined;

export async function updateQuotationStatusAction(
  _prevState: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) {
    return { error: "Missing quotation reference." };
  }

  const ds = await getServerQuotationsDataSource();
  const result = await updateQuotationStatus(ds, id, status);

  if (result.status === "invalid") {
    return { error: "Invalid status value." };
  }
  if (result.status === "unavailable") {
    return { error: "Could not update status. Please try again." };
  }

  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin/quotations");
  revalidatePath("/admin");
  return undefined;
}
