import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-in-production',
);

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
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verifyUserToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
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
