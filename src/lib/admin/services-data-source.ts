import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_rethrow } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ServiceStatus = "draft" | "published";

export type RawServiceRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  icon: string | null;
  sort_order: number;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
};

export type ServiceWriteRow = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: string | null;
  sort_order: number;
};

type DbError = { code?: string; message: string } | null;

/**
 * Small purpose-built read/write surface, not the raw Supabase client —
 * same pattern as src/lib/admin/quotations-data-source.ts, for the same
 * reasons (testability, avoiding TS's instantiation-depth limit on the
 * real client's generics).
 */
export type ServicesDataSource = {
  list(): Promise<{ data: RawServiceRow[] | null; error: DbError }>;
  getById(id: string): Promise<{ data: RawServiceRow | null; error: DbError }>;
  create(row: ServiceWriteRow): Promise<{ data: RawServiceRow | null; error: DbError }>;
  update(
    id: string,
    row: Partial<ServiceWriteRow>,
  ): Promise<{ data: RawServiceRow | null; error: DbError }>;
  setStatus(id: string, status: ServiceStatus): Promise<{ error: DbError }>;
};

const SELECT_COLUMNS =
  "id, slug, title, summary, body, icon, sort_order, status, created_at, updated_at";

/**
 * Reads and writes happen through the session-bound Supabase client (see
 * src/lib/supabase/server.ts) — never the service role — so RLS
 * (`services_editor_owner_all`) is what actually authorizes these
 * mutations, per docs/security-model.md.
 */
export function createSupabaseServicesDataSource(supabase: SupabaseClient): ServicesDataSource {
  return {
    async list() {
      const { data, error } = await supabase
        .from("services")
        .select(SELECT_COLUMNS)
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });
      return { data: data as RawServiceRow[] | null, error };
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from("services")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      return { data: data as RawServiceRow | null, error };
    },
    async create(row: ServiceWriteRow) {
      const { data, error } = await supabase
        .from("services")
        .insert(row)
        .select(SELECT_COLUMNS)
        .single();
      return { data: data as RawServiceRow | null, error };
    },
    async update(id: string, row: Partial<ServiceWriteRow>) {
      const { data, error } = await supabase
        .from("services")
        .update(row)
        .eq("id", id)
        .select(SELECT_COLUMNS)
        .single();
      return { data: data as RawServiceRow | null, error };
    },
    async setStatus(id: string, status: ServiceStatus) {
      const { error } = await supabase.from("services").update({ status }).eq("id", id);
      return { error };
    },
  };
}

/** Fail-closed factory — see src/lib/admin/quotations-data-source.ts for the same pattern. */
export async function getServerServicesDataSource(): Promise<ServicesDataSource | null> {
  try {
    const supabase = await createClient();
    return createSupabaseServicesDataSource(supabase);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[admin] failed to create services data source", error);
    return null;
  }
}
