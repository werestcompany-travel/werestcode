import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signUserToken } from '@/lib/user-auth';
import { loginSchema } from '@/lib/validation/auth';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = rateLimit(`login:${ip}`, LIMITS.login);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always run bcrypt to prevent timing attacks even if user not found
    const dummyHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtgD0LHAkCOYz6TtgD0LHAkCOYzK';
    const valid = user ? await bcrypt.compare(password, user.password) : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

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
    console.error('[login]', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
