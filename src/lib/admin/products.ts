import { productInputSchema } from "@/lib/validation/product";

import type { DataResult } from "./data-result";
import { slugify, slugifyWithSuffix } from "./slug";
import type { ProductsDataSource, ProductStatus, RawProductRow } from "./products-data-source";

export type { DataResult } from "./data-result";
export type { ProductStatus } from "./products-data-source";

export const PRODUCT_STATUSES: ProductStatus[] = ["draft", "published"];

export type ProductListItem = {
  id: string;
  title: string;
  status: ProductStatus;
  updatedAt: string;
};

export type ProductDetail = ProductListItem & {
  slug: string;
  summary: string;
  description: string;
  image: string | null;
  sortOrder: number;
};

export function mapProductListItem(row: RawProductRow): ProductListItem {
  return {
    id: row.id,
    title: row.name,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export function mapProductDetail(row: RawProductRow): ProductDetail {
  return {
    ...mapProductListItem(row),
    slug: row.slug,
    summary: row.summary ?? "",
    description: row.description ?? "",
    image: row.image_url,
    sortOrder: row.sort_order,
  };
}

export async function listProducts(
  ds: ProductsDataSource | null,
): Promise<DataResult<ProductListItem[]>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.list();
    if (error || !data) return { status: "unavailable" };
    return { status: "ok", data: data.map(mapProductListItem) };
  } catch (error) {
    console.error("[admin] failed to list products", error);
    return { status: "unavailable" };
  }
}

/**
 * Same underlying `ds.list()` call as `listProducts` (RLS already scopes
 * it to published-only for an anonymous caller) — just mapped to the
 * fuller detail shape the public page needs instead of the admin table's
 * slim list-item shape. Not a duplicate query — see docs/decision-log.md
 * ADR-013.
 */
export async function listProductsForPublic(
  ds: ProductsDataSource | null,
): Promise<DataResult<ProductDetail[]>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.list();
    if (error || !data) return { status: "unavailable" };
    return { status: "ok", data: data.map(mapProductDetail) };
  } catch (error) {
    console.error("[admin] failed to list products for public page", error);
    return { status: "unavailable" };
  }
}

export async function getProduct(
  ds: ProductsDataSource | null,
  id: string,
): Promise<DataResult<ProductDetail | null>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.getById(id);
    if (error) return { status: "unavailable" };
    return { status: "ok", data: data ? mapProductDetail(data) : null };
  } catch (error) {
    console.error("[admin] failed to load product", error);
    return { status: "unavailable" };
  }
}

export type MutationResult =
  | { status: "ok"; id: string }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "unavailable" };

const UNIQUE_VIOLATION = "23505";

export async function createProduct(
  ds: ProductsDataSource | null,
  raw: unknown,
): Promise<MutationResult> {
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (!ds) return { status: "unavailable" };

  const values = parsed.data;
  const row = {
    slug: slugify(values.title),
    name: values.title,
    summary: values.summary,
    description: values.description,
    image_url: values.image ?? null,
    sort_order: values.sortOrder ?? 0,
  };

  try {
    let { data, error } = await ds.create(row);

    if (error?.code === UNIQUE_VIOLATION) {
      ({ data, error } = await ds.create({ ...row, slug: slugifyWithSuffix(values.title) }));
    }

    if (error || !data) return { status: "unavailable" };
    return { status: "ok", id: data.id };
  } catch (error) {
    console.error("[admin] failed to create product", error);
    return { status: "unavailable" };
  }
}

/** Editing never changes the slug once a product exists — see services.ts for the same rule. */
export async function updateProduct(
  ds: ProductsDataSource | null,
  id: string,
  raw: unknown,
): Promise<MutationResult> {
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (!id || !ds) return { status: "unavailable" };

  const values = parsed.data;
  try {
    const { data, error } = await ds.update(id, {
      name: values.title,
      summary: values.summary,
      description: values.description,
      image_url: values.image ?? null,
      sort_order: values.sortOrder ?? 0,
    });

    if (error || !data) return { status: "unavailable" };
    return { status: "ok", id: data.id };
  } catch (error) {
    console.error("[admin] failed to update product", error);
    return { status: "unavailable" };
  }
}

export function isValidProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as string[]).includes(value);
}

export type StatusMutationResult =
  { status: "ok" } | { status: "invalid" } | { status: "unavailable" };

export async function setProductStatus(
  ds: ProductsDataSource | null,
  id: string,
  status: string,
): Promise<StatusMutationResult> {
  if (!isValidProductStatus(status)) return { status: "invalid" };
  if (!id || !ds) return { status: "unavailable" };

  try {
    const { error } = await ds.setStatus(id, status);
    if (error) return { status: "unavailable" };
    return { status: "ok" };
  } catch (error) {
    console.error("[admin] failed to update product status", error);
    return { status: "unavailable" };
  }
}
