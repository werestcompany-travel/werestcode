export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromCookies } from '@/lib/user-auth';
import { sendAttractionConfirmationEmail, sendAttractionBookingConfirmationEmail } from '@/lib/email';
import { sendAttractionBookingToAdmin } from '@/lib/whatsapp';
import { createAttractionBookingSchema } from '@/lib/validation/attraction';
import { rateLimitAsync, getIP, LIMITS } from '@/lib/rate-limit';

/**
 * Generates a unique attraction ticket booking reference.
 * Format: WRTK-DDMMYYPP### where:
 *   DD  = day of visit date
 *   MM  = month of visit date
 *   YY  = last 2 digits of year
 *   PP  = total visitors (adults + children + infants), zero-padded to 2 digits
 *   ### = 3-digit daily sequence for that date + visitor count (001, 002, …)
 *
 * Example: WRTK-19052604001
 */
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

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = await rateLimitAsync(`attraction-booking:${ip}`, LIMITS.booking);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many booking requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = createAttractionBookingSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Invalid booking data';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const data = parsed.data;

    // ── Server-side price recalculation — never trust client prices ──
    const pkg = await prisma.attractionPackage.findFirst({
      where: { id: data.packageId, attractionId: data.attractionId, isActive: true },
    });
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found or unavailable.' }, { status: 404 });
    }

    const serverAdultPrice = pkg.adultPrice;
    const serverChildPrice = pkg.childPrice;
    const serverTotalPrice =
      serverAdultPrice * (data.adultQty ?? 0) +
      serverChildPrice * (data.childQty ?? 0);
    // infantQty is always 0-priced per schema default

    // Link to logged-in user if available
    const session = await getUserFromCookies();

    // Generate unique booking ref
    const totalVisitors = (data.adultQty ?? 0) + (data.childQty ?? 0) + (data.infantQty ?? 0);
    const bookingRef = await generateAttractionRef(new Date(data.visitDate), totalVisitors);

    const booking = await prisma.attractionBooking.create({
      data: {
        bookingRef,
        attractionId:   data.attractionId,
        attractionName: data.attractionName,
        packageId:      data.packageId,
        packageName:    data.packageName,
        visitDate:      new Date(data.visitDate),
        adultQty:       data.adultQty,
        childQty:       data.childQty,
        infantQty:      data.infantQty,
        adultPrice:     serverAdultPrice,
        childPrice:     serverChildPrice,
        totalPrice:     serverTotalPrice,
        customerName:   data.customerName,
        customerEmail:  data.customerEmail,
        customerPhone:  data.customerPhone,
        notes:          data.notes ?? null,
        paymentMethod:  data.paymentMethod ?? null,
        userId:         session?.id ?? null,
        createdBy:      'user',
      },
    });

    // Fire-and-forget confirmation email
    sendAttractionConfirmationEmail({
      bookingRef:     booking.bookingRef,
      customerName:   booking.customerName,
      customerEmail:  booking.customerEmail,
      attractionName: booking.attractionName,
      packageName:    booking.packageName,
      visitDate:      booking.visitDate,
      adultQty:       booking.adultQty,
      childQty:       booking.childQty,
      totalPrice:     booking.totalPrice,
    }).catch(console.error);

    // Fire-and-forget WhatsApp admin alert
    sendAttractionBookingToAdmin({
      bookingRef:     booking.bookingRef,
      attractionName: booking.attractionName,
      packageName:    booking.packageName,
      visitDate:      booking.visitDate,
      adultQty:       booking.adultQty,
      childQty:       booking.childQty,
      totalPrice:     booking.totalPrice,
      customerName:   booking.customerName,
      customerPhone:  booking.customerPhone,
      customerEmail:  booking.customerEmail,
      notes:          booking.notes,
    }).catch(err => console.error('[attraction-booking] whatsapp error:', err));

    // Fire-and-forget confirmation email (with slug + WhatsApp)
    sendAttractionBookingConfirmationEmail({
      bookingRef:     booking.bookingRef,
      customerName:   booking.customerName,
      customerEmail:  booking.customerEmail,
      attractionName: booking.attractionName,
      attractionSlug: booking.attractionId, // slug stored as attractionId
      packageName:    booking.packageName,
      visitDate:      booking.visitDate,
      adultQty:       booking.adultQty,
      childQty:       booking.childQty,
      adultPrice:     booking.adultPrice,
      childPrice:     booking.childPrice,
      totalPrice:     booking.totalPrice,
      notes:          booking.notes,
    }).catch(err => console.error('[attraction-booking] email error:', err));

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error('[attraction-bookings POST]', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use /api/attraction-bookings/track?ref=AT-...' }, { status: 400 });
}
