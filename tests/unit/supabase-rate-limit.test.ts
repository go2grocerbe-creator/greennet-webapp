import { describe, expect, it, vi } from "vitest";

import { createSupabaseRateLimiter, type RateLimitRpcClient } from "@/lib/rate-limit/supabase";

function clientWithResult(
  result: Awaited<ReturnType<RateLimitRpcClient["rpc"]>>,
): RateLimitRpcClient {
  return { rpc: vi.fn().mockResolvedValue(result) };
}

describe("createSupabaseRateLimiter", () => {
  it("maps an allowed shared-window response", async () => {
    const client = clientWithResult({
      data: [{ allowed: true, retry_after_seconds: null }],
      error: null,
    });
    const limiter = createSupabaseRateLimiter(client, { max: 5, windowSeconds: 600 });

    await expect(limiter.check("abc123")).resolves.toEqual({ allowed: true });
    expect(client.rpc).toHaveBeenCalledWith("check_quote_request_rate_limit", {
      p_identifier_hash: "abc123",
      p_limit: 5,
      p_window_seconds: 600,
    });
  });

  it("preserves the retry interval when the window is exhausted", async () => {
    const client = clientWithResult({
      data: [{ allowed: false, retry_after_seconds: 42 }],
      error: null,
    });
    const limiter = createSupabaseRateLimiter(client, { max: 5, windowSeconds: 600 });

    await expect(limiter.check("abc123")).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 42,
    });
  });

  it("fails closed when the shared store is unavailable", async () => {
    const client = clientWithResult({ data: null, error: { message: "offline" } });
    const limiter = createSupabaseRateLimiter(client, { max: 5, windowSeconds: 600 });

    await expect(limiter.check("abc123")).rejects.toThrow("Shared rate limiter unavailable");
  });
});
