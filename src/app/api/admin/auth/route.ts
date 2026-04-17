import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signAdminToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signAdminToken({ id: admin.id, email: admin.email, name: admin.name });

    const res = NextResponse.json({ success: true, data: { name: admin.name } });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   8 * 60 * 60, // 8 hours
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
