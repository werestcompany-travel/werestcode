export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token || !(await verifyAdminToken(token))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startOfToday = new Date(now); startOfToday.setHours(0,0,0,0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // ── Revenue by day (last 30 days) ─────────────────────────────────────────
  const [transfersByDay, toursByDay, attractionsByDay] = await Promise.all([
    prisma.booking.groupBy({
      by: ['pickupDate'],
      where: { pickupDate: { gte: thirtyDaysAgo }, paymentStatus: { in: ['PAID', 'paid'] } },
      _sum: { totalPrice: true },
      _count: { id: true },
      orderBy: { pickupDate: 'asc' },
    }),
    prisma.tourBooking.groupBy({
      by: ['bookingDate'],
      where: { bookingDate: { gte: thirtyDaysAgo }, paymentStatus: { in: ['PAID', 'paid'] } },
      _sum: { totalPrice: true },
      _count: { id: true },
      orderBy: { bookingDate: 'asc' },
    }),
    prisma.attractionBooking.groupBy({
      by: ['visitDate'],
      where: { visitDate: { gte: thirtyDaysAgo }, paymentStatus: { in: ['PAID', 'paid'] } },
      _sum: { totalPrice: true },
      _count: { id: true },
      orderBy: { visitDate: 'asc' },
    }),
  ]);

  // Build date map for last 30 days
  const dateMap: Record<string, { revenue: number; bookings: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    dateMap[d.toISOString().slice(0, 10)] = { revenue: 0, bookings: 0 };
  }
  transfersByDay.forEach(r => {
    const k = new Date(r.pickupDate).toISOString().slice(0, 10);
    if (dateMap[k]) { dateMap[k].revenue += r._sum.totalPrice ?? 0; dateMap[k].bookings += r._count.id; }
  });
  toursByDay.forEach(r => {
    const k = new Date(r.bookingDate).toISOString().slice(0, 10);
    if (dateMap[k]) { dateMap[k].revenue += r._sum.totalPrice ?? 0; dateMap[k].bookings += r._count.id; }
  });
  attractionsByDay.forEach(r => {
    const k = new Date(r.visitDate).toISOString().slice(0, 10);
    if (dateMap[k]) { dateMap[k].revenue += r._sum.totalPrice ?? 0; dateMap[k].bookings += r._count.id; }
  });
  const revenueByDay = Object.entries(dateMap).map(([date, v]) => ({ date, ...v }));

  // ── Service mix ───────────────────────────────────────────────────────────
  const [tfRevTotal, tourRevTotal, attrRevTotal] = await Promise.all([
    prisma.booking.aggregate({ where: { paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true }, _count: { id: true } }),
    prisma.tourBooking.aggregate({ where: { paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true }, _count: { id: true } }),
    prisma.attractionBooking.aggregate({ where: { paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true }, _count: { id: true } }),
  ]);
  const serviceMix = [
    { name: 'Transfers',   revenue: tfRevTotal._sum.totalPrice ?? 0,   bookings: tfRevTotal._count.id,   fill: '#2534ff' },
    { name: 'Tours',       revenue: tourRevTotal._sum.totalPrice ?? 0,  bookings: tourRevTotal._count.id,  fill: '#f59e0b' },
    { name: 'Attractions', revenue: attrRevTotal._sum.totalPrice ?? 0,  bookings: attrRevTotal._count.id,  fill: '#10b981' },
  ];

  // ── Top routes ────────────────────────────────────────────────────────────
  const topRoutes = await prisma.booking.groupBy({
    by: ['pickupAddress', 'dropoffAddress'],
    where: { paymentStatus: { in: ['PAID','paid'] } },
    _count: { id: true },
    _sum: { totalPrice: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const allRevThisMonth = (await Promise.all([
    prisma.booking.aggregate({ where: { createdAt: { gte: startOfMonth }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
    prisma.tourBooking.aggregate({ where: { createdAt: { gte: startOfMonth }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
    prisma.attractionBooking.aggregate({ where: { createdAt: { gte: startOfMonth }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
  ])).reduce((s, r) => s + (r._sum.totalPrice ?? 0), 0);

  const allRevLastMonth = (await Promise.all([
    prisma.booking.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
    prisma.tourBooking.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
    prisma.attractionBooking.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
  ])).reduce((s, r) => s + (r._sum.totalPrice ?? 0), 0);

  const allBookingsToday = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.tourBooking.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.attractionBooking.count({ where: { createdAt: { gte: startOfToday } } }),
  ]);

  const allRevToday = (await Promise.all([
    prisma.booking.aggregate({ where: { createdAt: { gte: startOfToday }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
    prisma.tourBooking.aggregate({ where: { createdAt: { gte: startOfToday }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
    prisma.attractionBooking.aggregate({ where: { createdAt: { gte: startOfToday }, paymentStatus: { in: ['PAID','paid'] } }, _sum: { totalPrice: true } }),
  ])).reduce((s, r) => s + (r._sum.totalPrice ?? 0), 0);

  const totalRevAllTime = serviceMix.reduce((s, m) => s + m.revenue, 0);
  const totalBookingsAllTime = serviceMix.reduce((s, m) => s + m.bookings, 0);

  // ── Repeat customer rate ───────────────────────────────────────────────────
  const repeatCustomers = await prisma.booking.groupBy({
    by: ['customerEmail'],
    _count: { id: true },
    having: { id: { _count: { gt: 1 } } },
  });
  const totalCustomers = await prisma.booking.groupBy({ by: ['customerEmail'] });
  const repeatRate = totalCustomers.length > 0 ? (repeatCustomers.length / totalCustomers.length) * 100 : 0;

  return NextResponse.json({
    kpis: {
      todayRevenue: allRevToday,
      todayBookings: allBookingsToday.reduce((s, n) => s + n, 0),
      monthRevenue: allRevThisMonth,
      lastMonthRevenue: allRevLastMonth,
      monthGrowth: allRevLastMonth > 0 ? ((allRevThisMonth - allRevLastMonth) / allRevLastMonth) * 100 : 0,
      totalRevenue: totalRevAllTime,
      totalBookings: totalBookingsAllTime,
      repeatRate,
    },
    revenueByDay,
    serviceMix,
    topRoutes: topRoutes.map(r => ({
      route: `${r.pickupAddress.split(',')[0]} → ${r.dropoffAddress.split(',')[0]}`,
      count: r._count.id,
      revenue: r._sum.totalPrice ?? 0,
    })),
  });
}
