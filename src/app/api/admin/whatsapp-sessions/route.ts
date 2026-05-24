export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await prisma.whatsAppSession.findMany({
      orderBy: { lastMessage: 'desc' },
    });

    // Aggregate stats
    const total = sessions.length;
    const byStep = sessions.reduce<Record<string, number>>((acc, s) => {
      acc[s.step] = (acc[s.step] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: { sessions, stats: { total, byStep } },
    });
  } catch (err) {
    console.error('[admin/whatsapp-sessions] GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
