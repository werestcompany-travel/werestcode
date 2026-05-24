export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { phone: string } },
) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { phone } = params;
  if (!phone) {
    return NextResponse.json({ success: false, error: 'Phone required' }, { status: 400 });
  }

  try {
    const deleted = await prisma.whatsAppSession.deleteMany({ where: { phone } });
    if (deleted.count === 0) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/whatsapp-sessions/[phone]] DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
  }
}
