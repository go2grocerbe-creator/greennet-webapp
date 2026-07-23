import type { RateLimiter, RateLimitResult } from "./types";

type Options = {
  windowMs: number;
  max: number;
};

/**
 * Single-instance, in-process token-window limiter. Fine for local dev,
 * tests, and a single long-lived server — NOT safe across multiple
 * serverless invocations or horizontally-scaled instances, since each
 * process has its own Map. A Redis/Upstash-backed adapter implementing
 * the same RateLimiter interface is the documented future swap-in — see
 * docs/architecture.md "Rate limiting".
 */
export function createInMemoryRateLimiter({ windowMs, max }: Options): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const now = Date.now();
      const entry = hits.get(identifier);

      if (!entry || entry.resetAt <= now) {
        hits.set(identifier, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
      }

      if (entry.count >= max) {
        return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
      }

      entry.count += 1;
      return { allowed: true };
    },
  };
}

/** Default limiter for the public quotation form: 5 submissions / 10 minutes per identifier. */
export const quoteRequestRateLimiter = createInMemoryRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
});
