export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { driverId } = await req.json();

    if (driverId) {
      // Assign: fetch driver to denormalise name
      const driver = await prisma.driver.findUnique({ where: { id: driverId } });
      if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

      const booking = await prisma.booking.update({
        where: { id: params.id },
        data: { driverId: driver.id, driverName: driver.name },
      });
      return NextResponse.json({ booking });
    } else {
      // Unassign
      const booking = await prisma.booking.update({
        where: { id: params.id },
        data: { driverId: null, driverName: null },
      });
      return NextResponse.json({ booking });
    }
  } catch (err) {
    console.error('[admin/bookings/assign-driver] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
