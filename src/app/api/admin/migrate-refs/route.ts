export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

/**
 * POST /api/admin/migrate-refs
 *
 * One-time migration: converts all legacy booking references to the new formats.
 *
 *   Private Transfers  WR-YYMMDD-XXXX  →  WRTF-DDMMYYPAX###
 *   Tours              TR-YYMMDD-XXXX  →  WRTOUR-DDMMYYPAX###
 *   Attraction Tickets AT-YYMMDD-XXXX  →  WRTK-DDMMYYPAX###
 *
 * Safe to run multiple times — already-migrated refs are skipped.
 */
export async function POST() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const results = {
    transfers:   { updated: 0, skipped: 0, refs: [] as { old: string; new: string }[] },
    tours:       { updated: 0, skipped: 0, refs: [] as { old: string; new: string }[] },
    attractions: { updated: 0, skipped: 0, refs: [] as { old: string; new: string }[] },
  };

  /* ── Private Transfers ───────────────────────────────────────────────────── */
  {
    // Load legacy bookings ordered by createdAt so sequence numbers are consistent
    const legacy = await prisma.booking.findMany({
      where: { bookingRef: { not: { startsWith: 'WRTF-' } } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, bookingRef: true, pickupDate: true, passengers: true },
    });

    // Group by prefix (DDMMYY + PP) and assign sequence numbers
    const counter: Record<string, number> = {};

    for (const b of legacy) {
      const dd = String(b.pickupDate.getDate()).padStart(2, '0');
      const mm = String(b.pickupDate.getMonth() + 1).padStart(2, '0');
      const yy = String(b.pickupDate.getFullYear()).slice(-2);
      const pp = String(b.passengers).padStart(2, '0');
      const prefix = `WRTF-${dd}${mm}${yy}${pp}`;

      counter[prefix] = (counter[prefix] ?? 0) + 1;
      const seq = String(counter[prefix]).padStart(3, '0');
      const newRef = `${prefix}${seq}`;

      await prisma.booking.update({ where: { id: b.id }, data: { bookingRef: newRef } });
      results.transfers.updated++;
      results.transfers.refs.push({ old: b.bookingRef, new: newRef });
    }

    results.transfers.skipped = await prisma.booking.count({
      where: { bookingRef: { startsWith: 'WRTF-' } },
    });
  }

  /* ── Tours ───────────────────────────────────────────────────────────────── */
  {
    const legacy = await prisma.tourBooking.findMany({
      where: { bookingRef: { not: { startsWith: 'WRTOUR-' } } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, bookingRef: true, bookingDate: true, adultQty: true, childQty: true },
    });

    const counter: Record<string, number> = {};

    for (const b of legacy) {
      const dd = String(b.bookingDate.getDate()).padStart(2, '0');
      const mm = String(b.bookingDate.getMonth() + 1).padStart(2, '0');
      const yy = String(b.bookingDate.getFullYear()).slice(-2);
      const total = b.adultQty + b.childQty;
      const pp = String(total).padStart(2, '0');
      const prefix = `WRTOUR-${dd}${mm}${yy}${pp}`;

      counter[prefix] = (counter[prefix] ?? 0) + 1;
      const seq = String(counter[prefix]).padStart(3, '0');
      const newRef = `${prefix}${seq}`;

      await prisma.tourBooking.update({ where: { id: b.id }, data: { bookingRef: newRef } });
      results.tours.updated++;
      results.tours.refs.push({ old: b.bookingRef, new: newRef });
    }

    results.tours.skipped = await prisma.tourBooking.count({
      where: { bookingRef: { startsWith: 'WRTOUR-' } },
    });
  }

  /* ── Attraction Tickets ──────────────────────────────────────────────────── */
  {
    const legacy = await prisma.attractionBooking.findMany({
      where: { bookingRef: { not: { startsWith: 'WRTK-' } } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, bookingRef: true, visitDate: true, adultQty: true, childQty: true, infantQty: true },
    });

    const counter: Record<string, number> = {};

    for (const b of legacy) {
      const dd = String(b.visitDate.getDate()).padStart(2, '0');
      const mm = String(b.visitDate.getMonth() + 1).padStart(2, '0');
      const yy = String(b.visitDate.getFullYear()).slice(-2);
      const total = b.adultQty + b.childQty + b.infantQty;
      const pp = String(total).padStart(2, '0');
      const prefix = `WRTK-${dd}${mm}${yy}${pp}`;

      counter[prefix] = (counter[prefix] ?? 0) + 1;
      const seq = String(counter[prefix]).padStart(3, '0');
      const newRef = `${prefix}${seq}`;

      await prisma.attractionBooking.update({ where: { id: b.id }, data: { bookingRef: newRef } });
      results.attractions.updated++;
      results.attractions.refs.push({ old: b.bookingRef, new: newRef });
    }

    results.attractions.skipped = await prisma.attractionBooking.count({
      where: { bookingRef: { startsWith: 'WRTK-' } },
    });
  }

  return NextResponse.json({ success: true, results });
}
