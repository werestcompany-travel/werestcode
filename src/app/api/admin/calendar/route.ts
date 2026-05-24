export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD

  // Default to today
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const [transfers, tours, attractions] = await Promise.all([
    prisma.booking.findMany({
      where: { pickupDate: { gte: targetDate, lt: nextDay } },
      select: {
        id: true, bookingRef: true, pickupTime: true,
        pickupAddress: true, dropoffAddress: true,
        vehicleType: true, passengers: true,
        customerName: true, customerPhone: true,
        currentStatus: true, driverName: true, totalPrice: true,
      },
      orderBy: { pickupTime: 'asc' },
    }),
    prisma.tourBooking.findMany({
      where: { bookingDate: { gte: targetDate, lt: nextDay } },
      select: {
        id: true, bookingRef: true, tourTime: true,
        tourTitle: true, adultQty: true, childQty: true,
        customerName: true, customerPhone: true,
        status: true, totalPrice: true,
      },
      orderBy: { tourTime: 'asc' },
    }),
    prisma.attractionBooking.findMany({
      where: { visitDate: { gte: targetDate, lt: nextDay } },
      select: {
        id: true, bookingRef: true, attractionName: true,
        adultQty: true, customerName: true, customerPhone: true,
        status: true, totalPrice: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Normalise to a unified list
  type CalendarItem = {
    id: string; bookingRef: string; time: string | null; type: 'transfer' | 'tour' | 'attraction';
    title: string; customerName: string; customerPhone: string; status: string;
    detail: string; totalPrice: number; driverName?: string | null; pax?: number;
  };

  const items: CalendarItem[] = [
    ...transfers.map(b => ({
      id: b.id, bookingRef: b.bookingRef, time: b.pickupTime, type: 'transfer' as const,
      title: `${b.pickupAddress.split(',')[0]} → ${b.dropoffAddress.split(',')[0]}`,
      customerName: b.customerName, customerPhone: b.customerPhone,
      status: b.currentStatus, detail: b.vehicleType, totalPrice: b.totalPrice,
      driverName: b.driverName, pax: b.passengers,
    })),
    ...tours.map(b => ({
      id: b.id, bookingRef: b.bookingRef, time: b.tourTime ?? null, type: 'tour' as const,
      title: b.tourTitle, customerName: b.customerName, customerPhone: b.customerPhone,
      status: b.status, detail: `${b.adultQty + b.childQty} pax`, totalPrice: b.totalPrice,
    })),
    ...attractions.map(b => ({
      id: b.id, bookingRef: b.bookingRef, time: null, type: 'attraction' as const,
      title: b.attractionName, customerName: b.customerName, customerPhone: b.customerPhone,
      status: b.status, detail: `${b.adultQty} adult`, totalPrice: b.totalPrice,
    })),
  ];

  // Sort by time (nulls last)
  items.sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const totalRevenue = items.reduce((s, i) => s + i.totalPrice, 0);

  return NextResponse.json({ items, totalRevenue, date: targetDate.toISOString() });
}
