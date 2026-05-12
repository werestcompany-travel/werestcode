import { Resend } from 'resend';
import { formatCurrency, formatDate, VEHICLE_LABELS } from './utils';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = `${process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Werest Travel'} <noreply@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN ?? 'werest.com'}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="background:#2534ff;padding:28px 40px;">
          <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Werest Travel</span>
        </td>
      </tr>
      <!-- Body -->
      <tr><td style="padding:36px 40px;">${body}</td></tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">Werest Travel · Thailand · <a href="${APP_URL}" style="color:#2534ff;text-decoration:none;">${APP_URL}</a></p>
          <p style="margin:6px 0 0;color:#9ca3af;font-size:11px;">You received this because you made a booking with us.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Booking confirmation ──────────────────────────────────────────────────────

interface BookingEmailData {
  bookingRef:     string;
  customerName:   string;
  customerEmail:  string;
  pickupAddress:  string;
  dropoffAddress: string;
  pickupDate:     string | Date;
  pickupTime:     string;
  vehicleType:    string;
  passengers:     number;
  luggage:        number;
  basePrice:      number;
  addOnsTotal:    number;
  totalPrice:     number;
  specialNotes?:  string | null;
}

export async function sendBookingConfirmationEmail(booking: BookingEmailData): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping booking confirmation email');
    return;
  }

  const vehicleLabel = VEHICLE_LABELS[booking.vehicleType as keyof typeof VEHICLE_LABELS] ?? booking.vehicleType;
  const dateStr = formatDate(booking.pickupDate);
  const confirmUrl = `${APP_URL}/confirmation/${booking.bookingRef}`;
  const trackUrl   = `${APP_URL}/tracking`;

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Booking Confirmed ✓</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${booking.customerName}, your transfer has been received.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td colspan="2" style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;margin-bottom:14px;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${booking.bookingRef}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;width:50%;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Pickup</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${booking.pickupAddress}</p>
      </td><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Drop-off</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${booking.dropoffAddress}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Date &amp; Time</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${dateStr} at ${booking.pickupTime}</p>
      </td><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Vehicle</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${vehicleLabel} · ${booking.passengers} pax</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="font-size:14px;color:#374151;">Base fare</td>
        <td align="right" style="font-size:14px;color:#374151;">${formatCurrency(booking.basePrice)}</td>
      </tr>
      ${booking.addOnsTotal > 0 ? `
      <tr>
        <td style="font-size:14px;color:#374151;padding-top:4px;">Add-ons</td>
        <td align="right" style="font-size:14px;color:#374151;padding-top:4px;">${formatCurrency(booking.addOnsTotal)}</td>
      </tr>` : ''}
      <tr>
        <td style="font-size:16px;font-weight:800;color:#111827;padding-top:10px;border-top:1px solid #e5e7eb;">Total</td>
        <td align="right" style="font-size:16px;font-weight:800;color:#2534ff;padding-top:10px;border-top:1px solid #e5e7eb;">${formatCurrency(booking.totalPrice)}</td>
      </tr>
    </table>

    ${booking.specialNotes ? `<p style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-bottom:24px;">📝 <strong>Your notes:</strong> ${escapeHtml(booking.specialNotes)}</p>` : ''}

    <p style="font-size:14px;color:#374151;margin-bottom:20px;">Payment is due on the day. Your driver will be in touch before pickup. You can track your booking status at any time:</p>

    <div style="text-align:center;margin-bottom:16px;">
      <a href="${confirmUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">View Booking</a>
    </div>
    <p style="text-align:center;font-size:13px;color:#9ca3af;">or track at: <a href="${trackUrl}" style="color:#2534ff;">${trackUrl}</a></p>
    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:24px;">
      You're receiving this email because you made a booking with Werest Travel.<br/>
      <a href="https://www.werest.com/unsubscribe?email=${encodeURIComponent(booking.customerEmail)}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      booking.customerEmail,
      subject: `Booking Confirmed – ${booking.bookingRef} | Werest Travel`,
      html:    baseLayout(`Booking Confirmed – ${booking.bookingRef}`, body),
    });
  } catch (err) {
    console.error('[email] sendBookingConfirmationEmail failed:', err);
  }
}

// ─── Tour booking confirmation ─────────────────────────────────────────────────

