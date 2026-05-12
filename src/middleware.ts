import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { verifyUserToken } from '@/lib/user-auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (
    (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
    pathname !== '/admin/login' &&
    pathname !== '/api/admin/auth'
  ) {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));
    const payload = await verifyAdminToken(token);
    if (!payload) return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // ── User account routes ───────────────────────────────────────────────────
  if (pathname.startsWith('/account')) {
    const token = req.cookies.get('user_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url));
    }
    const payload = await verifyUserToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/api/admin/:path*'],
};
