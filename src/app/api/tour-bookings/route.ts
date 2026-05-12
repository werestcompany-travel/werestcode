export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';
import { sendTourConfirmationEmail } from '@/lib/email';

const TourBookingSchema = z.object({
  tourSlug:      z.string().min(1),
  tourTitle:     z.string().min(1),
  optionLabel:   z.string().min(1),
  bookingDate:   z.string().min(1),
  adultQty:      z.number().int().min(1),
  childQty:      z.number().int().min(0).default(0),
  adultPrice:    z.number().min(0),
  childPrice:    z.number().min(0).default(0),
  totalPrice:    z.number().min(0),
  customerName:  z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8).max(20),
  notes:         z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit: reuse booking limit (20 per hour per IP)
  const ip = getIP(req);
  const rl = rateLimit(`booking:${ip}`, LIMITS.booking);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = TourBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;

  // ── Server-side price recalculation (never trust client totalPrice) ──────
  const serverTotal = Math.round(data.adultQty * data.adultPrice + data.childQty * data.childPrice);

  // Generate booking ref with collision check
  const now = new Date();
  function makeRef() {
    return `WRT-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  try {
    let ref = makeRef();
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.tourBooking.findUnique({ where: { bookingRef: ref } });
      if (!existing) break;
      ref = makeRef();
    }

    const booking = await prisma.tourBooking.create({
      data: {
        bookingRef:    ref,
        tourSlug:      data.tourSlug,
        tourTitle:     data.tourTitle,
        optionLabel:   data.optionLabel,
        bookingDate:   new Date(data.bookingDate),
        adultQty:      data.adultQty,
        childQty:      data.childQty,
        adultPrice:    data.adultPrice,
        childPrice:    data.childPrice,
        totalPrice:    serverTotal,   // server-recalculated, not client value
        customerName:  data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        notes:         data.notes,
      },
    });

    // ── Notify admin via WhatsApp (fire-and-forget) ───────────────────────
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
    const adminPhone    = process.env.WHATSAPP_ADMIN_PHONE;

    if (phoneNumberId && accessToken && adminPhone) {
      const pax = `${data.adultQty} adult${data.adultQty !== 1 ? 's' : ''}` +
        (data.childQty > 0 ? ` + ${data.childQty} child${data.childQty !== 1 ? 'ren' : ''}` : '');
      const dateStr = new Date(data.bookingDate).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok',
      });
      const msg =
        `🎫 *NEW TOUR BOOKING — ${ref}*\n\n` +
        `📋 *Tour:* ${data.tourTitle}\n` +
        `🕐 *Option:* ${data.optionLabel}\n` +
        `📅 *Date:* ${dateStr}\n` +
        `👥 *Guests:* ${pax}\n` +
        `💰 *Total:* ฿${serverTotal.toLocaleString()}\n\n` +
        `👤 *Customer:* ${data.customerName}\n` +
        `📞 *Phone:* ${data.customerPhone}\n` +
        `✉️ *Email:* ${data.customerEmail}\n` +
        (data.notes ? `📝 *Notes:* ${data.notes}\n` : '') +
        `\n🔗 Manage: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com'}/admin/tours`;

      fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: adminPhone, type: 'text', text: { body: msg } }),
      }).catch((err) => console.error('[tour-bookings] WhatsApp notify error:', err));
    }

    // ── Send customer confirmation email (fire-and-forget) ───────────────
    sendTourConfirmationEmail({
      bookingRef:    booking.bookingRef,
      customerName:  data.customerName,
      customerEmail: data.customerEmail,
      tourTitle:     data.tourTitle,
      optionLabel:   data.optionLabel,
      bookingDate:   booking.bookingDate,
      adultQty:      data.adultQty,
      childQty:      data.childQty,
      totalPrice:    serverTotal,
    }).catch((err) => console.error('[tour-bookings] Email send error:', err));

    return NextResponse.json({ success: true, bookingRef: booking.bookingRef, id: booking.id });
  } catch (err) {
    console.error('[tour-bookings] POST error:', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