interface TourBookingEmailData {
  bookingRef:    string;
  customerName:  string;
  customerEmail: string;
  tourTitle:     string;
  bookingDate:   string | Date;
  tourTime?:     string | null;
  optionLabel?:  string | null;
  adultQty:      number;
  childQty:      number;
  adultPrice:    number;
  childPrice:    number;
  totalPrice:    number;
  meetingPoint?: string | null;
  notes?:        string | null;
}

export async function sendTourBookingEmail(booking: TourBookingEmailData): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping tour booking email');
    return;
  }

  const dateStr     = formatDate(booking.bookingDate);
  const confirmUrl  = `${APP_URL}/tours/confirmation/${booking.bookingRef}`;

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Tour Booking Confirmed ✓</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, your tour is booked!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td colspan="2" style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${booking.bookingRef}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;width:50%;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Tour</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(booking.tourTitle)}</p>
      </td><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Date</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${dateStr}${booking.tourTime ? ` at ${booking.tourTime}` : ''}</p>
      </td></tr>
      ${booking.meetingPoint ? `<tr><td colspan="2" style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Meeting Point</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(booking.meetingPoint)}</p>
      </td></tr>` : ''}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="font-size:14px;color:#374151;">${booking.adultQty} adult${booking.adultQty !== 1 ? 's' : ''} × ${formatCurrency(booking.adultPrice)}</td>
        <td align="right" style="font-size:14px;color:#374151;">${formatCurrency(booking.adultQty * booking.adultPrice)}</td>
      </tr>
      ${booking.childQty > 0 ? `<tr>
        <td style="font-size:14px;color:#374151;padding-top:4px;">${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''} × ${formatCurrency(booking.childPrice)}</td>
        <td align="right" style="font-size:14px;color:#374151;padding-top:4px;">${formatCurrency(booking.childQty * booking.childPrice)}</td>
      </tr>` : ''}
      <tr>
        <td style="font-size:16px;font-weight:800;color:#111827;padding-top:10px;border-top:1px solid #e5e7eb;">Total</td>
        <td align="right" style="font-size:16px;font-weight:800;color:#2534ff;padding-top:10px;border-top:1px solid #e5e7eb;">${formatCurrency(booking.totalPrice)}</td>
      </tr>
    </table>

    <div style="text-align:center;margin-bottom:16px;">
      <a href="${confirmUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">View Booking</a>
    </div>
    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:24px;">
      You're receiving this email because you made a booking with Werest Travel.<br/>
      <a href="https://www.werest.com/unsubscribe?email=${encodeURIComponent(booking.customerEmail)}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      booking.customerEmail,
      subject: `Tour Booking Confirmed – ${booking.bookingRef} | Werest Travel`,
      html:    baseLayout(`Tour Booking Confirmed – ${booking.bookingRef}`, body),
    });
  } catch (err) {
    console.error('[email] sendTourBookingEmail failed:', err);
  }
}

// ─── Password reset ────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping password reset email');
    return;
  }

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Reset your password</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">We received a request to reset your Werest Travel account password. Click the button below to set a new password.</p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${resetUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">Reset Password</a>
    </div>

    <p style="font-size:13px;color:#6b7280;margin-bottom:8px;">Or paste this link into your browser:</p>
    <p style="font-size:12px;color:#2534ff;word-break:break-all;margin-bottom:24px;">${resetUrl}</p>

    <p style="font-size:13px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: 'Reset your Werest Travel password',
      html:    baseLayout('Reset your password', body),
    });
  } catch (err) {
    console.error('[email] sendPasswordResetEmail failed:', err);
  }
}

// ─── Inquiry customer confirmation ────────────────────────────────────────────

interface InquiryEmailData {
  ref:         string;
  fullName:    string;
  email:       string;
  destination: string;
}

