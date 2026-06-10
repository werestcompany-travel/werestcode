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

/**
 * Send a customer booking confirmation via WhatsApp text message.
 * NOTE: Meta WhatsApp Business API requires a pre-approved utility template for
 * outbound messages to users who haven't messaged the business within 24h.
 * This will work in the 24h session window, but for cold outbound you must
 * register a template at business.facebook.com and use sendTemplateMessage().
 */
// Falls back gracefully — for production, register a utility template and call sendTemplateMessage instead.
export async function sendCustomerBookingConfirmation(
  customerPhone: string,
  customerName: string,
  bookingRef: string,
  pickupDate: string,
  pickupTime: string,
  pickupAddress: string,
  trackingUrl: string,
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) return;

  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  const message =
    `✅ *Booking Confirmed – ${bookingRef}*\n\n` +
    `Hi ${customerName}! Your Werest Travel transfer is confirmed.\n\n` +
    `📅 *Date:* ${pickupDate} at ${pickupTime}\n` +
    `📍 *Pickup:* ${pickupAddress}\n\n` +
    `Track your booking: ${trackingUrl}\n\n` +
    `Payment is due on the day. We'll be in touch before your pickup. Safe travels! 🚗`;

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message },
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.warn('[WhatsApp] Customer confirmation failed (likely needs template):', err);
    }
  } catch (err) {
    console.warn('[WhatsApp] sendCustomerBookingConfirmation error:', err);
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

// ─── Attraction booking admin alert ───────────────────────────────────────────

export async function sendAttractionBookingToAdmin(params: {
  bookingRef:     string;
  attractionName: string;
  packageName:    string;
  visitDate:      Date | string;
  adultQty:       number;
  childQty:       number;
  totalPrice:     number;
  customerName:   string;
  customerPhone:  string;
  customerEmail:  string;
  notes?:         string | null;
}): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminPhone    = process.env.WHATSAPP_ADMIN_PHONE;
  if (!phoneNumberId || !accessToken || !adminPhone) return;

  const visitStr = typeof params.visitDate === 'string'
    ? params.visitDate
    : params.visitDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const message =
    `🎫 *NEW ATTRACTION BOOKING – ${params.bookingRef}*\n\n` +
    `🏛 *Attraction:* ${params.attractionName}\n` +
    `🎟 *Package:* ${params.packageName}\n` +
    `📅 *Visit Date:* ${visitStr}\n` +
    `👥 *Adults:* ${params.adultQty}  👶 Children: ${params.childQty}\n` +
    `💰 *TOTAL: THB ${params.totalPrice.toFixed(0)}*\n\n` +
    `👤 *Customer:* ${params.customerName}\n` +
    `📞 *Phone:* ${params.customerPhone}\n` +
    `✉️ *Email:* ${params.customerEmail}\n` +
    (params.notes ? `📝 *Notes:* ${params.notes}\n` : '') +
    `\n🔗 Manage: ${process.env.NEXT_PUBLIC_APP_URL}/admin/attraction-bookings`;

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: adminPhone, type: 'text', text: { body: message } }),
    });
    if (!res.ok) console.error('[WhatsApp] Attraction admin alert failed:', await res.text());
  } catch (err) {
    console.error('[WhatsApp] sendAttractionBookingToAdmin error:', err);
  }
}

// ─── Tour booking admin alert ─────────────────────────────────────────────────

export async function sendTourBookingToAdmin(params: {
  bookingRef:    string;
  tourTitle:     string;
  bookingDate:   Date | string;
  tourTime?:     string | null;
  optionLabel?:  string | null;
  adultQty:      number;
  childQty:      number;
  totalPrice:    number;
  customerName:  string;
  customerPhone: string;
  customerEmail: string;
  notes?:        string | null;
}): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminPhone    = process.env.WHATSAPP_ADMIN_PHONE;
  if (!phoneNumberId || !accessToken || !adminPhone) return;

  const dateStr = typeof params.bookingDate === 'string'
    ? params.bookingDate
    : params.bookingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const timeStr = params.tourTime ? ` at ${params.tourTime}` : '';
  const labelStr = params.optionLabel ? ` (${params.optionLabel})` : '';

  const message =
    `🗺 *NEW TOUR BOOKING – ${params.bookingRef}*\n\n` +
    `🎯 *Tour:* ${params.tourTitle}${labelStr}\n` +
    `📅 *Date:* ${dateStr}${timeStr}\n` +
    `👥 *Adults:* ${params.adultQty}  👶 Children: ${params.childQty}\n` +
    `💰 *TOTAL: THB ${params.totalPrice.toFixed(0)}*\n\n` +
    `👤 *Customer:* ${params.customerName}\n` +
    `📞 *Phone:* ${params.customerPhone}\n` +
    `✉️ *Email:* ${params.customerEmail}\n` +
    (params.notes ? `📝 *Notes:* ${params.notes}\n` : '') +
    `\n🔗 Manage: ${process.env.NEXT_PUBLIC_APP_URL}/admin/tour-bookings`;

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: adminPhone, type: 'text', text: { body: message } }),
    });
    if (!res.ok) console.error('[WhatsApp] Tour admin alert failed:', await res.text());
  } catch (err) {
    console.error('[WhatsApp] sendTourBookingToAdmin error:', err);
  }
}

// ─── Driver Details (3 hours before pickup) ───────────────────────────────────

