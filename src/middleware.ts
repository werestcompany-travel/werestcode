import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { verifyUserTokenEdge } from '@/lib/user-auth'
import { isJtiDenylisted } from '@/lib/session-denylist'

// Paths that are exempt from CSRF validation even when they receive mutation requests
const CSRF_EXEMPT = [
  '/api/payment/webhook',  // signed by Payso
  '/api/admin/auth',       // login — no cookie yet
  '/api/user/register',    // no cookie yet
  '/api/user/login',       // no cookie yet
  '/api/user/verify-email',// GET anyway
]

function isCsrfExempt(pathname: string): boolean {
  // /api/cron/* is secured by CRON_SECRET header, not CSRF
  if (pathname.startsWith('/api/cron/')) return true
  return CSRF_EXEMPT.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isDev = process.env.NODE_ENV === 'development'

  // ── Generate request ID ───────────────────────────────────────────────────
  const requestId = crypto.randomUUID()

  // ── Generate nonce for CSP ────────────────────────────────────────────────
  const nonce = btoa(crypto.randomUUID())

  // ── Build CSP header ──────────────────────────────────────────────────────
  const cspHeader = [
    "default-src 'self'",
    // 'unsafe-eval' is required in dev for React Fast Refresh (webpack HMR uses eval())
    // It is intentionally omitted in production builds
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''} https://maps.googleapis.com https://maps.gstatic.com https://connect.facebook.net https://www.clarity.ms`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    [
      "connect-src 'self'",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://graph.facebook.com",
      "https://api.resend.com",
      "https://*.upstash.io",
      "https://fcm.googleapis.com",
      "https://connect.facebook.net",
      "https://www.facebook.com",
      "https://*.ingest.sentry.io",
      "https://www.clarity.ms",
      "https://*.clarity.ms",
    ].join(' '),
    // frame-src omitted: X-Frame-Options: SAMEORIGIN is set in next.config.js headers — no conflict
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')

  // ── Propagate nonce + request ID to layout via request headers ───────────
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-request-id', requestId)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (
    (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
    pathname !== '/admin/login' &&
    !pathname.startsWith('/admin/login/2fa') &&
    pathname !== '/api/admin/auth' &&
    !pathname.startsWith('/api/admin/2fa')
  ) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))
    const payload = await verifyAdminToken(token)
    if (!payload) return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // ── User account routes ───────────────────────────────────────────────────
  if (pathname.startsWith('/account')) {
    const token = req.cookies.get('user_token')?.value
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
    }
    const payload = await verifyUserTokenEdge(token)
    if (!payload) {
      return NextResponse.redirect(
        new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
    }
    // Revocation check via Redis denylist (no-op when Upstash not configured)
    if (await isJtiDenylisted(payload.jti as string | undefined)) {
      const res = NextResponse.redirect(
        new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
      res.cookies.set('user_token', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  // ── CSRF validation for mutation API requests ─────────────────────────────
  if (
    pathname.startsWith('/api/') &&
    MUTATION_METHODS.has(req.method) &&
    !isCsrfExempt(pathname)
  ) {
    const cookieToken = req.cookies.get('csrf_token')?.value ?? null
    const headerToken = req.headers.get('x-csrf-token')

    if (!cookieToken || !headerToken) {
      return new NextResponse(JSON.stringify({ error: 'CSRF token missing' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Edge-runtime safe constant-time comparison (no Node.js Buffer/crypto)
    const valid = constantTimeEqual(cookieToken, headerToken)
    if (!valid) {
      return new NextResponse(JSON.stringify({ error: 'CSRF token invalid' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // HMAC binding: a signed token is "value.signature" — verify the signature
    // so a non-browser client can't simply mint a matching cookie/header pair.
    // Legacy unsigned tokens (no dot) are accepted during the 24h cookie
    // rollover window; the response below reissues a signed one.
    if (cookieToken.includes('.')) {
      const [value, sig] = cookieToken.split('.')
      const expected = await hmacHex(value)
      if (!sig || !constantTimeEqual(sig, expected)) {
        return new NextResponse(JSON.stringify({ error: 'CSRF token invalid' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }

  // ── Build response with nonce headers + CSRF cookie ───────────────────────
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Forward CSP and request ID to the response
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-request-id', requestId)

  // Set CSRF cookie if not already present or not yet HMAC-signed
  const existingCsrf = req.cookies.get('csrf_token')?.value
  if (!existingCsrf || !existingCsrf.includes('.')) {
    const value = crypto.randomUUID()
    const csrfToken = `${value}.${await hmacHex(value)}`
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: false, // JS must read this for AJAX headers
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  return response
}

/** Edge-safe constant-time string comparison. */
function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  let diff = ab.length === bb.length ? 0 : 1
  const len = Math.min(ab.length, bb.length)
  for (let i = 0; i < len; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}

/** HMAC-SHA256 of value with JWT_SECRET, hex-encoded (Web Crypto — Edge-compatible). */
let hmacKeyPromise: Promise<CryptoKey> | null = null
function getHmacKey(): Promise<CryptoKey> {
  if (!hmacKeyPromise) {
    const secret = process.env.JWT_SECRET ?? 'dev-only-secret'
    hmacKeyPromise = crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    )
  }
  return hmacKeyPromise
}
async function hmacHex(value: string): Promise<string> {
  const key = await getHmacKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/api/admin/:path*',
    '/api/:path*',
    // Also run on page routes so the nonce header reaches layout.tsx
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)).*)',
  ],
}
