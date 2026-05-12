export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateBookingRef, formatDate } from '@/lib/utils';
import { sendBookingToAdmin, sendCustomerBookingConfirmation } from '@/lib/whatsapp';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { createBookingSchema } from '@/lib/validation/booking';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';
import { calculateSurcharges } from '@/lib/surcharges';
import { VehicleType, type BookingDetail } from '@/types';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = rateLimit(`booking:${ip}`, LIMITS.booking);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many booking requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Invalid booking data';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const data = parsed.data;

    // Resolve add-on prices from DB (never trust client prices)
    const addOnIds = (data.selectedAddOns ?? []).map((a) => a.addOnId);
    const dbAddOns = addOnIds.length > 0
      ? await prisma.addOn.findMany({ where: { id: { in: addOnIds }, isActive: true } })
      : [];

    const resolvedAddOns = (data.selectedAddOns ?? []).map((a) => {
      const db = dbAddOns.find((d) => d.id === a.addOnId);
      return db ? { ...a, unitPrice: db.price, name: db.name } : null;
    }).filter(Boolean) as { addOnId: string; quantity: number; unitPrice: number }[];

    const resolvedAddOnsTotal = resolvedAddOns.reduce(
      (sum, a) => sum + a.unitPrice * a.quantity, 0,
    );

    // Server-validate pricing rule and capacity
    const rule = await prisma.pricingRule.findUnique({ where: { vehicleType: data.vehicleType as VehicleType } });
    if (!rule) return NextResponse.json({ success: false, error: 'Pricing not found' }, { status: 400 });

    if (data.passengers > rule.maxPassengers || data.luggage > rule.maxLuggage) {
      return NextResponse.json(
        { success: false, error: `${rule.name} capacity exceeded (max ${rule.maxPassengers} passengers, ${rule.maxLuggage} bags)` },
        { status: 400 },
      );
    }

    const serverBase = Math.round(rule.baseFare + rule.pricePerKm * data.distanceKm);

    const surcharges = calculateSurcharges(
      serverBase,
      data.pickupAddress,
      data.dropoffAddress,
      data.pickupTime,
      new Date(data.pickupDate),
    );

    const serverSubtotal = serverBase + surcharges.total + resolvedAddOnsTotal;

    // ── Server-side discount code validation ──────────────────────────────
    let discountRecord: { id: string; code: string; discountAmount: number } | null = null;

    if (data.discountCode) {
      const dc = await prisma.discountCode.findUnique({
        where: { code: data.discountCode.toUpperCase().trim() },
      });

      if (!dc || !dc.isActive) {
        return NextResponse.json({ success: false, error: 'Invalid discount code.' }, { status: 400 });
      }
      if (dc.expiresAt && dc.expiresAt < new Date()) {
        return NextResponse.json({ success: false, error: 'Discount code has expired.' }, { status: 400 });
      }
      if (dc.minOrderAmount !== null && serverSubtotal < dc.minOrderAmount) {
        return NextResponse.json({
          success: false,
          error: `Minimum order amount ฿${dc.minOrderAmount.toLocaleString()} required for this code.`,
        }, { status: 400 });
      }

      // newUserOnly check
      if (dc.newUserOnly) {
        const priorBookings = await prisma.booking.count({
          where: { customerEmail: data.customerEmail, currentStatus: { not: 'CANCELLED' } },
        });
        if (priorBookings > 0) {
          return NextResponse.json({ success: false, error: 'This code is for new customers only.' }, { status: 400 });
        }
      }

      // perUserLimit check
      if (dc.perUserLimit !== null) {
        const timesUsed = await prisma.discountRedemption.count({
          where: { discountCodeId: dc.id, customerEmail: data.customerEmail },
        });
        if (timesUsed >= dc.perUserLimit) {
          return NextResponse.json({ success: false, error: 'You have already used this discount code.' }, { status: 400 });
        }
      }

      const discountAmount = dc.type === 'PERCENTAGE'
        ? Math.round(serverSubtotal * dc.value / 100)
        : Math.round(dc.value);

      discountRecord = { id: dc.id, code: dc.code, discountAmount };
    }

    const serverTotal = Math.max(0, serverSubtotal - (discountRecord?.discountAmount ?? 0));

    // ── Create booking + optionally increment discount usedCount (transaction) ──
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          bookingRef:     generateBookingRef(),
          pickupAddress:  data.pickupAddress,  pickupLat:  data.pickupLat,  pickupLng:  data.pickupLng,
          dropoffAddress: data.dropoffAddress, dropoffLat: data.dropoffLat, dropoffLng: data.dropoffLng,
          distanceKm:     data.distanceKm,
          durationMin:    data.durationMin,
          pickupDate:     new Date(data.pickupDate),
          pickupTime:     data.pickupTime,
          passengers:     data.passengers,
          luggage:        data.luggage,
          vehicleType:    data.vehicleType as VehicleType,
          customerName:   data.customerName,
          customerEmail:  data.customerEmail,
          customerPhone:  data.customerPhone,
          specialNotes:   data.specialNotes ?? null,
          basePrice:      serverBase,
          addOnsTotal:    resolvedAddOnsTotal + surcharges.total,
          discountAmount: discountRecord?.discountAmount ?? 0,
          discountCode:   discountRecord?.code ?? null,
          discountCodeId: discountRecord?.id  ?? null,
          totalPrice:     serverTotal,
          currentStatus:  'PENDING',
          statusHistory: {
            create: { status: 'PENDING', note: 'Booking created', updatedBy: 'system' },
          },
          bookingAddOns: {
            create: resolvedAddOns.map((a) => ({
              addOnId:   a.addOnId,
              quantity:  a.quantity,
              unitPrice: a.unitPrice,
            })),
          },
        },
        include: {
          statusHistory: true,
          bookingAddOns: { include: { addOn: true } },
        },
      });

      // Atomically increment usedCount — also enforces maxUses inside the transaction
      if (discountRecord) {
        const discountCodeRecord = await tx.discountCode.findUnique({ where: { id: discountRecord.id } });
        const updated = await tx.discountCode.updateMany({
          where: {
            id: discountRecord.id,
            ...(discountCodeRecord?.maxUses !== null && discountCodeRecord?.maxUses !== undefined
              ? { usedCount: { lt: discountCodeRecord.maxUses } }
              : {}),
          },
          data: { usedCount: { increment: 1 } },
        });
        if (updated.count === 0) throw new Error('Discount code limit reached');

        // Record the redemption for per-user tracking
        await tx.discountRedemption.create({
          data: {
            discountCodeId: discountRecord.id,
            customerEmail:  created.customerEmail,
            bookingId:      created.id,
          },
        });
      }

      return created;
    });

    const trackingUrl   = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com'}/tracking`;
    const pickupDateStr = formatDate(booking.pickupDate);

    // Fire-and-forget all notifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendBookingToAdmin(booking as unknown as BookingDetail).catch(console.error);

    sendBookingConfirmationEmail({
      bookingRef:     booking.bookingRef,
      customerName:   booking.customerName,
      customerEmail:  booking.customerEmail,
      pickupAddress:  booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
      pickupDate:     booking.pickupDate,
      pickupTime:     booking.pickupTime,
      vehicleType:    booking.vehicleType,
      passengers:     booking.passengers,
      luggage:        booking.luggage,
      basePrice:      booking.basePrice,
      addOnsTotal:    booking.addOnsTotal,
      totalPrice:     booking.totalPrice,
      specialNotes:   booking.specialNotes,
    }).catch(console.error);

    sendCustomerBookingConfirmation(
      booking.customerPhone,
      booking.customerName,
      booking.bookingRef,
      pickupDateStr,
      booking.pickupTime,
      booking.pickupAddress,
      trackingUrl,
    ).catch(console.error);

    return NextResponse.json(
      { success: true, data: { id: booking.id, bookingRef: booking.bookingRef } },
      { status: 201 },
    );
  } catch (err) {
    console.error('[bookings] POST error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
}
