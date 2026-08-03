import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { getEmailProvider } from "@/lib/email";
import { createSupabaseRateLimiter } from "@/lib/rate-limit/supabase";
import { createAdminServerClient } from "@/lib/supabase/admin-server-client";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { submitQuoteRequest } from "@/lib/quote-requests/submit";

export const runtime = "nodejs";

/**
 * Rate-limit identifier: a hashed IP, never the raw address — see
 * docs/security-model.md "no personal data logged" and ADR-010.
 */
function clientIp(request: NextRequest): string | undefined {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;
}

function hashedIdentifier(ip: string | undefined): string {
  return createHash("sha256")
    .update(ip ?? "unknown")
    .digest("hex")
    .slice(0, 16);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const ip = clientIp(request);
  const identifier = hashedIdentifier(ip);

  // Wrapped so any setup failure (e.g. Supabase env vars not configured
  // in this environment) always returns our own generic JSON error
  // response, never Next's default (non-JSON, potentially detailed)
  // error page — see docs/security-model.md "no stack traces exposed".
  let result;
  try {
    const supabase = createAdminServerClient();
    result = await submitQuoteRequest(body, identifier, {
      verifyTurnstile: (token) => verifyTurnstileToken(token, ip),
      rateLimiter: createSupabaseRateLimiter(supabase, { max: 5, windowSeconds: 10 * 60 }),
      supabase,
      emailProvider: getEmailProvider(),
    });
  } catch (error) {
    console.error("[quote-requests] unhandled error in submission pipeline", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  switch (result.status) {
    case "success":
      return NextResponse.json({ ok: true, reference: result.reference });
    case "spam":
      // Disguised as success so the sender gets no signal their
      // submission was rejected — see docs/decision-log.md ADR-010.
      return NextResponse.json({ ok: true, reference: "RECEIVED" });
    case "invalid":
      return NextResponse.json(
        { ok: false, error: "validation", fieldErrors: result.fieldErrors },
        { status: 400 },
      );
    case "rate_limited":
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        {
          status: 429,
          headers: result.retryAfterSeconds
            ? { "Retry-After": String(result.retryAfterSeconds) }
            : undefined,
        },
      );
    case "verification_failed":
      return NextResponse.json({ ok: false, error: "verification_failed" }, { status: 400 });
    case "server_error":
    default:
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
