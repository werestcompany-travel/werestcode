import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

function generateBookingRef(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `AT-${yy}${mm}${dd}-${rand}`;
}

// GET — list all attraction bookings (admin)
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search') ?? '';

  const bookings = await db.attractionBooking.findMany({
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
  });

  const stats = {
    total:     await db.attractionBooking.count(),
    pending:   await db.attractionBooking.count({ where: { status: 'PENDING' } }),
    confirmed: await db.attractionBooking.count({ where: { status: 'CONFIRMED' } }),
    revenue:   (await db.attractionBooking.aggregate({
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

    let bookingRef = generateBookingRef();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.attractionBooking.findUnique({ where: { bookingRef } });
      if (!existing) break;
      bookingRef = generateBookingRef();
      attempts++;
    }

    const booking = await db.attractionBooking.create({
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
