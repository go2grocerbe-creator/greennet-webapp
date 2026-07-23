import { beforeEach, describe, expect, it, vi } from "vitest";

import { HONEYPOT_FIELD_NAME, type QuoteSubmissionInput } from "@/lib/validation/quote-request";
import {
  submitQuoteRequest,
  type QuoteRequestsInsertClient,
  type SubmitQuoteRequestDeps,
} from "@/lib/quote-requests/submit";

const validSubmission: QuoteSubmissionInput = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+234 906 312 1247",
  message: "Please send me a quotation for my shop.",
  privacyConsent: true,
  [HONEYPOT_FIELD_NAME]: "",
  turnstileToken: "valid-token",
};

function createDeps(overrides: Partial<SubmitQuoteRequestDeps> = {}): SubmitQuoteRequestDeps {
  const supabase: QuoteRequestsInsertClient = {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "11111111-1111-1111-1111-111111111111" },
            error: null,
          }),
        }),
      }),
    }),
  };

  return {
    verifyTurnstile: vi.fn().mockResolvedValue({ success: true }),
    rateLimiter: { check: vi.fn().mockResolvedValue({ allowed: true }) },
    supabase,
    emailProvider: { send: vi.fn().mockResolvedValue({ success: true }) },
    ...overrides,
  };
}

describe("submitQuoteRequest", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("returns success and attempts both emails on a valid submission", async () => {
    const deps = createDeps();

    const result = await submitQuoteRequest(validSubmission, "id-1", deps);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.reference).toBe("11111111");
    }
    expect(deps.emailProvider!.send).toHaveBeenCalledTimes(2);
  });

  it("rejects an invalid payload without leaking honeypot/turnstile field names", async () => {
    const deps = createDeps();

    const result = await submitQuoteRequest(
      { ...validSubmission, email: "not-an-email", name: "" },
      "id-2",
      deps,
    );

    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.fieldErrors.email).toBeDefined();
      expect(result.fieldErrors.name).toBeDefined();
      expect(result.fieldErrors[HONEYPOT_FIELD_NAME]).toBeUndefined();
      expect(result.fieldErrors.turnstileToken).toBeUndefined();
    }
    expect(deps.rateLimiter.check).not.toHaveBeenCalled();
    expect(deps.verifyTurnstile).not.toHaveBeenCalled();
  });

  it("short-circuits as spam on a filled honeypot, before rate-limit/turnstile/db calls", async () => {
    const deps = createDeps();

    const result = await submitQuoteRequest(
      { ...validSubmission, [HONEYPOT_FIELD_NAME]: "http://spam.example" },
      "id-3",
      deps,
    );

    expect(result.status).toBe("spam");
    expect(deps.rateLimiter.check).not.toHaveBeenCalled();
    expect(deps.verifyTurnstile).not.toHaveBeenCalled();
    expect(deps.supabase.from).not.toHaveBeenCalled();
  });

  it("returns rate_limited and skips turnstile/db when the rate limiter rejects", async () => {
    const deps = createDeps({
      rateLimiter: { check: vi.fn().mockResolvedValue({ allowed: false, retryAfterSeconds: 42 }) },
    });

    const result = await submitQuoteRequest(validSubmission, "id-4", deps);

    expect(result).toEqual({ status: "rate_limited", retryAfterSeconds: 42 });
    expect(deps.verifyTurnstile).not.toHaveBeenCalled();
    expect(deps.supabase.from).not.toHaveBeenCalled();
  });

  it("returns verification_failed and skips the db insert when Turnstile fails", async () => {
    const deps = createDeps({
      verifyTurnstile: vi.fn().mockResolvedValue({ success: false, reason: "invalid_token" }),
    });

    const result = await submitQuoteRequest(validSubmission, "id-5", deps);

    expect(result.status).toBe("verification_failed");
    expect(deps.supabase.from).not.toHaveBeenCalled();
  });

  it("returns a safe server_error with no raw database error text when the insert fails", async () => {
    const failingSupabase: QuoteRequestsInsertClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'duplicate key value violates unique constraint "secret_index"' },
            }),
          }),
        }),
      }),
    };
    const deps = createDeps({ supabase: failingSupabase });

    const result = await submitQuoteRequest(validSubmission, "id-6", deps);

    expect(result).toEqual({ status: "server_error" });
    expect(JSON.stringify(result)).not.toContain("secret_index");
  });

  it("still returns success when the DB insert succeeds but email sending fails", async () => {
    const deps = createDeps({
      emailProvider: { send: vi.fn().mockRejectedValue(new Error("resend is down")) },
    });

    const result = await submitQuoteRequest(validSubmission, "id-7", deps);

    expect(result.status).toBe("success");
    expect(console.error).toHaveBeenCalled();
  });
});
