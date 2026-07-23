"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getServerProductsDataSource } from "./products-data-source";
import { createProduct, setProductStatus, updateProduct } from "./products";

export type ProductFormState =
  { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

function readProductFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    image: String(formData.get("image") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
  };
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const ds = await getServerProductsDataSource();
  const result = await createProduct(ds, readProductFormData(formData));

  if (result.status === "invalid") {
    return { fieldErrors: result.fieldErrors };
  }
  if (result.status === "unavailable") {
    return { error: "Could not create the product. Please try again." };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product reference." };

  const ds = await getServerProductsDataSource();
  const result = await updateProduct(ds, id, readProductFormData(formData));

  if (result.status === "invalid") {
    return { fieldErrors: result.fieldErrors };
  }
  if (result.status === "unavailable") {
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  redirect("/admin/products");
}

export type UpdateStatusState = { error?: string } | undefined;

export async function setProductStatusAction(
  _prevState: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) return { error: "Missing product reference." };

  const ds = await getServerProductsDataSource();
  const result = await setProductStatus(ds, id, status);

  if (result.status === "invalid") {
    return { error: "Invalid status value." };
  }
  if (result.status === "unavailable") {
    return { error: "Could not update status. Please try again." };
  }

  revalidatePath("/admin/products");
  return undefined;
}
