export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, email: true, name: true, phone: true,
      loyaltyPoints: true, createdAt: true,
      loyaltyTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const bookingCount = await prisma.booking.count({ where: { customerEmail: user.email } });
  const tourCount    = await prisma.tourBooking.count({ where: { customerEmail: user.email } });
  const attrCount    = await prisma.attractionBooking.count({ where: { customerEmail: user.email } });

  return NextResponse.json({ success: true, user, bookingCount: bookingCount + tourCount + attrCount });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { points, description } = await req.json();
  if (points === undefined || !description) {
    return NextResponse.json({ error: 'points and description required' }, { status: 400 });
  }

  const [tx] = await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        userId: params.id,
        points: Number(points),
        type: 'ADJUST',
        description,
      },
    }),
    prisma.user.update({
      where: { id: params.id },
      data: { loyaltyPoints: { increment: Number(points) } },
    }),
  ]);

  return NextResponse.json({ success: true, transaction: tx });
}
