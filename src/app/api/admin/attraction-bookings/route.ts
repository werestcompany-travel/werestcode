export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

async function generateAttractionRef(visitDate: Date, visitors: number): Promise<string> {
  const dd = String(visitDate.getDate()).padStart(2, '0');
  const mm = String(visitDate.getMonth() + 1).padStart(2, '0');
  const yy = String(visitDate.getFullYear()).slice(-2);
  const pp = String(visitors).padStart(2, '0');
  const prefix = `WRTK-${dd}${mm}${yy}${pp}`;

  const existing = await prisma.attractionBooking.count({
    where: { bookingRef: { startsWith: prefix } },
  });

  const seq = String(existing + 1).padStart(3, '0');
  return `${prefix}${seq}`;
}

// GET — list all attraction bookings (admin)
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search') ?? '';

  const bookings = await prisma.attractionBooking.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { bookingRef: { contains: search, mode: 'insensitive' } },
              { customerName: { contains: search, mode: 'insensitive' } },
              { customerEmail: { contains: search, mode: 'insensitive' } },
              { attractionName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
      take: 500, // bound payload — newest 500; add pagination params when volume requires
  });

  const stats = {
    total:     await prisma.attractionBooking.count(),
    pending:   await prisma.attractionBooking.count({ where: { status: 'PENDING' } }),
    confirmed: await prisma.attractionBooking.count({ where: { status: 'CONFIRMED' } }),
    revenue:   (await prisma.attractionBooking.aggregate({
      where: { status: { in: ['CONFIRMED', 'USED'] } },
      _sum: { totalPrice: true },
    }))._sum.totalPrice ?? 0,
  };

  return NextResponse.json({ bookings, stats });
}

// POST — admin creates booking manually
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      attractionId, attractionName, packageId, packageName,
      visitDate,
      adultQty, childQty, infantQty,
      adultPrice, childPrice,
      totalPrice,
      customerName, customerEmail, customerPhone,
      notes,
      status,
    } = body;

    if (!attractionId || !attractionName || !packageId || !packageName) {
      return NextResponse.json({ error: 'Attraction and package details required.' }, { status: 400 });
    }
    if (!visitDate || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Visit date and customer details required.' }, { status: 400 });
    }

    const totalVisitors = (adultQty ?? 0) + (childQty ?? 0) + (infantQty ?? 0);
    const bookingRef = await generateAttractionRef(new Date(visitDate), totalVisitors);

    const booking = await prisma.attractionBooking.create({
      data: {
        bookingRef,
        attractionId,
        attractionName,
        packageId,
        packageName,
        visitDate: new Date(visitDate),
        adultQty: adultQty ?? 0,
        childQty: childQty ?? 0,
        infantQty: infantQty ?? 0,
        adultPrice: adultPrice ?? 0,
        childPrice: childPrice ?? 0,
        totalPrice: totalPrice ?? 0,
        customerName,
        customerEmail,
        customerPhone,
        notes: notes ?? null,
        userId: null,
        status: status ?? 'CONFIRMED',
        createdBy: `admin:${admin.name}`,
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error('[admin attraction-bookings POST]', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
