import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

// Fail hard if JWT_SECRET is not configured — a missing secret means all tokens
// are signed with a predictable fallback that any attacker can forge.
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error(
    '[user-auth] JWT_SECRET environment variable is not set. ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
  );
}
const SECRET = new TextEncoder().encode(jwtSecret);

export interface UserTokenPayload {
  id: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

export async function signUserToken(payload: UserTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyUserToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ['HS256'] });
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
