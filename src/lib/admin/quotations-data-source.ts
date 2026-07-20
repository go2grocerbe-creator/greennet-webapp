import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_rethrow } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type { QuotationStatus } from "./quotations";

export type RawQuotationRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  location: string | null;
  property_type: string | null;
  service_interest: string | null;
  electricity_usage: string | null;
  preferred_contact_method: string | null;
  project_timeline: string | null;
  message: string;
  status: QuotationStatus;
  created_at: string;
};

/**
 * Small purpose-built read/write surface, not the raw Supabase client —
 * keeps callers (src/lib/admin/quotations.ts) easy to unit test with a
 * plain fake, and keeps the one place that knows Supabase's actual
 * (deeply-generic) client type isolated to this file.
 */
export type QuotationsDataSource = {
  list(): Promise<{ data: RawQuotationRow[] | null; error: unknown }>;
  getById(id: string): Promise<{ data: RawQuotationRow | null; error: unknown }>;
  countByStatus(): Promise<{ data: { status: QuotationStatus }[] | null; error: unknown }>;
  updateStatus(id: string, status: QuotationStatus): Promise<{ error: unknown }>;
};

const SELECT_COLUMNS =
  "id, name, email, phone, company_name, location, property_type, service_interest, electricity_usage, preferred_contact_method, project_timeline, message, status, created_at";

/**
 * Reads happen through the session-bound Supabase client (see
 * src/lib/supabase/server.ts) — never the service role — so RLS
 * (`quote_requests_editor_read`, `quote_requests_editor_update_status`)
 * is what actually authorizes these queries, per docs/security-model.md.
 */
export function createSupabaseQuotationsDataSource(supabase: SupabaseClient): QuotationsDataSource {
  return {
    async list() {
      const { data, error } = await supabase
        .from("quote_requests")
        .select(SELECT_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(200);
      return { data: data as RawQuotationRow[] | null, error };
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from("quote_requests")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      return { data: data as RawQuotationRow | null, error };
    },
    async countByStatus() {
      const { data, error } = await supabase.from("quote_requests").select("status");
      return { data: data as { status: QuotationStatus }[] | null, error };
    },
    async updateStatus(id: string, status: QuotationStatus) {
      const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
      return { error };
    },
  };
}

/**
 * Fail-closed factory for server components/actions: if the client can't
 * even be created (e.g. Supabase env vars not configured in this
 * environment), returns null rather than throwing — callers treat null
 * the same as any other "unavailable" data-access outcome. Same pattern
 * as src/lib/auth/session.ts.
 */
export async function getServerQuotationsDataSource(): Promise<QuotationsDataSource | null> {
  try {
    const supabase = await createClient();
    return createSupabaseQuotationsDataSource(supabase);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[admin] failed to create quotations data source", error);
    return null;
  }
}
