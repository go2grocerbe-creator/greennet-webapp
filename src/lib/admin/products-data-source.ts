import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_rethrow } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ProductStatus = "draft" | "published";

export type RawProductRow = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

export type ProductWriteRow = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  image_url: string | null;
  sort_order: number;
};

type DbError = { code?: string; message: string } | null;

/** Same shape as src/lib/admin/services-data-source.ts — see that file for the rationale. */
export type ProductsDataSource = {
  list(): Promise<{ data: RawProductRow[] | null; error: DbError }>;
  getById(id: string): Promise<{ data: RawProductRow | null; error: DbError }>;
  create(row: ProductWriteRow): Promise<{ data: RawProductRow | null; error: DbError }>;
  update(
    id: string,
    row: Partial<ProductWriteRow>,
  ): Promise<{ data: RawProductRow | null; error: DbError }>;
  setStatus(id: string, status: ProductStatus): Promise<{ error: DbError }>;
};

const SELECT_COLUMNS =
  "id, slug, name, summary, description, image_url, sort_order, status, created_at, updated_at";

/**
 * Reads and writes happen through the session-bound Supabase client —
 * RLS (`products_editor_owner_all` / `products_public_read_published`)
 * is what actually authorizes access, per docs/security-model.md. The
 * same `list()` call serves both the admin table (all statuses, via the
 * editor/owner policy) and the public products page (published-only, via
 * the anon policy) — see docs/decision-log.md ADR-013.
 */
export function createSupabaseProductsDataSource(supabase: SupabaseClient): ProductsDataSource {
  return {
    async list() {
      const { data, error } = await supabase
        .from("products")
        .select(SELECT_COLUMNS)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      return { data: data as RawProductRow[] | null, error };
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from("products")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      return { data: data as RawProductRow | null, error };
    },
    async create(row: ProductWriteRow) {
      const { data, error } = await supabase
        .from("products")
        .insert(row)
        .select(SELECT_COLUMNS)
        .single();
      return { data: data as RawProductRow | null, error };
    },
    async update(id: string, row: Partial<ProductWriteRow>) {
      const { data, error } = await supabase
        .from("products")
        .update(row)
        .eq("id", id)
        .select(SELECT_COLUMNS)
        .single();
      return { data: data as RawProductRow | null, error };
    },
    async setStatus(id: string, status: ProductStatus) {
      const { error } = await supabase.from("products").update({ status }).eq("id", id);
      return { error };
    },
  };
}

/** Fail-closed factory — see src/lib/admin/quotations-data-source.ts for the same pattern. */
export async function getServerProductsDataSource(): Promise<ProductsDataSource | null> {
  try {
    const supabase = await createClient();
    return createSupabaseProductsDataSource(supabase);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[admin] failed to create products data source", error);
    return null;
  }
}
