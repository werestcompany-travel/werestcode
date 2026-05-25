import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/email-verification';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=missing', req.url));
  }

  try {
    const result = await verifyEmailToken(token);

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/auth/verify-email?error=${encodeURIComponent(result.error!)}`, req.url),
      );
    }

    return NextResponse.redirect(new URL('/auth/verify-email?success=1', req.url));
  } catch (e) {
    console.error('[verify-email]', e);
    return NextResponse.redirect(
      new URL('/auth/verify-email?error=Server+error.+Please+try+again.', req.url),
    );
  }
}
