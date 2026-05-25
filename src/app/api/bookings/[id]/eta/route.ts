import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  params: { id: string };
}

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      status: string;
      duration: { value: number; text: string };
      distance: { value: number; text: string };
    }>;
  }>;
  status: string;
}

// ─── GET /api/bookings/[id]/eta ───────────────────────────────────────────────
// Calculates driver ETA to the pickup point using Google Maps Distance Matrix.
// Accepts:  /api/bookings/[id]/eta          (booking by DB id)
//           /api/bookings/[id]/eta?ref=WRTF-xxx  (booking by ref, id param ignored)
// Returns:  { etaMinutes, etaText, driverLat, driverLng, updatedAt } | { etaMinutes: null }
// Cached:   30 seconds via Cache-Control

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const refParam = req.nextUrl.searchParams.get('ref');

    // Look up booking
    const booking = await prisma.booking.findFirst({
      where: refParam
        ? { bookingRef: refParam.toUpperCase() }
        : { id: params.id },
      select: {
        id:           true,
        driverId:     true,
        currentStatus: true,
        pickupLat:    true,
        pickupLng:    true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 },
      );
    }

    // No driver assigned
    if (!booking.driverId) {
      return NextResponse.json(
        { success: true, etaMinutes: null, reason: 'no_driver' },
        { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } },
      );
    }

    // Get latest driver location
    const latest = await prisma.driverLocation.findFirst({
      where: {
        driverId:  booking.driverId,
        bookingId: booking.id,
      },
      orderBy: { createdAt: 'desc' },
      select: { lat: true, lng: true, createdAt: true },
    });

    // Fallback to driver's current position if no booking-scoped location
    let driverLat: number | null = latest?.lat ?? null;
    let driverLng: number | null = latest?.lng ?? null;
    let updatedAt: string | null = latest?.createdAt.toISOString() ?? null;

    if (!driverLat || !driverLng) {
      const driver = await prisma.driver.findUnique({
        where:  { id: booking.driverId },
        select: { currentLat: true, currentLng: true },
      });
      driverLat = driver?.currentLat ?? null;
      driverLng = driver?.currentLng ?? null;
      updatedAt = driverLat ? new Date().toISOString() : null;
    }

    if (!driverLat || !driverLng) {
      return NextResponse.json(
        { success: true, etaMinutes: null, reason: 'no_location' },
        { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } },
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
    if (!apiKey) {
      console.warn('[bookings/eta] GOOGLE_MAPS_SERVER_API_KEY not set');
      return NextResponse.json(
        { success: true, etaMinutes: null, reason: 'no_api_key' },
        { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } },
      );
    }

    // Call Google Maps Distance Matrix API
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins',      `${driverLat},${driverLng}`);
    url.searchParams.set('destinations', `${booking.pickupLat},${booking.pickupLng}`);
    url.searchParams.set('mode',         'driving');
    url.searchParams.set('key',          apiKey);

    const gmRes = await fetch(url.toString(), {
      next: { revalidate: 0 }, // don't cache at fetch level — we use Cache-Control header
    });

    if (!gmRes.ok) {
      console.error('[bookings/eta] Google Maps API HTTP error', gmRes.status);
      return NextResponse.json(
        { success: true, etaMinutes: null, reason: 'maps_error' },
        { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } },
      );
    }

    const gmData = (await gmRes.json()) as DistanceMatrixResponse;

    const element = gmData?.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      console.warn('[bookings/eta] Google Maps element status:', element?.status);
      return NextResponse.json(
        { success: true, etaMinutes: null, reason: 'maps_no_route' },
        { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } },
      );
    }

    const etaSeconds = element.duration.value;
    const etaMinutes = Math.ceil(etaSeconds / 60);
    const etaText    = element.duration.text; // e.g. "7 mins"

    return NextResponse.json(
      {
        success:    true,
        etaMinutes,
        etaText,
        driverLat,
        driverLng,
        updatedAt,
      },
      { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } },
    );
  } catch (err) {
    console.error('[bookings/eta] GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
