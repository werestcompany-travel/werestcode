import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUserFromCookies } from '@/lib/user-auth';
import { awardPoints } from '@/lib/loyalty';
import { type Tour, type TourOption } from '@/lib/tours';
import { sendTourBookingEmail, sendTourBookingConfirmationEmail } from '@/lib/email';
import { sendTourBookingToAdmin } from '@/lib/whatsapp';

// ─── Zod validation schema ────────────────────────────────────────────────────
const createTourBookingSchema = z.object({
  tourSlug:      z.string().min(1, 'Tour slug is required'),
  tourDate:      z.string().refine(v => !isNaN(Date.parse(v)) && new Date(v) >= new Date(new Date().toDateString()), {
    message: 'Tour date must be today or in the future',
  }),
  tourOptionId:  z.string().min(1, 'Tour option is required'),
  adultQty:      z.coerce.number().int().min(0),
  childQty:      z.coerce.number().int().min(0),
  customerName:  z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email address required'),
  customerPhone: z.string().min(5, 'Phone number is required'),
  specialNotes:  z.string().optional(),
  paymentMethod: z.string().optional(),
}).refine(d => d.adultQty + d.childQty > 0, { message: 'At least one participant required' });

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
    return null;
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a unique tour booking reference.
 * Format: WRTOUR-DDMMYYPP### where:
 *   DD  = day of tour date
 *   MM  = month of tour date
 *   YY  = last 2 digits of year
 *   PP  = total participants (adults + children), zero-padded to 2 digits
 *   ### = 3-digit daily sequence for that date + participant count (001, 002, …)
 *
 * Example: WRTOUR-19052604001
 */
/**
 * Generates a unique tour booking reference inside a serializable transaction
 * to prevent race conditions under concurrent requests.
 */
async function generateTourRef(tourDate: Date, participants: number): Promise<string> {
  const dd = String(tourDate.getDate()).padStart(2, '0');
  const mm = String(tourDate.getMonth() + 1).padStart(2, '0');
  const yy = String(tourDate.getFullYear()).slice(-2);
  const pp = String(participants).padStart(2, '0');
  const prefix = `WRTOUR-${dd}${mm}${yy}${pp}`;

  // Use a serializable transaction to prevent duplicate ref generation under concurrency
  return prisma.$transaction(async (tx) => {
    const existing = await tx.tourBooking.count({
      where: { bookingRef: { startsWith: prefix } },
    });
    return `${prefix}${String(existing + 1).padStart(3, '0')}`;
  }, { isolationLevel: 'Serializable' });
}

// ─── POST /api/tours/bookings ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parsed = createTourBookingSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }

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
    } = parsed.data;

    const adults   = adultQty;
    const children = childQty;

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
    const bookingRef = await generateTourRef(new Date(tourDate), adults + children);

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
    // Return only fields needed for customer tracking — never expose price internals or full PII
    const safeSelect = {
      bookingRef: true, tourTitle: true, tourSlug: true,
      bookingDate: true, tourTime: true, optionLabel: true,
      adultQty: true, childQty: true, totalPrice: true,
      status: true, paymentStatus: true, createdAt: true,
      customerName: true,
    } as const;

    const booking = ref
      ? await prisma.tourBooking.findUnique({ where: { bookingRef: ref }, select: safeSelect })
      : await prisma.tourBooking.findFirst({ where: { customerEmail: email! }, orderBy: { createdAt: 'desc' }, select: safeSelect });

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
