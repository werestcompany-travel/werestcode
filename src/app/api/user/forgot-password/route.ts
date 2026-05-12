import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { forgotPasswordSchema } from '@/lib/validation/auth';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = rateLimit(`forgot-pw:${ip}`, LIMITS.forgotPw);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const { email } = parsed.data;

    // Always return success to prevent user enumeration
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Invalidate any existing tokens for this user
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Generate a random 48-byte hex token (96 chars)
    const rawToken  = crypto.randomBytes(48).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';
    const resetUrl = `${appUrl}/auth/reset?token=${rawToken}`;

    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
