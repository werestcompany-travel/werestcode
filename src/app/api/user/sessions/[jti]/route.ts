export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/user-auth';
import { denylistJti } from '@/lib/session-denylist';

// DELETE /api/user/sessions/[jti] — revoke a specific session
export async function DELETE(
  req: NextRequest,
  { params }: { params: { jti: string } },
) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { jti } = params;
  if (!jti) {
    return NextResponse.json({ success: false, error: 'Missing session ID' }, { status: 400 });
  }

  try {
    // Ensure the session belongs to the current user before revoking
    const session = await prisma.userSession.findUnique({ where: { jti } });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (session.revokedAt) {
      return NextResponse.json({ success: true }); // already revoked
    }

    await prisma.userSession.update({
      where: { jti },
      data: { revokedAt: new Date() },
    });
    // Also denylist in Redis so Edge middleware blocks the token immediately
    denylistJti(jti).catch(() => {});

    const res = NextResponse.json({ success: true });

    // If the user is revoking their own current session, clear the cookie
    const currentJti = user.jti as string | undefined;
    if (currentJti && currentJti === jti) {
      res.cookies.set('user_token', '', { maxAge: 0, path: '/' });
    }

    return res;
  } catch (err) {
    console.error('[user/sessions/[jti]] DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
