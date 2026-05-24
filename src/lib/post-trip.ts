import { db } from '@/lib/db';
import { awardPoints, calcTier } from '@/lib/loyalty';
import { LoyaltyTxType } from '@prisma/client';

// Points earned: 1 point per 10 THB spent (rounded down), minimum 10 points
export function calcLoyaltyPoints(totalPrice: number): number {
  return Math.max(10, Math.floor(totalPrice / 10));
}

/**
 * Award loyalty points to a user by email.
 * Looks up the user by email, awards points, updates tier, logs transaction.
 * Safe to call even if user doesn't exist (no-op).
 */
export async function awardLoyaltyPoints(
  customerEmail: string,
  totalPrice: number,
  bookingRef: string,
  bookingType: 'transfer' | 'tour' | 'attraction',
): Promise<void> {
  if (!customerEmail) return;
  try {
    const user = await db.user.findUnique({ where: { email: customerEmail.toLowerCase() } });
    if (!user) return; // Guest booking — no account to award

    const points = calcLoyaltyPoints(totalPrice);
    await awardPoints(
      user.id,
      points,
      'EARN' as LoyaltyTxType,
      `Completed ${bookingType} booking`,
      bookingRef,
    );
  } catch (err) {
    console.error('[post-trip] loyalty award error:', err);
    // Non-fatal — don't break the status update
  }
}

/**
 * Send a review request WhatsApp message to the customer.
 * Non-fatal if WhatsApp fails.
 */
export async function sendReviewRequest(
  customerPhone: string,
  customerName: string,
  bookingRef: string,
): Promise<void> {
  if (!customerPhone) return;

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn('[post-trip] WhatsApp env vars missing — skipping review request');
    return;
  }

  try {
    const firstName = customerName.split(' ')[0] || customerName;
    // Note: review/write page requires ?type=TRANSFER&bookingRef=XXX — use bookingRef as the key param
    const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.werest.com'}/review/write?bookingRef=${bookingRef}&type=TRANSFER`;
    const message =
      `Hi ${firstName}! 🌟 Thank you for traveling with Werest Travel. We hope you had a wonderful experience!\n\n` +
      `We'd love to hear your feedback — it takes just 1 minute:\n${reviewUrl}\n\n` +
      `Thank you! 🙏 — Werest Team`;

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return;

    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to:   cleanPhone,
        type: 'text',
        text: { body: message },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn('[post-trip] review request WhatsApp failed (may need template):', err);
    }
  } catch (err) {
    console.error('[post-trip] review request error:', err);
    // Non-fatal
  }
}
