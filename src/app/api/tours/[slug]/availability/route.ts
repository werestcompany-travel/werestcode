export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  params: { slug: string };
}

type DayStatus = 'available' | 'limited' | 'full' | 'blocked';

interface DayData {
  booked: number;
  maxCapacity: number;
  isBlocked: boolean;
  status: DayStatus;
}

function computeStatus(booked: number, maxCapacity: number, isBlocked: boolean): DayStatus {
  if (isBlocked) return 'blocked';
  if (booked >= maxCapacity) return 'full';
  if (booked >= maxCapacity * 0.7) return 'limited';
  return 'available';
}

// GET /api/tours/[slug]/availability?month=2025-06
export async function GET(req: NextRequest, { params }: Params) {
  try {
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get('month'); // e.g. "2025-06"

  let year: number;
  let month: number; // 0-indexed

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-').map(Number);
    year = y;
    month = m - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // last day of month

  // Get default maxGroupSize from DB (fallback 15)
  const dbTour = await prisma.tour.findUnique({ where: { slug: params.slug }, select: { maxGroupSize: true } });
  const defaultCapacity = dbTour?.maxGroupSize ?? 15;

  // Fetch TourAvailability overrides for the month
  const availabilityRecords = await prisma.tourAvailability.findMany({
    where: {
      tourSlug: params.slug,
      date: { gte: startDate, lte: endDate },
    },
  });

  // Build a map: dateStr -> TourAvailability record
  const availMap = new Map<string, typeof availabilityRecords[0]>();
  for (const rec of availabilityRecords) {
    const key = rec.date.toISOString().slice(0, 10);
    // If multiple option overrides exist, prefer the one with lowest remaining capacity
    const existing = availMap.get(key);
    if (!existing || rec.booked > existing.booked) {
      availMap.set(key, rec);
    }
  }

  // Fetch actual TourBooking counts for the month
  const tourBookings = await prisma.tourBooking.groupBy({
    by: ['bookingDate'],
    where: {
      tourSlug: params.slug,
      bookingDate: { gte: startDate, lte: endDate },
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    _sum: { adultQty: true, childQty: true },
  });

  const bookingCountMap = new Map<string, number>();
  for (const row of tourBookings) {
    const key = new Date(row.bookingDate).toISOString().slice(0, 10);
    const count = (row._sum.adultQty ?? 0) + (row._sum.childQty ?? 0);
    bookingCountMap.set(key, count);
  }

  // Build result for every day in the month
  const dates: Record<string, DayData> = {};
  const daysInMonth = endDate.getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().slice(0, 10);

    const record = availMap.get(dateStr);
    const realBookings = bookingCountMap.get(dateStr) ?? 0;

    const isBlocked = record?.isBlocked ?? false;
    const maxCapacity = record?.maxCapacity ?? defaultCapacity;
    // Use the higher of: explicit record.booked or actual TourBooking count
    const booked = Math.max(record?.booked ?? 0, realBookings);
    const status = computeStatus(booked, maxCapacity, isBlocked);

    dates[dateStr] = { booked, maxCapacity, isBlocked, status };
  }

  return NextResponse.json({ dates, month: `${year}-${String(month + 1).padStart(2, '0')}` });
  } catch {
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
  }
}
