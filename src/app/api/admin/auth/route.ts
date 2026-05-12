import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signAdminToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { adminLoginSchema } from '@/lib/validation/auth';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = rateLimit(`admin-login:${ip}`, LIMITS.login);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });

    // Constant-time comparison
    const dummyHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtgD0LHAkCOYz6TtgD0LHAkCOYzK';
    const valid = admin
      ? await bcrypt.compare(password, admin.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!admin || !valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signAdminToken({ id: admin.id, email: admin.email, name: admin.name });

    const res = NextResponse.json({ success: true, data: { name: admin.name } });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   8 * 60 * 60,
      path:     '/',
    });
    return res;
  } catch (err) {
    console.error('[admin/auth] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
  return res;
}
