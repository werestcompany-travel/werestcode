import { BookingDetail } from '@/types';
import { formatCurrency, formatDate, VEHICLE_LABELS } from './utils';

function buildBookingMessage(booking: BookingDetail): string {
  const addOnsList =
    booking.bookingAddOns.length > 0
      ? booking.bookingAddOns
          .map((a) => `  • ${a.addOn.icon ?? ''} ${a.addOn.name} x${a.quantity} – ${formatCurrency(a.unitPrice * a.quantity)}`)
          .join('\n')
      : '  None';

  return (
    `🚗 *NEW BOOKING – ${booking.bookingRef}*\n\n` +
    `📅 *Date & Time:* ${formatDate(booking.pickupDate)} at ${booking.pickupTime}\n` +
    `📍 *Pickup:* ${booking.pickupAddress}\n` +
    `🏁 *Drop-off:* ${booking.dropoffAddress}\n` +
    `📏 *Distance:* ${booking.distanceKm.toFixed(1)} km\n\n` +
    `🚙 *Vehicle:* ${VEHICLE_LABELS[booking.vehicleType]}\n` +
    `👥 *Passengers:* ${booking.passengers}  🧳 Luggage: ${booking.luggage}\n\n` +
    `➕ *Add-ons:*\n${addOnsList}\n\n` +
    `💵 *Base Fare:* ${formatCurrency(booking.basePrice)}\n` +
    `💵 *Add-ons:* ${formatCurrency(booking.addOnsTotal)}\n` +
    `💰 *TOTAL: ${formatCurrency(booking.totalPrice)}*\n\n` +
    `👤 *Customer:* ${booking.customerName}\n` +
    `📞 *Phone:* ${booking.customerPhone}\n` +
    `✉️ *Email:* ${booking.customerEmail}\n` +
    (booking.specialNotes ? `📝 *Notes:* ${booking.specialNotes}\n` : '') +
    `\n🔗 Manage: ${process.env.NEXT_PUBLIC_APP_URL}/admin`
  );
}

export async function sendBookingToAdmin(booking: BookingDetail): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;

  if (!phoneNumberId || !accessToken || !adminPhone) {
    console.warn('[WhatsApp] Missing env vars – skipping notification');
    return;
  }

  const message = buildBookingMessage(booking);

  const response = await fetch(
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
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('[WhatsApp] Send failed:', err);
  }
}

export async function sendStatusUpdate(
  customerPhone: string,
  bookingRef: string,
  statusLabel: string,
  trackingUrl: string,
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) return;

  const message =
    `✅ *Werest Travel Update*\n\n` +
    `Booking *${bookingRef}* status: *${statusLabel}*\n\n` +
    `Track your ride: ${trackingUrl}`;

  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: customerPhone.replace(/[^0-9]/g, ''),
      type: 'text',
      text: { body: message },
    }),
  });
}
