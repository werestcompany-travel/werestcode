import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: q ? { email: { contains: q, mode: 'insensitive' } } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.newsletterSubscriber.count();

  return NextResponse.json({ subscribers, total });
}
