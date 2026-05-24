export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export interface NotificationBooking {
  id:           string;
  ref:          string;
  type:         'transfer' | 'tour' | 'attraction';
  customerName: string;
  customerPhone: string;
  time:         string;
  service:      string;
  status:       string;
}

export interface NotificationGroup {
  label:    'Today' | 'Tomorrow' | 'In 3 Days';
  date:     string;           // ISO date string YYYY-MM-DD
  bookings: NotificationBooking[];
}

export interface NotificationsData {
  groups: NotificationGroup[];
  total:  number;             // total upcoming bookings across all groups
}

function dayRange(date: Date): { gte: Date; lt: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { gte: start, lt: end };
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now       = new Date();
  const today     = new Date(now); today.setHours(0, 0, 0, 0);
  const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const in3Days   = new Date(today); in3Days.setDate(today.getDate() + 3);

  const targets: { label: NotificationGroup['label']; date: Date }[] = [
    { label: 'Today',     date: today    },
    { label: 'Tomorrow',  date: tomorrow },
    { label: 'In 3 Days', date: in3Days  },
  ];

  const groups: NotificationGroup[] = [];

  for (const { label, date } of targets) {
    const range = dayRange(date);
    const bookings: NotificationBooking[] = [];

    /* Transfers */
    try {
      const transfers = await prisma.booking.findMany({
        where: {
          pickupDate:    range,
          currentStatus: { notIn: ['CANCELLED', 'COMPLETED'] },
        },
        orderBy: { pickupTime: 'asc' },
        select: {
          id: true, bookingRef: true,
          customerName: true, customerPhone: true,
          pickupTime: true, vehicleType: true, currentStatus: true,
        },
      });
      for (const b of transfers) {
        bookings.push({
          id:           b.id,
          ref:          b.bookingRef,
          type:         'transfer',
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          time:         b.pickupTime,
          service:      b.vehicleType,
          status:       b.currentStatus,
        });
      }
    } catch { /* DB unavailable */ }

    /* Tours */
    try {
      const tours = await prisma.tourBooking.findMany({
        where: {
          bookingDate: range,
          status:      { notIn: ['CANCELLED'] },
        },
        orderBy: { tourTime: 'asc' },
        select: {
          id: true, bookingRef: true,
          customerName: true, customerPhone: true,
          tourTime: true, tourTitle: true, status: true,
        },
      });
      for (const b of tours) {
        bookings.push({
          id:           b.id,
          ref:          b.bookingRef,
          type:         'tour',
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          time:         b.tourTime ?? '',
          service:      b.tourTitle,
          status:       b.status,
        });
      }
    } catch { /* DB unavailable */ }

    /* Attraction Tickets */
    try {
      const attractions = await prisma.attractionBooking.findMany({
        where: {
          visitDate: range,
          status:    { notIn: ['CANCELLED'] },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true, bookingRef: true,
          customerName: true, customerPhone: true,
          attractionName: true, packageName: true, status: true,
        },
      });
      for (const b of attractions) {
        bookings.push({
          id:           b.id,
          ref:          b.bookingRef,
          type:         'attraction',
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          time:         '',
          service:      `${b.attractionName} — ${b.packageName}`,
          status:       b.status,
        });
      }
    } catch { /* DB unavailable */ }

    // Sort by time within each group (transfers/tours by time, attractions at end)
    bookings.sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

    groups.push({ label, date: toISO(date), bookings });
  }

  const total = groups.reduce((sum, g) => sum + g.bookings.length, 0);

  return NextResponse.json({ success: true, data: { groups, total } });
}
