import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every request and blocks
 * unauthenticated access to /admin. Role checks (owner vs. editor) happen
 * in the admin layout, backed by RLS as the independent enforcement layer
 * — see docs/security-model.md.
 *
 * Fail-closed: if session resolution throws for any reason (e.g. Supabase
 * env vars not configured in this environment), treat the request as
 * unauthenticated rather than letting the error crash the request — see
 * src/lib/auth/session.ts for the same pattern used by the admin layout.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  let user = null;
  try {
    const env = getPublicEnv();
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      },
    );

    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    console.error("[middleware] failed to resolve session", error);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
