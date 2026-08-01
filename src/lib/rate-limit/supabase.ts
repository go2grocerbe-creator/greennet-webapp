import type { RateLimiter } from "./types";

type RateLimitRow = {
  allowed: boolean;
  retry_after_seconds: number | null;
};

export type RateLimitRpcClient = {
  rpc(
    functionName: "check_quote_request_rate_limit",
    params: {
      p_identifier_hash: string;
      p_limit: number;
      p_window_seconds: number;
    },
  ): PromiseLike<{
    data: RateLimitRow[] | RateLimitRow | null;
    error: { message: string } | null;
  }>;
};

type Options = {
  max: number;
  windowSeconds: number;
};

/**
 * Atomic, shared limiter for serverless production. Its RPC is executable by
 * the service role only; the identifier is already a one-way IP hash.
 */
export function createSupabaseRateLimiter(
  client: RateLimitRpcClient,
  { max, windowSeconds }: Options,
): RateLimiter {
  return {
    async check(identifier) {
      const { data, error } = await client.rpc("check_quote_request_rate_limit", {
        p_identifier_hash: identifier,
        p_limit: max,
        p_window_seconds: windowSeconds,
      });

      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row) {
        console.error("[rate-limit] shared limiter failed", error?.message);
        throw new Error("Shared rate limiter unavailable");
      }

      return {
        allowed: row.allowed,
        ...(row.retry_after_seconds === null ? {} : { retryAfterSeconds: row.retry_after_seconds }),
      };
    },
  };
}