export async function sendDriverDetailsToCustomer(params: {
  customerPhone: string;
  customerName: string;
  bookingRef: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  pickupTime: string;
  pickupAddress: string;
  trackingUrl: string;
}): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  const cleanPhone = params.customerPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  const message =
    `🚗 *Your driver is on the way — ${params.bookingRef}*\n\n` +
    `Hi ${params.customerName}! Your Werest Travel driver details:\n\n` +
    `👤 Driver: ${params.driverName}\n` +
    `📞 Driver Phone: ${params.driverPhone}\n` +
    `🚙 Vehicle: ${params.vehicleModel} (${params.vehiclePlate})\n` +
    `📍 Pickup: ${params.pickupAddress} at ${params.pickupTime}\n\n` +
    `Track live: ${params.trackingUrl}\n\n` +
    `Need help? Reply to this message or call us.`;

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message },
      }),
    });
    if (!res.ok) console.warn('[WhatsApp] sendDriverDetailsToCustomer failed:', await res.text());
  } catch (err) {
    console.warn('[WhatsApp] sendDriverDetailsToCustomer error:', err);
  }
}

// ─── Post-trip Review Request ──────────────────────────────────────────────────

export async function sendPostTripReviewRequest(params: {
  customerPhone: string;
  customerName: string;
  bookingRef: string;
  serviceType: 'transfer' | 'tour';
  destination: string;
  reviewUrl: string;
  googleReviewUrl?: string;
}): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  const cleanPhone = params.customerPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  const message =
    `⭐ *How was your experience? — ${params.bookingRef}*\n\n` +
    `Hi ${params.customerName}! Hope you enjoyed your ${params.serviceType} in ${params.destination} with Werest Travel.\n\n` +
    `We'd love your feedback — it takes just 30 seconds:\n` +
    `👉 Leave a review: ${params.reviewUrl}\n` +
    (params.googleReviewUrl ? `⭐ Google review: ${params.googleReviewUrl}\n` : '') +
    `\nThank you for choosing Werest Travel! 🙏`;

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message },
      }),
    });
    if (!res.ok) console.warn('[WhatsApp] sendPostTripReviewRequest failed:', await res.text());
  } catch (err) {
    console.warn('[WhatsApp] sendPostTripReviewRequest error:', err);
  }
}

// ─── Post-booking Upsell ───────────────────────────────────────────────────────

const DESTINATION_TOURS: Record<string, { name: string; slug: string; price: number; emoji: string }> = {
  'phuket':      { name: 'Phi Phi Island Day Trip',        slug: 'phi-phi-island-day-trip',       price: 1200, emoji: '🏝️' },
  'krabi':       { name: 'James Bond Island Tour',         slug: 'james-bond-island-tour',        price: 1100, emoji: '⛰️' },
  'bangkok':     { name: 'Grand Palace & Temples Tour',    slug: 'grand-palace-temples-tour',     price: 900,  emoji: '🛕' },
  'chiang mai':  { name: 'Elephant Sanctuary Day Trip',    slug: 'elephant-sanctuary-day-trip',   price: 2200, emoji: '🐘' },
  'pattaya':     { name: 'Coral Island Speedboat Tour',    slug: 'coral-island-speedboat',        price: 800,  emoji: '🚤' },
  'hua hin':     { name: 'Hua Hin City & Beach Tour',      slug: 'hua-hin-city-tour',             price: 700,  emoji: '🌊' },
};

function getUpsellTour(destination: string): typeof DESTINATION_TOURS[string] | null {
  const lower = destination.toLowerCase();
  for (const [key, tour] of Object.entries(DESTINATION_TOURS)) {
    if (lower.includes(key)) return tour;
  }
  return null;
}

export async function sendPostBookingUpsell(params: {
  customerPhone: string;
  customerName: string;
  bookingRef: string;
  destination: string;
  bookingDate: string;
}): Promise<void> {
  const tour = getUpsellTour(params.destination);
  if (!tour) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gowerest.com';
  const tourUrl = `${appUrl}/tours/${tour.slug}?ref=${params.bookingRef}`;

  const message =
    `${tour.emoji} *While you're in ${params.destination.split(',')[0]}...*\n\n` +
    `Hi ${params.customerName}! We noticed you're heading that way on ${params.bookingDate}.\n\n` +
    `Many of our guests also love:\n` +
    `*${tour.name}*\n` +
    `฿${tour.price.toLocaleString()} per person · Free cancellation\n\n` +
    `👉 Book now: ${tourUrl}\n\n` +
    `_Reply STOP to opt out of recommendations_`;

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  const cleanPhone = params.customerPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  try {
    await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message },
      }),
    });
  } catch (err) {
    console.warn('[WhatsApp] Upsell send error:', err);
  }
}

/**
 * Send a WhatsApp template message (for outbound to customers outside 24h session).
 * The templateName must be pre-approved at business.facebook.com.
 * components format follows Meta's template message spec.
 */
export async function sendTemplateMessage(
  toPhone: string,
  templateName: string,
  languageCode: string,
  components: object[],
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn('[WhatsApp] sendTemplateMessage – missing env vars, skipping');
    return;
  }

  const cleanPhone = toPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) {
    console.warn('[WhatsApp] sendTemplateMessage – invalid phone number, skipping');
    return;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.warn('[WhatsApp] sendTemplateMessage failed:', err);
    }
  } catch (err) {
    console.warn('[WhatsApp] sendTemplateMessage error:', err);
  }
}
