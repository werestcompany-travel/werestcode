import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';
import { sendInquiryConfirmationEmail } from '@/lib/email';

const InquirySchema = z.object({
  fullName:         z.string().min(2).max(100),
  email:            z.string().email(),
  whatsapp:         z.string().min(8).max(20),
  country:          z.string().optional(),
  travelDate:       z.string().optional(),
  flexibleDate:     z.boolean().optional(),
  adults:           z.number().int().min(1).max(50).optional(),
  children:         z.number().int().min(0).max(30).optional(),
  destination:      z.string().min(1).max(200),
  multiDestination: z.boolean().optional(),
  tourDuration:     z.string().optional(),
  hotelCategory:    z.string().optional(),
  budgetRange:      z.string().optional(),
  transportType:    z.string().optional(),
  activities:       z.record(z.string(), z.boolean()).optional(),
  tourPreferences:  z.string().optional(),
  specialRequests:  z.string().optional(),
});

function buildInquiryMessage(data: z.infer<typeof InquirySchema>, ref: string): string {
  const pax =
    `${data.adults ?? 2} adult${(data.adults ?? 2) !== 1 ? 's' : ''}` +
    ((data.children ?? 0) > 0 ? ` + ${data.children} child${(data.children ?? 0) !== 1 ? 'ren' : ''}` : '');

  const activitiesObj = data.activities ?? {};
  const activitiesList =
    Object.keys(activitiesObj).filter((k) => activitiesObj[k]).join(', ') || 'None selected';

  const dateStr = data.travelDate
    ? `${data.travelDate}${data.flexibleDate ? ' (flexible)' : ''}`
    : 'Not specified';

  return (
    `🌏 *NEW GROUP TOUR INQUIRY* — Ref: ${ref}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Contact Details*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `  Name: ${data.fullName}\n` +
    `  Email: ${data.email}\n` +
    `  WhatsApp: ${data.whatsapp}\n` +
    `  Country: ${data.country || 'Not specified'}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 *Trip Details*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `  Travel Date: ${dateStr}\n` +
    `  Group Size: ${pax}\n` +
    `  Duration: ${data.tourDuration || 'Not specified'}\n` +
    `  Budget: ${data.budgetRange || 'Not specified'}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 *Destination & Transport*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `  Destination(s): ${data.destination || 'Not specified'}\n` +
    `  Transport: ${data.transportType || 'Not specified'}\n` +
    `  Hotel Category: ${data.hotelCategory || 'Not specified'}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🎯 *Activities & Preferences*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `  Activities: ${activitiesList}\n` +
    (data.tourPreferences ? `  Tour Style: ${data.tourPreferences}\n` : '') +
    (data.specialRequests ? `\n📝 *Special Requests:*\n  ${data.specialRequests}\n` : '') +
    `\n🔗 Reply via WhatsApp to confirm itinerary details.`
  );
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getIP(req);
  const rl = rateLimit(`inquiry:${ip}`, LIMITS.inquiry);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = InquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Duplicate check: same email + destination within 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const duplicate = await prisma.inquiry.findFirst({
      where: { email: data.email, destination: data.destination, createdAt: { gte: twoHoursAgo } },
    });
    if (duplicate) {
      return NextResponse.json({ success: true, ref: duplicate.ref, duplicate: true });
    }

    // Generate ref — use random suffix to avoid race conditions with count()
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase(); // e.g. "K4Z2F"
    const ref = `INQ-${year}${month}-${rand}`;

    // Write to DB first
    const inquiry = await prisma.inquiry.create({
      data: {
        ref,
        fullName:         data.fullName,
        email:            data.email,
        whatsapp:         data.whatsapp,
        country:          data.country,
        travelDate:       data.travelDate,
        flexibleDate:     data.flexibleDate ?? false,
        adults:           data.adults ?? 2,
        children:         data.children ?? 0,
        destination:      data.destination,
        multiDestination: data.multiDestination ?? false,
        tourDuration:     data.tourDuration,
        hotelCategory:    data.hotelCategory,
        budgetRange:      data.budgetRange,
        transportType:    data.transportType,
        activities:       (data.activities ?? {}) as Record<string, boolean>,
        tourPreferences:  data.tourPreferences,
        specialRequests:  data.specialRequests,
        source:           req.headers.get('referer') ?? undefined,
      },
    });

    // Send WhatsApp notification to admin (fire-and-forget)
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
    const adminPhone    = process.env.WHATSAPP_ADMIN_PHONE;

    if (phoneNumberId && accessToken && adminPhone) {
      const message = buildInquiryMessage(data, ref);
      fetch(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: adminPhone,
            type: 'text',
            text: { body: message },
          }),
        },
      ).catch((err) => console.error('[Inquiry] WhatsApp send error:', err));
    } else {
      console.warn('[Inquiry] WhatsApp env vars missing — skipping notification');
    }

    // Send customer confirmation email (fire-and-forget)
    sendInquiryConfirmationEmail({
      ref:         inquiry.ref,
      fullName:    data.fullName,
      email:       data.email,
      destination: data.destination,
    }).catch((err) => console.error('[Inquiry] Email send error:', err));

    return NextResponse.json({ success: true, ref: inquiry.ref });
  } catch (err) {
    console.error('[Inquiry] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
