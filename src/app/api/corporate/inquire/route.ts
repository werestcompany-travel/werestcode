import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, contactName, email, phone, whatsapp, monthlySpend } = body as Record<string, string>;

    if (!companyName || !contactName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Compose WhatsApp message to admin
    const adminWhatsApp = process.env.WHATSAPP_ADMIN_PHONE ?? '66819519191';
    const message = encodeURIComponent(
      `*New Corporate Account Application*\n\n` +
      `Company: ${companyName}\n` +
      `Contact: ${contactName}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `WhatsApp: ${whatsapp ?? 'N/A'}\n` +
      `Monthly Spend: ${monthlySpend ?? 'Not specified'}`
    );

    // Log the inquiry (in production you'd save to Inquiry model)
    console.log('[Corporate Inquiry]', { companyName, contactName, email, phone, whatsapp, monthlySpend });

    return NextResponse.json({
      ok: true,
      whatsappUrl: `https://wa.me/${adminWhatsApp}?text=${message}`,
    });
  } catch (err) {
    console.error('[Corporate Inquiry] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
