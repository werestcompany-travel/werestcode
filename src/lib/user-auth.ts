import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is not set. Set it before deploying.');
}
const SECRET = new TextEncoder().encode(jwtSecret ?? 'dev-only-secret');

export interface UserTokenPayload {
  id: string;
  email: string;
  name: string;
  jti?: string;
  [key: string]: unknown;
}

function generateJti(): string {
  // Uses Web Crypto global — Edge-compatible (no Node.js crypto import needed)
  return crypto.randomUUID().replace(/-/g, '');
}

export async function signUserToken(
  payload: UserTokenPayload,
  options?: { userAgent?: string; ip?: string },
): Promise<string> {
  const jti = generateJti();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);

  // Save session to DB for revocation tracking — fire-and-forget
  await prisma.userSession
    .create({
      data: {
        userId: payload.id,
        jti,
        userAgent: options?.userAgent ?? null,
        ip: options?.ip ?? null,
        expiresAt,
      },
    })
    .catch(() => {}); // don't fail auth if DB write fails

  return token;
}

/**
 * Edge-compatible JWT verification — signature + expiry only, no DB call.
 * Use this in middleware (Edge runtime) where Prisma cannot run.
 */
export async function verifyUserTokenEdge(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ['HS256'] });
    return payload as UserTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Full verification with DB revocation check — use in API routes (Node.js runtime).
 */
export async function verifyUserToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ['HS256'] });
    const jti = payload.jti as string | undefined;
    if (jti) {
      // Check if session has been revoked
      const session = await prisma.userSession.findUnique({ where: { jti } });
      if (!session || session.revokedAt) return null;
    }
    return payload as UserTokenPayload;
  } catch {
    return null;
  }
}

export async function getUserFromCookies(): Promise<UserTokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('user_token')?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

/**
 * Authenticate from either:
 *   1. Authorization: Bearer <token> header (mobile clients)
 *   2. user_token cookie (web clients)
 */
export async function getUserFromRequest(req: NextRequest): Promise<UserTokenPayload | null> {
  // 1. Bearer token (mobile)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return verifyUserToken(token);
  }
  // 2. Cookie fallback (web)
  return getUserFromCookies();
}
