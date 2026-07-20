import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env";

/**
 * Server-side Supabase client using the anon key only — no cookies, no
 * user session, no service role. For anonymous public writes (currently
 * just the quotation form insert) that are already permitted by an
 * explicit RLS policy (`quote_requests_public_insert`), this is the
 * "narrowly-scoped RLS-permitted insert path" from
 * docs/security-model.md, chosen over the service-role key to keep this
 * route's privileges to exactly what RLS already grants anonymous users
 * — see docs/decision-log.md ADR-010.
 */
export function createAnonServerClient() {
  const env = getPublicEnv();
  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
