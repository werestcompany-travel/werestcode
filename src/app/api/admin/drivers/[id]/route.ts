import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const driver = await prisma.driver.findUnique({
    where: { id: params.id },
    include: { vehicles: true, bookings: { orderBy: { createdAt: 'desc' }, take: 20 } },
  });
  if (!driver) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ driver });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phone, licenseNumber, languages, photoUrl, isActive, notes, rating } = body;

    const driver = await prisma.driver.update({
      where: { id: params.id },
      data: {
        ...(name          !== undefined && { name: String(name).trim() }),
        ...(phone         !== undefined && { phone: String(phone).trim() }),
        ...(licenseNumber !== undefined && { licenseNumber: licenseNumber || null }),
        ...(languages     !== undefined && { languages: Array.isArray(languages) ? languages : ['Thai'] }),
        ...(photoUrl      !== undefined && { photoUrl: photoUrl || null }),
        ...(isActive      !== undefined && { isActive: Boolean(isActive) }),
        ...(notes         !== undefined && { notes: notes || null }),
        ...(rating        !== undefined && { rating: Number(rating) }),
      },
    });
    return NextResponse.json({ driver });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// Keep PUT as an alias for backwards compatibility
export { PATCH as PUT };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Check for active bookings before deleting
    const activeBookings = await prisma.booking.count({
      where: { driverId: params.id, currentStatus: { not: 'CANCELLED' } },
    });
    if (activeBookings > 0) {
      return NextResponse.json(
        { error: `Driver has ${activeBookings} active booking(s). Reassign or cancel them first.` },
        { status: 409 },
      );
    }

    await prisma.driver.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
