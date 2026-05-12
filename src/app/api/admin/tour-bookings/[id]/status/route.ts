import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  const allowed = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING'];
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const booking = await prisma.tourBooking.update({
      where: { id: params.id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            updatedBy: admin.name ?? 'Admin',
          },
        },
      },
    });
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: 'Booking not found or update failed' }, { status: 404 });
  }
}
