import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';
import { createEmailVerification } from '@/lib/email-verification';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimitAsync, getIP, RateLimitConfig } from '@/lib/rate-limit';

const RESEND_VERIFY_LIMIT: RateLimitConfig = { limit: 3, windowSec: 60 * 60 }; // 3/hour

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  }

  // Rate-limit by userId (not IP) so different IPs can't bypass
  const ip = getIP(req);
  const rl = await rateLimitAsync(`resend-verify:${user.id}:${ip}`, RESEND_VERIFY_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before requesting another email.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  try {
    // Fetch user record to get their current email and verified status
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, emailVerified: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (dbUser.emailVerified) {
      return NextResponse.json({ error: 'Your email is already verified.' }, { status: 400 });
    }

    const rawToken = await createEmailVerification(dbUser.id);
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';
    const verifyUrl = `${appUrl}/api/user/verify-email?token=${rawToken}`;

    await sendVerificationEmail({
      to:        dbUser.email,
      name:      dbUser.name,
      verifyUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[resend-verification]', e);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
