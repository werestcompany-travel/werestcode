import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  const updated = await prisma.tourNotifyRequest.update({
    where: { id },
    data: { notified: true },
  });

  return NextResponse.json({ request: updated });
}
