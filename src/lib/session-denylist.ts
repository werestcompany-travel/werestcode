/**
 * Session revocation denylist on Upstash Redis (REST API — works in BOTH
 * Edge middleware and Node API routes, no client library needed).
 *
 * Why: middleware runs on the Edge runtime where Prisma can't check the
 * UserSession table, so a revoked-but-unexpired JWT still passes the
 * middleware gate. This denylist closes that window: revocation writes the
 * jti here, and middleware checks it on every gated page load.
 *
 * Graceful degradation: when UPSTASH env vars are not configured, these
 * functions no-op — behaviour falls back to the previous (DB-only) model.
 */

const URL_  = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const KEY_PREFIX = 'revoked-jti:';
/** Match the user-token lifetime (7 days) — after that the JWT expires anyway. */
const DEFAULT_TTL_SEC = 7 * 24 * 60 * 60;

function configured(): boolean {
  return Boolean(URL_ && TOKEN);
}

/** Mark a session jti as revoked. Fire-and-forget safe. */
export async function denylistJti(jti: string, ttlSec: number = DEFAULT_TTL_SEC): Promise<void> {
  if (!configured() || !jti) return;
  try {
    await fetch(`${URL_}/set/${KEY_PREFIX}${jti}/1?EX=${ttlSec}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
    });
  } catch {
    // Redis down — DB-side revocation still applies in API routes
  }
}

/** Check whether a jti has been revoked. Returns false when not configured. */
export async function isJtiDenylisted(jti: string | undefined): Promise<boolean> {
  if (!configured() || !jti) return false;
  try {
    const res = await fetch(`${URL_}/get/${KEY_PREFIX}${jti}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { result: string | null };
    return json.result !== null;
  } catch {
    return false; // fail open — DB check in API routes remains the backstop
  }
}
