import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';
import type { Prisma } from '@prisma/client';

const SESSION_COOKIE = 'wb_session';
const SESSION_TTL_DAYS = 30;
const BOOKING_TTL_HOURS = 24;

// ─── POST /api/bookings/abandoned ─────────────────────────────────────────────
// Called when a user reaches the payment step but hasn't completed the booking.
// Creates/updates an AbandonedBooking record keyed by a session cookie token.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      bookingType?: 'transfer' | 'tour';
      step?: string;
      data?: Record<string, unknown>;
      customerEmail?: string;
      customerName?: string;
    };

    const { bookingType, step, data, customerEmail, customerName } = body;

    if (!bookingType || !step || !data) {
      return NextResponse.json(
        { success: false, error: 'bookingType, step, and data are required' },
        { status: 400 },
      );
    }

    // Read or create session token
    const existingToken = req.cookies.get(SESSION_COOKIE)?.value ?? null;
    const sessionToken  = existingToken && existingToken.length === 64
      ? existingToken
      : randomBytes(32).toString('hex');

    const expiresAt = new Date(Date.now() + BOOKING_TTL_HOURS * 60 * 60 * 1000);

    // Cast to Prisma InputJsonValue to satisfy the Json field constraint
    const jsonData = data as Prisma.InputJsonValue;

    await prisma.abandonedBooking.upsert({
      where:  { sessionToken },
      create: {
        sessionToken,
        bookingType,
        step,
        data:          jsonData,
        customerEmail: customerEmail ?? null,
        customerName:  customerName  ?? null,
        expiresAt,
      },
      update: {
        step,
        data:          jsonData,
        customerEmail: customerEmail ?? undefined,
        customerName:  customerName  ?? undefined,
        expiresAt,
        // Reset recovery email if data meaningfully changed (user came back)
        recoveryEmailSentAt: null,
      },
    });

    const res = NextResponse.json({ success: true, sessionToken });

    // Set/refresh cookie
    const cookieMaxAge = SESSION_TTL_DAYS * 24 * 60 * 60;
    res.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   cookieMaxAge,
      path:     '/',
    });

    return res;
  } catch (err) {
    console.error('[bookings/abandoned] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// ─── GET /api/bookings/abandoned?token=xxx ────────────────────────────────────
// Returns an un-recovered, non-expired abandoned booking so the UI can pre-fill.

export async function GET(req: NextRequest) {
  try {
    const token =
      req.nextUrl.searchParams.get('token') ??
      req.cookies.get(SESSION_COOKIE)?.value ??
      null;

    if (!token) {
      return NextResponse.json({ success: true, data: null });
    }

    const record = await prisma.abandonedBooking.findUnique({
      where: { sessionToken: token },
    });

    if (
      !record ||
      record.recoveredAt !== null ||
      record.expiresAt < new Date()
    ) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingType:   record.bookingType,
        step:          record.step,
        partialData:   record.data,
        customerEmail: record.customerEmail,
        customerName:  record.customerName,
        expiresAt:     record.expiresAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('[bookings/abandoned] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// ─── PATCH /api/bookings/abandoned?token=xxx — mark as recovered ──────────────
export async function PATCH(req: NextRequest) {
  try {
    const token =
      req.nextUrl.searchParams.get('token') ??
      req.cookies.get(SESSION_COOKIE)?.value ??
      null;

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token' }, { status: 400 });
    }

    await prisma.abandonedBooking.updateMany({
      where:  { sessionToken: token, recoveredAt: null },
      data:   { recoveredAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[bookings/abandoned] PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