export async function sendInquiryConfirmationEmail(data: InquiryEmailData): Promise<void> {
  if (!resend) {
    // Ready to wire — set RESEND_API_KEY to enable customer inquiry emails
    console.warn('[email] RESEND_API_KEY not set – skipping inquiry confirmation email');
    return;
  }

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Inquiry Received ✓</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${escapeHtml(data.fullName)}, thank you for reaching out to Werest Travel.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Inquiry Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${escapeHtml(data.ref)}</p>
      </td></tr>
      <tr><td style="padding:14px 0 0;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;">Destination</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#111827;">${escapeHtml(data.destination)}</p>
      </td></tr>
    </table>

    <p style="font-size:15px;color:#374151;margin-bottom:20px;">
      We've received your group tour inquiry and our local experts are reviewing your requirements.
      You'll hear from us within <strong>24 hours</strong> with a personalised day-by-day itinerary and transparent price breakdown.
    </p>

    <p style="font-size:14px;color:#374151;margin-bottom:8px;">In the meantime, if you have any urgent questions feel free to WhatsApp us directly.</p>

    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${APP_URL}/inquiry" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">View Inquiry Status</a>
    </div>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      data.email,
      subject: `Your inquiry has been received — ${data.ref} | Werest Travel`,
      html:    baseLayout(`Inquiry Received — ${data.ref}`, body),
    });
  } catch (err) {
    console.error('[email] sendInquiryConfirmationEmail failed:', err);
  }
}

// ─── Tour booking confirmation (legacy wrapper) ───────────────────────────────

interface TourEmailData {
  bookingRef:     string;
  customerName:   string;
  customerEmail:  string;
  tourTitle:      string;
  optionLabel:    string;
  bookingDate:    string | Date;
  adultQty:       number;
  childQty:       number;
  totalPrice:     number;
}

/** @deprecated Use sendTourBookingEmail instead */
export async function sendTourConfirmationEmail(booking: TourEmailData): Promise<void> {
  return sendTourBookingEmail({
    bookingRef:    booking.bookingRef,
    customerName:  booking.customerName,
    customerEmail: booking.customerEmail,
    tourTitle:     booking.tourTitle,
    optionLabel:   booking.optionLabel,
    bookingDate:   booking.bookingDate,
    adultQty:      booking.adultQty,
    childQty:      booking.childQty,
    adultPrice:    0,
    childPrice:    0,
    totalPrice:    booking.totalPrice,
  });
}

// ─── Attraction booking confirmation ──────────────────────────────────────────

interface AttractionEmailData {
  bookingRef:     string;
  customerName:   string;
  customerEmail:  string;
  attractionName: string;
  packageName:    string;
  visitDate:      string | Date;
  adultQty:       number;
  childQty:       number;
  totalPrice:     number;
}

export async function sendAttractionConfirmationEmail(booking: AttractionEmailData): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping attraction confirmation email');
    return;
  }

  const dateStr = formatDate(booking.visitDate);

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Ticket Booking Confirmed ✓</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${booking.customerName}, your tickets are booked!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td colspan="2" style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${booking.bookingRef}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Attraction</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${booking.attractionName}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${booking.packageName}</p>
      </td><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Visit Date</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${dateStr}</p>
      </td></tr>
      <tr><td colspan="2" style="padding:10px 0;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Tickets</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">
          ${booking.adultQty > 0 ? `${booking.adultQty} adult${booking.adultQty > 1 ? 's' : ''}` : ''}
          ${booking.childQty > 0 ? ` · ${booking.childQty} child${booking.childQty > 1 ? 'ren' : ''}` : ''}
        </p>
      </td></tr>
    </table>

    <p style="font-size:16px;font-weight:800;color:#111827;text-align:right;">Total: <span style="color:#2534ff;">${formatCurrency(booking.totalPrice)}</span></p>

    <p style="font-size:14px;color:#374151;margin-top:20px;">Present this booking reference at the attraction. Payment is due on the day unless otherwise stated.</p>
    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:24px;">
      You're receiving this email because you made a booking with Werest Travel.<br/>
      <a href="https://www.werest.com/unsubscribe?email=${encodeURIComponent(booking.customerEmail)}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      booking.customerEmail,
      subject: `Ticket Booking Confirmed – ${booking.bookingRef} | Werest Travel`,
      html:    baseLayout(`Ticket Booking Confirmed – ${booking.bookingRef}`, body),
    });
  } catch (err) {
    console.error('[email] sendAttractionConfirmationEmail failed:', err);
  }
}

// ─── Tour booking confirmation (with slug + WhatsApp) ─────────────────────────

