import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyAdminToken } from '@/lib/auth'
import { verifyUserToken } from '@/lib/user-auth'

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

  // ── Generate nonce for CSP ────────────────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // ── Build CSP header ──────────────────────────────────────────────────────
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://maps.googleapis.com https://maps.gstatic.com https://connect.facebook.net`,
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
    ].join(' '),
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')

  // ── Propagate nonce to layout via request headers ─────────────────────────
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (
    (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
    pathname !== '/admin/login' &&
    pathname !== '/api/admin/auth'
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
    const payload = await verifyUserToken(token)
    if (!payload) {
      return NextResponse.redirect(
        new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
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

    // Constant-time comparison to prevent timing attacks
    if (cookieToken.length !== headerToken.length) {
      return new NextResponse(JSON.stringify({ error: 'CSRF token invalid' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const valid = crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    )
    if (!valid) {
      return new NextResponse(JSON.stringify({ error: 'CSRF token invalid' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // ── Build response with nonce headers + CSRF cookie ───────────────────────
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Forward CSP to the response as well
  response.headers.set('Content-Security-Policy', cspHeader)

  // Set CSRF cookie if not already present
  if (!req.cookies.get('csrf_token')) {
    const csrfToken = crypto.randomUUID()
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
