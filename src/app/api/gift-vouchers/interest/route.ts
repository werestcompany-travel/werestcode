import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientName, recipientEmail, message, senderName, email, amount } = body as Record<string, string | number>;

    if (!senderName || !email || !recipientName || !recipientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log interest (in production you'd save to DB / send email)
    console.log('[Gift Voucher Interest]', {
      recipientName,
      recipientEmail,
      message,
      senderName,
      email,
      amount,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Gift Voucher Interest] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