interface TourBookingConfirmationEmailData {
  bookingRef:    string;
  customerName:  string;
  customerEmail: string;
  tourTitle:     string;
  tourSlug:      string;
  optionLabel?:  string | null;
  bookingDate:   string | Date;
  adultQty:      number;
  childQty:      number;
  adultPrice:    number;
  childPrice:    number;
  totalPrice:    number;
  notes?:        string | null;
}

export async function sendTourBookingConfirmationEmail(booking: TourBookingConfirmationEmailData): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping tour booking confirmation email');
    return;
  }

  const dateStr    = formatDate(booking.bookingDate);
  const confirmUrl = `${APP_URL}/tours/confirmation/${booking.bookingRef}`;
  const tourUrl    = `${APP_URL}/tours/${booking.tourSlug}`;
  const waNumber   = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191';
  const waUrl      = `https://wa.me/${waNumber}`;

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Your tour is confirmed! 🎉</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, we can't wait to see you!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td colspan="2" style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${escapeHtml(booking.bookingRef)}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;width:50%;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Tour</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;"><a href="${tourUrl}" style="color:#2534ff;text-decoration:none;">${escapeHtml(booking.tourTitle)}</a></p>
        ${booking.optionLabel ? `<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${escapeHtml(booking.optionLabel)}</p>` : ''}
      </td><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Date</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${dateStr}</p>
      </td></tr>
      <tr><td colspan="2" style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Guests</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">
          ${booking.adultQty} adult${booking.adultQty !== 1 ? 's' : ''}${booking.childQty > 0 ? ` · ${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''}` : ''}
        </p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="font-size:14px;color:#374151;">${booking.adultQty} adult${booking.adultQty !== 1 ? 's' : ''} × ${formatCurrency(booking.adultPrice)}</td>
        <td align="right" style="font-size:14px;color:#374151;">${formatCurrency(booking.adultQty * booking.adultPrice)}</td>
      </tr>
      ${booking.childQty > 0 ? `<tr>
        <td style="font-size:14px;color:#374151;padding-top:4px;">${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''} × ${formatCurrency(booking.childPrice)}</td>
        <td align="right" style="font-size:14px;color:#374151;padding-top:4px;">${formatCurrency(booking.childQty * booking.childPrice)}</td>
      </tr>` : ''}
      <tr>
        <td style="font-size:16px;font-weight:800;color:#111827;padding-top:10px;border-top:1px solid #e5e7eb;">Total</td>
        <td align="right" style="font-size:16px;font-weight:800;color:#2534ff;padding-top:10px;border-top:1px solid #e5e7eb;">${formatCurrency(booking.totalPrice)}</td>
      </tr>
    </table>

    ${booking.notes ? `<p style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-bottom:24px;">📝 <strong>Your notes:</strong> ${escapeHtml(booking.notes)}</p>` : ''}

    <div style="text-align:center;margin-bottom:16px;">
      <a href="${confirmUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">View Booking</a>
    </div>
    <p style="text-align:center;font-size:14px;color:#374151;margin-top:20px;">
      Questions? <a href="${waUrl}" style="color:#25D366;font-weight:600;">WhatsApp us</a>
    </p>
    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:24px;">
      You're receiving this email because you made a booking with Werest Travel.<br/>
      <a href="https://www.werest.com/unsubscribe?email=${encodeURIComponent(booking.customerEmail)}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      booking.customerEmail,
      subject: `Tour Confirmed – ${escapeHtml(booking.tourTitle)} | Werest Travel`,
      html:    baseLayout(`Tour Confirmed – ${booking.tourTitle}`, body),
    });
  } catch (err) {
    console.error('[email] sendTourBookingConfirmationEmail failed:', err);
  }
}

// ─── Attraction booking confirmation (with slug + WhatsApp) ───────────────────

interface AttractionBookingConfirmationEmailData {
  bookingRef:     string;
  customerName:   string;
  customerEmail:  string;
  attractionName: string;
  attractionSlug: string;
  packageName:    string;
  visitDate:      string | Date;
  adultQty:       number;
  childQty:       number;
  adultPrice:     number;
  childPrice:     number;
  totalPrice:     number;
  notes?:         string | null;
}

