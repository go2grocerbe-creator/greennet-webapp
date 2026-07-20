export type AuthResult =
  | { status: "success" }
  | { status: "invalid_input"; error: string }
  | { status: "invalid_credentials" }
  | { status: "unauthorized" }
  | { status: "server_error" };

/**
 * Minimal structural subset of the Supabase client this needs — lets
 * tests inject a fake without a real Supabase project. The real client
 * (src/lib/supabase/server.ts) satisfies this structurally, same pattern
 * as src/lib/quote-requests/submit.ts.
 */
export interface AuthClient {
  auth: {
    signInWithPassword(credentials: { email: string; password: string }): PromiseLike<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
    signOut(): PromiseLike<{ error: { message: string } | null }>;
  };
  from(table: "profiles"): {
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        single(): PromiseLike<{ data: { id: string } | null; error: unknown }>;
      };
    };
  };
}

/**
 * Owner/editor-only sign-in. Two independent gates: Supabase Auth
 * credentials, then a `profiles` row for that user — a valid Supabase
 * account with no profile row is signed back out immediately and
 * rejected, since there are only two roles and both require a profile
 * row (see docs/data-model.md `profiles`, docs/security-model.md
 * "Roles"). No public registration exists, so a missing profile means
 * the account isn't provisioned for admin access.
 */
export async function authenticate(
  email: string,
  password: string,
  supabase: AuthClient,
): Promise<AuthResult> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || !password) {
    return { status: "invalid_input", error: "Enter your email and password." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error || !data.user) {
    return { status: "invalid_credentials" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return { status: "unauthorized" };
  }

  return { status: "success" };
}
