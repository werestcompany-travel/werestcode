import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const groupBookingSchema = z.object({
  groupName:           z.string().min(2).max(200),
  contactPerson:       z.string().min(2).max(100),
  email:               z.string().email(),
  phone:               z.string().min(5).max(30),
  whatsapp:            z.string().optional(),
  destinations:        z.string().min(2).max(500),
  travelDates:         z.string().min(2).max(200),
  groupSize:           z.number().min(10).max(500),
  budgetPerPerson:     z.union([z.string(), z.number()]).optional().transform(v => v != null ? String(v) : ''),
  specialRequirements: z.string().max(2000).optional().transform(v => v ?? ''),
  hearAboutUs:         z.string().max(200).optional().transform(v => v ?? ''),
});

type GroupBookingForm = z.infer<typeof groupBookingSchema>;

function buildWhatsAppMessage(data: GroupBookingForm, ref: string): string {
  return (
    `🚌 *NEW GROUP BOOKING ENQUIRY* — Ref: ${ref}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥 *Group Details*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `  Group/Company: ${data.groupName}\n` +
    `  Contact Person: ${data.contactPerson}\n` +
    `  Email: ${data.email}\n` +
    `  Phone: ${data.phone}\n` +
    `  WhatsApp: ${data.whatsapp}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 *Trip Details*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `  Destination(s): ${data.destinations}\n` +
    `  Travel Dates: ${data.travelDates}\n` +
    `  Group Size: ${data.groupSize} people\n` +
    `  Budget per Person: ${data.budgetPerPerson}\n\n` +
    (data.specialRequirements ? `📝 *Special Requirements:*\n  ${data.specialRequirements}\n\n` : '') +
    `📢 *Heard about us via:* ${data.hearAboutUs || 'Not specified'}\n\n` +
    `🔗 Reply via WhatsApp to follow up.`
  );
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = groupBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const data: GroupBookingForm = parsed.data;

    // Generate group ref
    const now   = new Date();
    const year  = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const rand  = Math.random().toString(36).slice(2, 6).toUpperCase();
    const ref   = `GRP-${year}${month}-${rand}`;

    // Save to Inquiry model with type = 'GROUP'
    await prisma.inquiry.create({
      data: {
        ref,
        fullName:        data.contactPerson,
        email:           data.email,
        whatsapp:        data.whatsapp || data.phone,
        destination:     data.destinations,
        travelDate:      data.travelDates,
        adults:          Number(data.groupSize) || 10,
        budgetRange:     data.budgetPerPerson,
        specialRequests: data.specialRequirements,
        source:          `GROUP:${data.groupName}`,
        // Store full form in specialRequests JSON
        tourPreferences: `Group enquiry — ${data.groupName} | Contact: ${data.contactPerson} | Heard via: ${data.hearAboutUs || 'N/A'}`,
        multiDestination: true,
      },
    });

    // Send WhatsApp admin notification (fire-and-forget)
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
    const adminPhone    = process.env.WHATSAPP_ADMIN_PHONE;

    if (phoneNumberId && accessToken && adminPhone) {
      const message = buildWhatsAppMessage(data, ref);
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
      ).catch(err => console.error('[GroupBooking] WhatsApp error:', err));
    }

    return NextResponse.json({ success: true, ref });
  } catch (err) {
    console.error('[GroupBooking] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
