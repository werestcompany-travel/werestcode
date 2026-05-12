import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const pendingOnly = searchParams.get('pending') === 'true';

  const requests = await prisma.tourNotifyRequest.findMany({
    where: pendingOnly ? { notified: false } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ requests });
}
