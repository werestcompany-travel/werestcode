export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { VehicleType } from '@prisma/client';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface DispatchDetail {
  bookingRef: string;
  driverName: string | null;
  reason: string;
}

export async function POST() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Fetch all pending unassigned bookings
    const pendingBookings = await prisma.booking.findMany({
      where: { driverId: null, currentStatus: 'PENDING' },
      orderBy: [{ pickupDate: 'asc' }, { pickupTime: 'asc' }],
    });

    if (pendingBookings.length === 0) {
      return NextResponse.json({ assigned: 0, failed: [], details: [] });
    }

    // Fetch all active drivers with their vehicles and today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      include: {
        vehicles: { where: { isActive: true } },
        bookings: {
          where: {
            pickupDate: { gte: today, lt: tomorrow },
            currentStatus: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
          select: { id: true },
        },
      },
    });

    let assignedCount = 0;
    const failed: string[] = [];
    const details: DispatchDetail[] = [];

    // Track assignment counts within this batch (so we don't double-assign)
    const inSessionBookingCounts = new Map<string, number>(
      drivers.map((d) => [d.id, d.bookings.length])
    );

    for (const booking of pendingBookings) {
      // Find eligible drivers: must have a vehicle matching the booking vehicle type
      const eligible = drivers.filter((d) =>
        d.vehicles.some((v) => v.vehicleType === (booking.vehicleType as VehicleType))
      );

      if (eligible.length === 0) {
        failed.push(booking.bookingRef);
        details.push({
          bookingRef: booking.bookingRef,
          driverName: null,
          reason: `No driver has a ${booking.vehicleType} vehicle`,
        });
        continue;
      }

      // Score each eligible driver: lower score = better candidate
      const scored = eligible.map((driver) => {
        let score = 0;

        // Prefer online drivers (lower score = better)
        if (!driver.isOnline) score += 100;

        // Prefer fewer bookings today
        const todayCount = inSessionBookingCounts.get(driver.id) ?? 0;
        score += todayCount * 10;

        // Prefer nearest driver if GPS available
        if (
          driver.currentLat !== null &&
          driver.currentLng !== null &&
          driver.currentLat !== undefined &&
          driver.currentLng !== undefined
        ) {
          const distKm = haversineKm(
            driver.currentLat,
            driver.currentLng,
            booking.pickupLat,
            booking.pickupLng
          );
          score += distKm * 0.5; // 0.5 pts per km
        } else {
          score += 25; // penalty for no GPS — treat as 50km away equivalent
        }

        return { driver, score };
      });

      scored.sort((a, b) => a.score - b.score);
      const best = scored[0].driver;

      // Assign the booking
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            driverId: best.id,
            driverName: best.name,
            currentStatus: 'DRIVER_CONFIRMED',
          },
        }),
        prisma.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            status: 'DRIVER_CONFIRMED',
            note: 'Auto-dispatched by system',
            updatedBy: `admin:${admin.name}`,
          },
        }),
      ]);

      // Update in-session count so later bookings factor this in
      inSessionBookingCounts.set(best.id, (inSessionBookingCounts.get(best.id) ?? 0) + 1);

      assignedCount++;
      details.push({
        bookingRef: booking.bookingRef,
        driverName: best.name,
        reason: `Assigned — score: ${scored[0].score.toFixed(1)}`,
      });
    }

    return NextResponse.json({ assigned: assignedCount, failed, details });
  } catch (err) {
    console.error('[admin/dispatch/auto] POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
