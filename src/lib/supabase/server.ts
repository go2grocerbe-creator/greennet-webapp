import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnv } from "@/lib/env";

/**
 * Server-side Supabase client for server components/actions/route handlers.
 * Reads the anon key + the request's cookies — RLS still applies (see
 * docs/security-model.md). Never use the service role key here; that key
 * is reserved for trusted, narrowly-scoped server operations only.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = getPublicEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component with no request/response to
          // write cookies to — safe to ignore when middleware refreshes
          // the session on every request.
        }
      },
    },
  });
}
