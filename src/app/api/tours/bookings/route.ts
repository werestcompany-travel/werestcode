import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromCookies } from '@/lib/user-auth';
import { awardPoints } from '@/lib/loyalty';
import { getTourBySlug, type Tour, type TourOption } from '@/lib/tours';
import { sendTourBookingEmail, sendTourBookingConfirmationEmail } from '@/lib/email';
import { sendTourBookingToAdmin } from '@/lib/whatsapp';

// ─── Resolve tour from DB first, fall back to static catalogue ───────────────

async function resolveTour(slug: string): Promise<Tour | null> {
  try {
    const dbTour = await prisma.tour.findUnique({ where: { slug, isActive: true } });
    if (dbTour) {
      return {
        slug:               dbTour.slug,
        title:              dbTour.title,
        subtitle:           dbTour.subtitle ?? '',
        location:           dbTour.location,
        cities:             dbTour.cities,
        duration:           dbTour.duration,
        maxGroupSize:       dbTour.maxGroupSize,
        languages:          dbTour.languages,
        rating:             dbTour.rating,
        reviewCount:        dbTour.reviewCount,
        category:           dbTour.category as Tour['category'],
        badge:              dbTour.badge as Tour['badge'],
        images:             dbTour.images,
        highlights:         dbTour.highlights,
        description:        dbTour.description,
        includes:           dbTour.includes,
        excludes:           dbTour.excludes,
        itinerary:          (dbTour.itinerary as unknown as Tour['itinerary']) ?? [],
        options:            (dbTour.options  as unknown as TourOption[]) ?? [],
        meetingPoint:       dbTour.meetingPoint ?? '',
        importantInfo:      dbTour.importantInfo,
        reviews:            (dbTour.reviews  as unknown as Tour['reviews']) ?? [],
        primaryLocation:    dbTour.primaryLocation,
        tags:               dbTour.tags,
        priceFrom:          dbTour.priceFrom,
        isFeatured:         dbTour.isFeatured,
        isPopular:          dbTour.isPopular,
        instantConfirmation: dbTour.instantConfirmation,
      };
    }
  } catch {
    // DB unavailable – fall through to static
  }
  // Fallback: static catalogue (until DB is fully seeded)
  return getTourBySlug(slug) ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateBookingRef(): string {
  const now  = new Date();
  const yy   = String(now.getFullYear()).slice(-2);
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `TR-${yy}${mm}${dd}-${rand}`;
}

// ─── POST /api/tours/bookings ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tourSlug,
      tourDate,
      tourOptionId,
      adultQty,
      childQty,
      customerName,
      customerEmail,
      customerPhone,
      specialNotes,
      paymentMethod,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!tourSlug)    return NextResponse.json({ error: 'Tour slug is required.'    }, { status: 400 });
    if (!tourDate)    return NextResponse.json({ error: 'Tour date is required.'    }, { status: 400 });
    if (!tourOptionId) return NextResponse.json({ error: 'Tour option is required.' }, { status: 400 });
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Customer name, email and phone are required.' }, { status: 400 });
    }
    const adults   = Number(adultQty)  || 0;
    const children = Number(childQty)  || 0;
    if (adults + children === 0) {
      return NextResponse.json({ error: 'At least one participant required.' }, { status: 400 });
    }

    // ── Validate tour + option (DB-first, static fallback) ───────────────────
    const tour = await resolveTour(tourSlug);
    if (!tour) return NextResponse.json({ error: 'Tour not found.' }, { status: 404 });

    const option = tour.options.find(o => o.id === tourOptionId);
    if (!option) return NextResponse.json({ error: 'Tour option not found.' }, { status: 404 });

    if (option.availability === 'full') {
      return NextResponse.json({ error: 'Sorry, this time slot is sold out.' }, { status: 409 });
    }

    const adultPrice = option.pricePerPerson;
    const childPrice = option.childPrice ?? 0;
    const totalPrice = adults * adultPrice + children * childPrice;

    // ── Unique booking ref ────────────────────────────────────────────────────
    let bookingRef = generateBookingRef();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.tourBooking.findUnique({ where: { bookingRef } });
      if (!exists) break;
      bookingRef = generateBookingRef();
    }

    // ── Logged-in user ────────────────────────────────────────────────────────
    const session = await getUserFromCookies();

    // ── Create booking ────────────────────────────────────────────────────────
    const booking = await prisma.tourBooking.create({
      data: {
        bookingRef,
        tourSlug,
        tourTitle:    tour.title,
        bookingDate:  new Date(tourDate),
        tourTime:     option.time,
        tourOptionId,
        optionLabel:  option.label ?? null,
        adultQty:     adults,
        childQty:     children,
        adultPrice,
        childPrice,
        totalPrice,
        customerName:  customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        notes:         specialNotes?.trim() || null,
        paymentMethod: paymentMethod ?? null,
        userId:        session?.id ?? null,
        status:        'CONFIRMED',
        paymentStatus: 'UNPAID',
      },
    });

    // ── Award loyalty points (50 per tour booking) ────────────────────────────
    if (session?.id) {
      awardPoints(
        session.id,
        50,
        'EARN',
        `Tour booking: ${tour.title}`,
        bookingRef,
      ).catch(() => {});
    }

    // ── WhatsApp admin alert ──────────────────────────────────────────────────
    sendTourBookingToAdmin({
      bookingRef:    booking.bookingRef,
      tourTitle:     booking.tourTitle,
      bookingDate:   booking.bookingDate,
      tourTime:      booking.tourTime,
      optionLabel:   booking.optionLabel,
      adultQty:      booking.adultQty,
      childQty:      booking.childQty,
      totalPrice:    booking.totalPrice,
      customerName:  booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      notes:         booking.notes,
    }).catch(() => {});

    // ── Send confirmation email ────────────────────────────────────────────────
    sendTourBookingEmail({
      bookingRef,
      customerName:  customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      tourTitle:     tour.title,
      bookingDate:   new Date(tourDate),
      tourTime:      option.time,
      optionLabel:   option.label ?? null,
      adultQty:      adults,
      childQty:      children,
      adultPrice,
      childPrice,
      totalPrice,
      meetingPoint:  tour.meetingPoint,
      notes:         specialNotes?.trim() || null,
    }).catch(() => {});

    // Fire-and-forget confirmation email (with slug + WhatsApp)
    sendTourBookingConfirmationEmail({
      bookingRef:    booking.bookingRef,
      customerName:  booking.customerName,
      customerEmail: booking.customerEmail,
      tourTitle:     booking.tourTitle,
      tourSlug:      booking.tourSlug,
      optionLabel:   booking.optionLabel,
      bookingDate:   booking.bookingDate,
      adultQty:      booking.adultQty,
      childQty:      booking.childQty,
      adultPrice:    booking.adultPrice,
      childPrice:    booking.childPrice,
      totalPrice:    booking.totalPrice,
      notes:         booking.notes,
    }).catch(err => console.error('[tour-booking] email error:', err));

    return NextResponse.json({ success: true, data: { id: booking.id, bookingRef } });
  } catch (err) {
    console.error('[POST /api/tours/bookings]', err);
    return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 });
  }
}

// ─── GET /api/tours/bookings ─────────────────────────────────────────────────
// • No params  → returns authenticated user's bookings
// • ?email=…   → tracking lookup by email (public)
// • ?ref=…     → tracking lookup by booking ref (public)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase();
  const ref   = searchParams.get('ref');

  // ── Public tracking lookup (by email or ref) ────────────────────────────────
  if (email || ref) {
    const booking = ref
      ? await prisma.tourBooking.findUnique({ where: { bookingRef: ref } })
      : await prisma.tourBooking.findFirst({ where: { customerEmail: email! }, orderBy: { createdAt: 'desc' } });

    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: booking });
  }

  // ── Authenticated: return all bookings for logged-in user ───────────────────
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookings = await prisma.tourBooking.findMany({
    where:   { userId: session.id },
    orderBy: { createdAt: 'desc' },
    select:  {
      id: true, bookingRef: true, tourTitle: true, bookingDate: true,
      adultQty: true, childQty: true, totalPrice: true,
      status: true, createdAt: true,
    },
  });
  return NextResponse.json({ bookings });
}
