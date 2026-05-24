export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format    = searchParams.get('format') ?? 'json';
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : new Date(new Date().setDate(new Date().getDate() - 30));
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : new Date();
  endDate.setHours(23, 59, 59, 999);

  const [transfers, tours, attractions] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: startDate, lte: endDate }, currentStatus: { not: 'CANCELLED' } },
      select: {
        bookingRef: true, customerName: true, pickupDate: true,
        vehicleType: true, totalPrice: true, currentStatus: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tourBooking.findMany({
      where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
      select: {
        bookingRef: true, customerName: true, bookingDate: true,
        tourTitle: true, totalPrice: true, status: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.attractionBooking.findMany({
      where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
      select: {
        bookingRef: true, customerName: true, visitDate: true,
        attractionName: true, totalPrice: true, status: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const transferRevenue   = transfers.reduce((s, b) => s + (b.totalPrice ?? 0), 0);
  const tourRevenue       = tours.reduce((s, b) => s + (b.totalPrice ?? 0), 0);
  const attractionRevenue = attractions.reduce((s, b) => s + (b.totalPrice ?? 0), 0);
  const totalRevenue      = transferRevenue + tourRevenue + attractionRevenue;
  const totalBookings     = transfers.length + tours.length + attractions.length;

  if (format === 'csv') {
    const rows: string[] = ['Ref,Type,Customer,Date,Service,Amount,Status'];
    for (const b of transfers) {
      rows.push(`${b.bookingRef},Transfer,${b.customerName},${(b.pickupDate ?? b.createdAt).toString().slice(0, 10)},${b.vehicleType},${b.totalPrice},${b.currentStatus}`);
    }
    for (const b of tours) {
      rows.push(`${b.bookingRef},Tour,${b.customerName},${(b.bookingDate ?? b.createdAt).toString().slice(0, 10)},${b.tourTitle ?? ''},${b.totalPrice},${b.status}`);
    }
    for (const b of attractions) {
      rows.push(`${b.bookingRef},Attraction,${b.customerName},${(b.visitDate ?? b.createdAt).toString().slice(0, 10)},${b.attractionName ?? ''},${b.totalPrice},${b.status}`);
    }
    const csv = rows.join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="werest-report-${startDate.toISOString().slice(0, 10)}-to-${endDate.toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalRevenue,
        totalBookings,
        transferRevenue,
        tourRevenue,
        attractionRevenue,
        transferCount:   transfers.length,
        tourCount:       tours.length,
        attractionCount: attractions.length,
      },
      transfers,
      tours,
      attractions,
    },
  });
}
