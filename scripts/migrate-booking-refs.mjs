/**
 * One-time migration: converts all legacy booking refs to the new format.
 * Run with: node scripts/migrate-booking-refs.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('🔄 Starting booking reference migration...\n');

  /* ── Private Transfers: WR-* → WRTF-DDMMYYPAX### ───────────────────────── */
  const transfers = await prisma.booking.findMany({
    where: { bookingRef: { not: { startsWith: 'WRTF-' } } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, bookingRef: true, pickupDate: true, passengers: true },
  });

  console.log(`Found ${transfers.length} transfer booking(s) to migrate`);

  const tfCounter = {};
  for (const b of transfers) {
    const dd = String(b.pickupDate.getDate()).padStart(2, '0');
    const mm = String(b.pickupDate.getMonth() + 1).padStart(2, '0');
    const yy = String(b.pickupDate.getFullYear()).slice(-2);
    const pp = String(b.passengers).padStart(2, '0');
    const prefix = `WRTF-${dd}${mm}${yy}${pp}`;

    tfCounter[prefix] = (tfCounter[prefix] ?? 0) + 1;
    const newRef = `${prefix}${String(tfCounter[prefix]).padStart(3, '0')}`;

    await prisma.booking.update({ where: { id: b.id }, data: { bookingRef: newRef } });
    console.log(`  ✅ Transfer  ${b.bookingRef}  →  ${newRef}`);
  }

  /* ── Tours: TR-* → WRTOUR-DDMMYYPAX### ─────────────────────────────────── */
  const tours = await prisma.tourBooking.findMany({
    where: { bookingRef: { not: { startsWith: 'WRTOUR-' } } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, bookingRef: true, bookingDate: true, adultQty: true, childQty: true },
  });

  console.log(`\nFound ${tours.length} tour booking(s) to migrate`);

  const tourCounter = {};
  for (const b of tours) {
    const dd = String(b.bookingDate.getDate()).padStart(2, '0');
    const mm = String(b.bookingDate.getMonth() + 1).padStart(2, '0');
    const yy = String(b.bookingDate.getFullYear()).slice(-2);
    const pp = String(b.adultQty + b.childQty).padStart(2, '0');
    const prefix = `WRTOUR-${dd}${mm}${yy}${pp}`;

    tourCounter[prefix] = (tourCounter[prefix] ?? 0) + 1;
    const newRef = `${prefix}${String(tourCounter[prefix]).padStart(3, '0')}`;

    await prisma.tourBooking.update({ where: { id: b.id }, data: { bookingRef: newRef } });
    console.log(`  ✅ Tour      ${b.bookingRef}  →  ${newRef}`);
  }

  /* ── Attraction Tickets: AT-* → WRTK-DDMMYYPAX### ─────────────────────── */
  const attractions = await prisma.attractionBooking.findMany({
    where: { bookingRef: { not: { startsWith: 'WRTK-' } } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, bookingRef: true, visitDate: true, adultQty: true, childQty: true, infantQty: true },
  });

  console.log(`\nFound ${attractions.length} attraction booking(s) to migrate`);

  const tkCounter = {};
  for (const b of attractions) {
    const dd = String(b.visitDate.getDate()).padStart(2, '0');
    const mm = String(b.visitDate.getMonth() + 1).padStart(2, '0');
    const yy = String(b.visitDate.getFullYear()).slice(-2);
    const pp = String(b.adultQty + b.childQty + b.infantQty).padStart(2, '0');
    const prefix = `WRTK-${dd}${mm}${yy}${pp}`;

    tkCounter[prefix] = (tkCounter[prefix] ?? 0) + 1;
    const newRef = `${prefix}${String(tkCounter[prefix]).padStart(3, '0')}`;

    await prisma.attractionBooking.update({ where: { id: b.id }, data: { bookingRef: newRef } });
    console.log(`  ✅ Attraction ${b.bookingRef}  →  ${newRef}`);
  }

  console.log('\n✅ Migration complete!');
  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error('❌ Migration failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
