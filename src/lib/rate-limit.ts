/**
 * Rate limiter with Upstash Redis support (graceful in-memory fallback).
 *
 * For multi-instance deployments (Vercel serverless), install Upstash Redis and
 * set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in your environment:
 *   npm install @upstash/redis @upstash/ratelimit
 *
 * When those env vars are present, Redis is used for atomic cross-instance counting.
 * When they are absent, the in-memory store is used (single-instance only).
 */

// ── Upstash Redis (optional) ──────────────────────────────────────────────────

interface RedisClient {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
}

let redis: RedisClient | null = null;

// Dynamically load @upstash/redis only when env vars are configured.
// Import is wrapped so the build doesn't fail when the package is not installed.
if (
  typeof process !== 'undefined' &&
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require('@upstash/redis') as { Redis: new (opts: { url: string; token: string }) => RedisClient };
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch {
    // @upstash/redis not installed — fall back to in-memory store
    redis = null;
  }
}

// ── In-memory fallback ────────────────────────────────────────────────────────

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

// ── Public API ────────────────────────────────────────────────────────────────

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
 * Uses Upstash Redis when configured, otherwise falls back to in-memory.
 * @param key       Unique key, e.g. `login:${ip}` or `register:${ip}`
 * @param config    Rate limit configuration
 */
export async function rateLimitAsync(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + config.windowSec * 1000;

  if (redis) {
    try {
      const count = await redis.incr(key);
      // Set expiry only on first increment (count === 1) to avoid resetting the window
      if (count === 1) {
        await redis.expire(key, config.windowSec);
      }
      return {
        allowed:   count <= config.limit,
        remaining: Math.max(0, config.limit - count),
        resetAt,
      };
    } catch {
      // Redis error — fall through to in-memory
    }
  }

  // In-memory fallback
  return rateLimitInMemory(key, config);
}

function rateLimitInMemory(key: string, config: RateLimitConfig): RateLimitResult {
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

/**
 * Synchronous rate limit check (in-memory only).
 * Retained for backwards compatibility with existing callers.
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  return rateLimitInMemory(key, config);
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