export async function sendAttractionBookingConfirmationEmail(booking: AttractionBookingConfirmationEmailData): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping attraction booking confirmation email');
    return;
  }

  const dateStr        = formatDate(booking.visitDate);
  const confirmUrl     = `${APP_URL}/confirmation/attraction/${booking.bookingRef}`;
  const attractionUrl  = `${APP_URL}/attractions/${booking.attractionSlug}`;
  const waNumber       = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191';
  const waUrl          = `https://wa.me/${waNumber}`;

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Your tickets are confirmed! 🎫</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, enjoy your visit!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td colspan="2" style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${escapeHtml(booking.bookingRef)}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;width:50%;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Attraction</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;"><a href="${attractionUrl}" style="color:#2534ff;text-decoration:none;">${escapeHtml(booking.attractionName)}</a></p>
        <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${escapeHtml(booking.packageName)}</p>
      </td><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Visit Date</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${dateStr}</p>
      </td></tr>
      <tr><td colspan="2" style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Guests</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">
          ${booking.adultQty} adult${booking.adultQty !== 1 ? 's' : ''}${booking.childQty > 0 ? ` · ${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''}` : ''}
        </p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="font-size:14px;color:#374151;">${booking.adultQty} adult${booking.adultQty !== 1 ? 's' : ''} × ${formatCurrency(booking.adultPrice)}</td>
        <td align="right" style="font-size:14px;color:#374151;">${formatCurrency(booking.adultQty * booking.adultPrice)}</td>
      </tr>
      ${booking.childQty > 0 ? `<tr>
        <td style="font-size:14px;color:#374151;padding-top:4px;">${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''} × ${formatCurrency(booking.childPrice)}</td>
        <td align="right" style="font-size:14px;color:#374151;padding-top:4px;">${formatCurrency(booking.childQty * booking.childPrice)}</td>
      </tr>` : ''}
      <tr>
        <td style="font-size:16px;font-weight:800;color:#111827;padding-top:10px;border-top:1px solid #e5e7eb;">Total</td>
        <td align="right" style="font-size:16px;font-weight:800;color:#2534ff;padding-top:10px;border-top:1px solid #e5e7eb;">${formatCurrency(booking.totalPrice)}</td>
      </tr>
    </table>

    ${booking.notes ? `<p style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-bottom:24px;">📝 <strong>Your notes:</strong> ${escapeHtml(booking.notes)}</p>` : ''}

    <div style="text-align:center;margin-bottom:16px;">
      <a href="${confirmUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">View Booking</a>
    </div>
    <p style="text-align:center;font-size:14px;color:#374151;margin-top:20px;">
      Questions? <a href="${waUrl}" style="color:#25D366;font-weight:600;">WhatsApp us</a>
    </p>
    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:24px;">
      You're receiving this email because you made a booking with Werest Travel.<br/>
      <a href="https://www.werest.com/unsubscribe?email=${encodeURIComponent(booking.customerEmail)}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      booking.customerEmail,
      subject: `Tickets Confirmed – ${escapeHtml(booking.attractionName)} | Werest Travel`,
      html:    baseLayout(`Tickets Confirmed – ${booking.attractionName}`, body),
    });
  } catch (err) {
    console.error('[email] sendAttractionBookingConfirmationEmail failed:', err);
  }
}

// ─── 24-hour reminder emails ───────────────────────────────────────────────────

interface TransferReminderData {
  bookingRef:     string;
  customerName:   string;
  customerEmail:  string;
  pickupAddress:  string;
  dropoffAddress: string;
  pickupDate:     string | Date;
  pickupTime:     string;
  vehicleType:    string;
  totalPrice:     number;
}

