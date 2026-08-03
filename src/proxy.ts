import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every admin request and blocks
 * unauthenticated access. The admin layout performs the role check and RLS
 * remains the independent data-enforcement layer.
 */
export async function proxy(request: NextRequest) {
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
    console.error("[proxy] failed to resolve session", error);
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
