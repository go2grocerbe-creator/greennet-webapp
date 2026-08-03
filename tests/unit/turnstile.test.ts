import { afterEach, describe, expect, it, vi } from "vitest";

import { verifyTurnstileToken } from "@/lib/turnstile/verify";

describe("verifyTurnstileToken", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("fails closed in production when the secret is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(verifyTurnstileToken("")).resolves.toEqual({
      success: false,
      reason: "not_configured",
    });
  });

  it("allows the explicit bypass only outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(verifyTurnstileToken("")).resolves.toEqual({
      success: true,
      reason: "dev_bypass",
    });
  });

  it("rejects an empty token when a real secret is configured", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "configured-secret");

    await expect(verifyTurnstileToken("")).resolves.toEqual({
      success: false,
      reason: "invalid_token",
    });
  });
});