export async function sendTransferReminderEmail(booking: TransferReminderData): Promise<void> {
  if (!resend) return;
  const vehicleLabel = VEHICLE_LABELS[booking.vehicleType as keyof typeof VEHICLE_LABELS] ?? booking.vehicleType;
  const dateStr = formatDate(booking.pickupDate);
  const confirmUrl = `${APP_URL}/tracking?ref=${booking.bookingRef}`;

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Reminder: Your transfer is tomorrow 🚗</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, just a friendly reminder about your upcoming transfer.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${escapeHtml(booking.bookingRef)}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Pickup</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(booking.pickupAddress)}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Drop-off</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(booking.dropoffAddress)}</p>
      </td></tr>
      <tr><td style="padding:10px 0;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Date &amp; Time</p>
        <p style="margin:3px 0 0;font-size:15px;font-weight:800;color:#2534ff;">${dateStr} at ${booking.pickupTime}</p>
      </td></tr>
      <tr><td style="padding:10px 0;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Vehicle</p>
        <p style="margin:3px 0 0;font-size:14px;color:#111827;font-weight:600;">${vehicleLabel}</p>
      </td></tr>
    </table>

    <p style="font-size:14px;color:#374151;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      💳 Payment of <strong>${formatCurrency(booking.totalPrice)}</strong> is due on the day to your driver.
    </p>

    <div style="text-align:center;margin-bottom:16px;">
      <a href="${confirmUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">Track My Booking</a>
    </div>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      booking.customerEmail,
      subject: `Reminder: Your transfer tomorrow at ${booking.pickupTime} — ${booking.bookingRef}`,
      html:    baseLayout('Transfer Reminder', body),
    });
  } catch (err) {
    console.error('[email] sendTransferReminderEmail failed:', err);
  }
}

interface TourReminderData {
  bookingRef:    string;
  customerName:  string;
  customerEmail: string;
  tourTitle:     string;
  optionLabel:   string | null;
  bookingDate:   string | Date;
  totalPrice:    number;
}

export async function sendTourReminderEmail(booking: TourReminderData): Promise<void> {
  if (!resend) return;
  const dateStr = formatDate(booking.bookingDate);

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Reminder: Your tour is tomorrow 🎫</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, get ready for a great day!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${escapeHtml(booking.bookingRef)}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Tour</p>
        <p style="margin:3px 0 0;font-size:15px;color:#111827;font-weight:700;">${escapeHtml(booking.tourTitle)}</p>
        ${booking.optionLabel ? `<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${escapeHtml(booking.optionLabel)}</p>` : ''}
      </td></tr>
      <tr><td style="padding:10px 0;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Date</p>
        <p style="margin:3px 0 0;font-size:15px;font-weight:800;color:#2534ff;">${dateStr}</p>
      </td></tr>
    </table>

    <p style="font-size:14px;color:#374151;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      💳 Payment of <strong>${formatCurrency(booking.totalPrice)}</strong> is due on the day.
    </p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      booking.customerEmail,
      subject: `Reminder: Your tour tomorrow — ${booking.bookingRef}`,
      html:    baseLayout('Tour Reminder', body),
    });
  } catch (err) {
    console.error('[email] sendTourReminderEmail failed:', err);
  }
}

interface AttractionReminderData {
  bookingRef:     string;
  customerName:   string;
  customerEmail:  string;
  attractionName: string;
  packageName:    string;
  visitDate:      string | Date;
  totalPrice:     number;
}

export async function sendAttractionReminderEmail(booking: AttractionReminderData): Promise<void> {
  if (!resend) return;
  const dateStr = formatDate(booking.visitDate);

  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827;">Reminder: Your visit is tomorrow 🎟️</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, your tickets are ready for tomorrow!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr><td style="padding-bottom:14px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#2534ff;letter-spacing:1px;">${escapeHtml(booking.bookingRef)}</p>
      </td></tr>
      <tr><td style="padding:10px 0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Attraction</p>
        <p style="margin:3px 0 0;font-size:15px;color:#111827;font-weight:700;">${escapeHtml(booking.attractionName)}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${escapeHtml(booking.packageName)}</p>
      </td></tr>
      <tr><td style="padding:10px 0;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Visit Date</p>
        <p style="margin:3px 0 0;font-size:15px;font-weight:800;color:#2534ff;">${dateStr}</p>
      </td></tr>
    </table>

    <p style="font-size:14px;color:#374151;margin-bottom:8px;">Present your booking reference <strong>${escapeHtml(booking.bookingRef)}</strong> at the ticket counter.</p>
    <p style="font-size:14px;color:#374151;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      💳 Payment of <strong>${formatCurrency(booking.totalPrice)}</strong> is due on arrival unless already paid.
    </p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      booking.customerEmail,
      subject: `Reminder: Your visit to ${booking.attractionName} tomorrow — ${booking.bookingRef}`,
      html:    baseLayout('Visit Reminder', body),
    });
  } catch (err) {
    console.error('[email] sendAttractionReminderEmail failed:', err);
  }
}
