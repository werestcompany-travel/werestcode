export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateBookingRef } from '@/lib/utils';
import { sendBookingToAdmin } from '@/lib/whatsapp';
import { VehicleType, BookingStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      pickupAddress, pickupLat, pickupLng,
      dropoffAddress, dropoffLat, dropoffLng,
      distanceKm, durationMin,
      pickupDate, pickupTime,
      passengers, luggage,
      vehicleType,
      selectedAddOns,
      customerName, customerEmail, customerPhone, specialNotes,
      basePrice, addOnsTotal, totalPrice,
    } = body;

    // Validate required fields
    const required = { pickupAddress, dropoffAddress, pickupDate, pickupTime, vehicleType, customerName, customerEmail, customerPhone };
    for (const [key, val] of Object.entries(required)) {
      if (!val) {
        return NextResponse.json({ success: false, error: `Missing: ${key}` }, { status: 400 });
      }
    }

    const validVehicles: VehicleType[] = ['SEDAN', 'SUV', 'MINIVAN'];
    if (!validVehicles.includes(vehicleType)) {
      return NextResponse.json({ success: false, error: 'Invalid vehicle type' }, { status: 400 });
    }

    // Resolve add-on prices from DB (trust server, not client)
    const addOnIds = (selectedAddOns ?? []).map((a: { addOnId: string }) => a.addOnId);
    const dbAddOns = addOnIds.length > 0
      ? await prisma.addOn.findMany({ where: { id: { in: addOnIds }, isActive: true } })
      : [];

    const resolvedAddOns = (selectedAddOns ?? []).map((a: { addOnId: string; quantity: number }) => {
      const db = dbAddOns.find((d) => d.id === a.addOnId);
      return db ? { ...a, unitPrice: db.price, name: db.name } : null;
    }).filter(Boolean);

    const resolvedAddOnsTotal = resolvedAddOns.reduce(
      (sum: number, a: { unitPrice: number; quantity: number }) => sum + a.unitPrice * a.quantity, 0,
    );

    // Server-validate pricing rule and capacity
    const rule = await prisma.pricingRule.findUnique({ where: { vehicleType: vehicleType as VehicleType } });
    if (!rule) return NextResponse.json({ success: false, error: 'Pricing not found' }, { status: 400 });

    const pax  = parseInt(passengers)  || 0;
    const bags = parseInt(luggage)     || 0;
    if (pax > rule.maxPassengers || bags > rule.maxLuggage) {
      return NextResponse.json(
        { success: false, error: `${rule.name} capacity exceeded (max ${rule.maxPassengers} passengers, ${rule.maxLuggage} bags)` },
        { status: 400 },
      );
    }

    const serverBase  = Math.round(rule.baseFare + rule.pricePerKm * distanceKm);
    const serverTotal = serverBase + resolvedAddOnsTotal;

    const booking = await prisma.booking.create({
      data: {
        bookingRef:     generateBookingRef(),
        pickupAddress,  pickupLat,  pickupLng,
        dropoffAddress, dropoffLat, dropoffLng,
        distanceKm:     parseFloat(distanceKm),
        durationMin:    parseInt(durationMin),
        pickupDate:     new Date(pickupDate),
        pickupTime,
        passengers:     parseInt(passengers),
        luggage:        parseInt(luggage),
        vehicleType:    vehicleType as VehicleType,
        customerName,   customerEmail, customerPhone,
        specialNotes:   specialNotes ?? null,
        basePrice:      serverBase,
        addOnsTotal:    resolvedAddOnsTotal,
        totalPrice:     serverTotal,
        currentStatus:  'PENDING' as BookingStatus,
        statusHistory: {
          create: {
            status:    'PENDING',
            note:      'Booking created',
            updatedBy: 'system',
          },
        },
        bookingAddOns: {
          create: resolvedAddOns.map((a: { addOnId: string; quantity: number; unitPrice: number }) => ({
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

    // Fire-and-forget WhatsApp notification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendBookingToAdmin(booking as any).catch(console.error);

    return NextResponse.json({ success: true, data: { id: booking.id, bookingRef: booking.bookingRef } }, { status: 201 });
  } catch (err) {
    console.error('[bookings] POST error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
}
