export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/user-auth';
import { denylistJti } from '@/lib/session-denylist';

// GET /api/user/sessions — list all active sessions for the current user
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jti: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Identify the current session jti from the token
    const currentJti = user.jti as string | undefined;

    return NextResponse.json({
      success: true,
      data: sessions.map((s) => ({ ...s, isCurrent: s.jti === currentJti })),
    });
  } catch (err) {
    console.error('[user/sessions] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/user/sessions — revoke ALL sessions (sign out all devices)
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Collect active jtis first so we can denylist them in Redis (Edge middleware)
    const active = await prisma.userSession.findMany({
      where: { userId: user.id, revokedAt: null },
      select: { jti: true },
    });

    await prisma.userSession.updateMany({
      where: { userId: user.id },
      data: { revokedAt: new Date() },
    });

    for (const s of active) denylistJti(s.jti).catch(() => {});

    const res = NextResponse.json({ success: true });
    // Clear the current session cookie
    res.cookies.set('user_token', '', { maxAge: 0, path: '/' });
    return res;
  } catch (err) {
    console.error('[user/sessions] DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
