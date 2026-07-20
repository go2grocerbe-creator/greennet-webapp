import { unstable_rethrow } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  role: "owner" | "editor";
  fullName: string | null;
};

/**
 * Fail-closed: any error (including Supabase not being configured in
 * this environment yet) resolves to "no admin" rather than throwing, so
 * callers (middleware, admin layout) can treat it as "not authenticated"
 * and redirect to /login instead of crashing the request. See
 * docs/security-model.md "neither layer relied on alone" — this is the
 * server-side session+role check, independent of RLS.
 */
export async function getAuthenticatedAdmin(): Promise<AdminProfile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    return { id: profile.id, role: profile.role, fullName: profile.full_name };
  } catch (error) {
    // Let Next's own control-flow signals (redirect/notFound/dynamic
    // rendering bailout) pass through — only genuine errors are logged
    // and swallowed here.
    unstable_rethrow(error);
    console.error("[auth] failed to resolve admin session", error);
    return null;
  }
}
