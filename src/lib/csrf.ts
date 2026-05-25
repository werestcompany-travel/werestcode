import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'
const TOKEN_LENGTH = 32

export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex')
}

// Validate CSRF: compare header token against cookie token (double-submit cookie pattern)
export function validateCsrf(headerToken: string | null, cookieToken: string | null): boolean {
  if (!headerToken || !cookieToken) return false
  // Constant-time comparison to prevent timing attacks
  if (headerToken.length !== cookieToken.length) return false
  return crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))
}

// For use in Server Components / API routes
export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = cookies()
  return cookieStore.get(CSRF_COOKIE)?.value
}

export { CSRF_COOKIE, CSRF_HEADER }
