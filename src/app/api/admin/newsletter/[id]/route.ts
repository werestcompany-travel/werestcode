import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const body = await req.json() as { isActive?: boolean };

  if (typeof body.isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive (boolean) required' }, { status: 400 });
  }

  const updated = await prisma.newsletterSubscriber.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  return NextResponse.json({ subscriber: updated });
}
