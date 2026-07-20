import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { getEmailProvider } from "@/lib/email";
import { quoteRequestRateLimiter } from "@/lib/rate-limit/memory";
import { createAnonServerClient } from "@/lib/supabase/anon-server-client";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { submitQuoteRequest } from "@/lib/quote-requests/submit";

export const runtime = "nodejs";

/**
 * Rate-limit identifier: a hashed IP, never the raw address — see
 * docs/security-model.md "no personal data logged" and ADR-010.
 */
function hashedIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const identifier = hashedIdentifier(request);

  // Wrapped so any setup failure (e.g. Supabase env vars not configured
  // in this environment) always returns our own generic JSON error
  // response, never Next's default (non-JSON, potentially detailed)
  // error page — see docs/security-model.md "no stack traces exposed".
  let result;
  try {
    result = await submitQuoteRequest(body, identifier, {
      verifyTurnstile: verifyTurnstileToken,
      rateLimiter: quoteRequestRateLimiter,
      supabase: createAnonServerClient(),
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
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    case "verification_failed":
      return NextResponse.json({ ok: false, error: "verification_failed" }, { status: 400 });
    case "server_error":
    default:
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
