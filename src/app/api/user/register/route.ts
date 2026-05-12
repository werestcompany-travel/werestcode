import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signUserToken } from '@/lib/user-auth';
import { registerSchema } from '@/lib/validation/auth';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = rateLimit(`register:${ip}`, LIMITS.register);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }

    const { name, email, password, phone } = parsed.data;

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name, email: email.toLowerCase(), password: hashed, phone: phone ?? null },
    });

    const token = await signUserToken({ id: user.id, email: user.email, name: user.name });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
    });
    res.cookies.set('user_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    console.error('[register]', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
