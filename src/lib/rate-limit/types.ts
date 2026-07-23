export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export interface RateLimiter {
  check(identifier: string): Promise<RateLimitResult>;
}
