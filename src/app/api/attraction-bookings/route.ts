import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromCookies } from '@/lib/user-auth';

function generateBookingRef(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `AT-${yy}${mm}${dd}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      attractionId, attractionName, packageId, packageName,
      visitDate,
      adultQty, childQty, infantQty,
      adultPrice, childPrice,
      totalPrice,
      customerName, customerEmail, customerPhone,
      notes, paymentMethod,
    } = body;

    if (!attractionId || !attractionName || !packageId || !packageName) {
      return NextResponse.json({ error: 'Attraction and package details required.' }, { status: 400 });
    }
    if (!visitDate) {
      return NextResponse.json({ error: 'Visit date required.' }, { status: 400 });
    }
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Customer details required.' }, { status: 400 });
    }
    if ((adultQty ?? 0) + (childQty ?? 0) === 0) {
      return NextResponse.json({ error: 'At least one adult or child ticket required.' }, { status: 400 });
    }

    // Link to logged-in user if available
    const session = await getUserFromCookies();

    // Generate unique booking ref (retry on collision)
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
        totalPrice,
        customerName,
        customerEmail,
        customerPhone,
        notes: notes ?? null,
        paymentMethod: paymentMethod ?? null,
        userId: session?.id ?? null,
        createdBy: 'user',
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error('[attraction-bookings POST]', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function GET() {
  // Public: track by ref is handled by /api/attraction-bookings/track
  return NextResponse.json({ error: 'Use /api/attraction-bookings/track?ref=AT-...' }, { status: 400 });
}
