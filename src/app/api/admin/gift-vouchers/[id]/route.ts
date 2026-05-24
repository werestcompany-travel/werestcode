export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const voucher = await prisma.giftVoucher.update({
    where: { id: params.id },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isUsed   !== undefined && {
        isUsed: body.isUsed,
        usedAt: body.isUsed ? new Date() : null,
      }),
      ...(body.usedByEmail      !== undefined && { usedByEmail: body.usedByEmail || null }),
      ...(body.usedOnBookingRef !== undefined && { usedOnBookingRef: body.usedOnBookingRef || null }),
    },
  });
  return NextResponse.json({ success: true, voucher });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.giftVoucher.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
