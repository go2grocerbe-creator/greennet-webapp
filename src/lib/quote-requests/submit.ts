import { getEmailProvider } from "@/lib/email";
import { buildQuoteAcknowledgementEmail } from "@/lib/email/templates/quote-acknowledgement";
import { buildQuoteNotificationEmail } from "@/lib/email/templates/quote-notification";
import type { EmailProvider } from "@/lib/email/types";
import type { RateLimiter } from "@/lib/rate-limit/types";
import type { TurnstileResult } from "@/lib/turnstile/verify";
import { siteConfig } from "@/lib/config";
import {
  HONEYPOT_FIELD_NAME,
  quoteSubmissionSchema,
  type QuoteRequestValues,
} from "@/lib/validation/quote-request";

export type SubmitResult =
  | { status: "success"; reference: string }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "spam" }
  | { status: "rate_limited"; retryAfterSeconds?: number }
  | { status: "verification_failed" }
  | { status: "server_error" };

type QuoteRequestRow = {
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
  privacy_consent: boolean;
  turnstile_verified: boolean;
};

/**
 * Minimal structural subset of the Supabase client this pipeline needs —
 * lets tests inject a fake without a real Supabase project. The server-only
 * service-role client satisfies this structurally; browser code never receives
 * that credential or writes quotation rows directly.
 */
export interface QuoteRequestsInsertClient {
  from(table: "quote_requests"): {
    insert(row: QuoteRequestRow): {
      select(columns: string): {
        single(): PromiseLike<{
          data: { id: string } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
}

export type SubmitQuoteRequestDeps = {
  verifyTurnstile: (token: string) => Promise<TurnstileResult>;
  rateLimiter: RateLimiter;
  supabase: QuoteRequestsInsertClient;
  emailProvider?: EmailProvider;
};

function toRow(data: QuoteRequestValues, turnstileVerified: boolean): QuoteRequestRow {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    company_name: data.companyName ?? null,
    location: data.location ?? null,
    property_type: data.propertyType ?? null,
    service_interest: data.interestedSolution ?? null,
    electricity_usage: data.electricityUsage ?? null,
    preferred_contact_method: data.preferredContactMethod ?? null,
    project_timeline: data.projectTimeline ?? null,
    message: data.message,
    privacy_consent: data.privacyConsent,
    turnstile_verified: turnstileVerified,
  };
}

function referenceFromId(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/** Strips internal-only field errors (honeypot, turnstile token) before they ever reach the client. */
function toSafeFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  const safe: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (key === HONEYPOT_FIELD_NAME || key === "turnstileToken") continue;
    if (messages && messages.length > 0) safe[key] = messages;
  }
  return safe;
}

async function sendBestEffortEmails(
  data: QuoteRequestValues,
  reference: string,
  emailProvider: EmailProvider,
) {
  const notification = buildQuoteNotificationEmail(data, reference);
  const acknowledgement = buildQuoteAcknowledgementEmail(data, reference);

  const notificationTo = process.env.QUOTE_NOTIFICATION_EMAIL || siteConfig.contact.email;
  const from = process.env.EMAIL_FROM_ADDRESS || siteConfig.contact.email;

  const results = await Promise.allSettled([
    emailProvider.send({ ...notification, to: notificationTo, from }),
    emailProvider.send({ ...acknowledgement, to: data.email, from }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[quote-requests] email send threw", result.reason);
    } else if (!result.value.success) {
      console.error("[quote-requests] email send reported failure", result.value.error);
    }
  }
}

/**
 * Orchestrates the full quotation submission pipeline. The database
 * insert is the authoritative business event — once it succeeds, this
 * function always returns "success" even if the follow-up emails fail.
 * See docs/security-model.md "Quotation form submission path" and
 * docs/decision-log.md ADR-010.
 */
export async function submitQuoteRequest(
  raw: unknown,
  identifier: string,
  deps: SubmitQuoteRequestDeps,
): Promise<SubmitResult> {
  const parsed = quoteSubmissionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "invalid",
      fieldErrors: toSafeFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const { turnstileToken, [HONEYPOT_FIELD_NAME]: honeypotValue, ...data } = parsed.data;

  if (honeypotValue && honeypotValue.trim() !== "") {
    return { status: "spam" };
  }

  const rateLimit = await deps.rateLimiter.check(identifier);
  if (!rateLimit.allowed) {
    return { status: "rate_limited", retryAfterSeconds: rateLimit.retryAfterSeconds };
  }

  const turnstileResult = await deps.verifyTurnstile(turnstileToken);
  if (!turnstileResult.success) {
    return { status: "verification_failed" };
  }

  const { data: inserted, error } = await deps.supabase
    .from("quote_requests")
    .insert(toRow(data, true))
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[quote-requests] insert failed", error?.message);
    return { status: "server_error" };
  }

  const reference = referenceFromId(inserted.id);

  await sendBestEffortEmails(data, reference, deps.emailProvider ?? getEmailProvider());

  return { status: "success", reference };
}
