/**
 * In-memory sliding-window rate limiter.
 * Works for single-instance deployments. For multi-instance (Vercel serverless),
 * replace with Upstash Redis: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

interface WindowEntry {
  count:     number;
  resetAt:   number; // epoch ms
}

const store = new Map<string, WindowEntry>();

// Prune expired entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit:     number;
  /** Window duration in seconds */
  windowSec: number;
}

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;
}

/**
 * Check and increment the rate-limit counter for a given key.
 * @param key       Unique key, e.g. `login:${ip}` or `register:${ip}`
 * @param config    Rate limit configuration
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSec * 1000;

  let entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;

  return {
    allowed:   entry.count <= config.limit,
    remaining: Math.max(0, config.limit - entry.count),
    resetAt:   entry.resetAt,
  };
}

/** Extract the client IP from a Next.js request */
export function getIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

// Pre-configured limiters
export const LIMITS = {
  login:        { limit: 10, windowSec: 60 * 15 } satisfies RateLimitConfig, // 10/15min
  register:     { limit: 5,  windowSec: 60 * 60 } satisfies RateLimitConfig, // 5/hour
  forgotPw:     { limit: 3,  windowSec: 60 * 60 } satisfies RateLimitConfig, // 3/hour
  booking:      { limit: 20, windowSec: 60 * 60 } satisfies RateLimitConfig, // 20/hour
  discountCode: { limit: 30, windowSec: 60 * 15 } satisfies RateLimitConfig, // 30/15min
  inquiry:      { limit: 3,  windowSec: 60 * 60 } satisfies RateLimitConfig, // 3/hour
};
