import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";

/**
 * Server-only privileged client used for the validated quotation insert.
 * Anonymous RLS has no INSERT policy, so callers cannot bypass the website's
 * Zod, rate-limit, and Turnstile pipeline through the Supabase REST endpoint.
 */
export function createAdminServerClient() {
  const env = getServerEnv();
  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
