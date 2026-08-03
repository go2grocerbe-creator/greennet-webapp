import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_rethrow } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ProjectStatus = "draft" | "published";

export type RawProjectRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  summary: string | null;
  description: string | null;
  completion_date: string | null;
  cover_image_url: string | null;
  sort_order: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type ProjectWriteRow = {
  slug: string;
  title: string;
  location: string;
  summary: string;
  description: string;
  completion_date: string | null;
  cover_image_url: string | null;
  sort_order: number;
};

type DbError = { code?: string; message: string } | null;

/** Same shape as src/lib/admin/services-data-source.ts — see that file for the rationale. */
export type ProjectsDataSource = {
  list(): Promise<{ data: RawProjectRow[] | null; error: DbError }>;
  getById(id: string): Promise<{ data: RawProjectRow | null; error: DbError }>;
  create(row: ProjectWriteRow): Promise<{ data: RawProjectRow | null; error: DbError }>;
  update(
    id: string,
    row: Partial<ProjectWriteRow>,
  ): Promise<{ data: RawProjectRow | null; error: DbError }>;
  setStatus(id: string, status: ProjectStatus): Promise<{ error: DbError }>;
};

const SELECT_COLUMNS =
  "id, slug, title, location, summary, description, completion_date, cover_image_url, sort_order, status, created_at, updated_at";

/**
 * Reads and writes happen through the session-bound Supabase client —
 * RLS (`projects_editor_owner_all` / `projects_public_read_published`)
 * is the authorization backstop, per docs/security-model.md. Public callers
 * additionally apply the application-level published-status gate.
 */
export function createSupabaseProjectsDataSource(supabase: SupabaseClient): ProjectsDataSource {
  return {
    async list() {
      const { data, error } = await supabase
        .from("projects")
        .select(SELECT_COLUMNS)
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });
      return { data: data as RawProjectRow[] | null, error };
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from("projects")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      return { data: data as RawProjectRow | null, error };
    },
    async create(row: ProjectWriteRow) {
      const { data, error } = await supabase
        .from("projects")
        .insert(row)
        .select(SELECT_COLUMNS)
        .single();
      return { data: data as RawProjectRow | null, error };
    },
    async update(id: string, row: Partial<ProjectWriteRow>) {
      const { data, error } = await supabase
        .from("projects")
        .update(row)
        .eq("id", id)
        .select(SELECT_COLUMNS)
        .single();
      return { data: data as RawProjectRow | null, error };
    },
    async setStatus(id: string, status: ProjectStatus) {
      const { error } = await supabase.from("projects").update({ status }).eq("id", id);
      return { error };
    },
  };
}

/** Fail-closed factory — see src/lib/admin/quotations-data-source.ts for the same pattern. */
export async function getServerProjectsDataSource(): Promise<ProjectsDataSource | null> {
  try {
    const supabase = await createClient();
    return createSupabaseProjectsDataSource(supabase);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[admin] failed to create projects data source", error);
    return null;
  }
}
