import { Resend } from 'resend';
import { formatCurrency, formatDate, VEHICLE_LABELS } from './utils';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = `${process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Werest Travel'} <noreply@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN ?? 'gowerest.com'}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gowerest.com';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function baseLayout(title: string, body: string): string {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392';
  const waHref   = `https://wa.me/${waNumber}?text=${encodeURIComponent('Hi, I need help with my booking')}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:24px 12px;">
  <tr><td align="center">
    <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

      <!-- Top brand bar -->
      <tr>
        <td style="background:linear-gradient(135deg,#1a24e0 0%,#2534ff 50%,#3d4eff 100%);border-radius:16px 16px 0 0;padding:24px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Werest Travel 🇹🇭</span>
                <br/><span style="color:rgba(255,255,255,0.65);font-size:12px;letter-spacing:0.5px;">PRIVATE TRANSFERS · TOURS · EXPERIENCES</span>
              </td>
              <td align="right">
                <span style="color:rgba(255,255,255,0.9);font-size:28px;">✈️</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body card -->
      <tr>
        <td style="background:#ffffff;padding:36px 36px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
          ${body}
        </td>
      </tr>

      <!-- WhatsApp support strip -->
      <tr>
        <td style="background:#f6fdf8;border:1px solid #d1fae5;border-top:none;border-bottom:none;padding:16px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#374151;">
                <strong style="color:#065f46;">Need help?</strong> Contact us any time:
              </td>
              <td align="right">
                <a href="${waHref}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:12px;font-weight:700;padding:8px 16px;border-radius:8px;text-decoration:none;">💬 WhatsApp Us</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
          <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
            <a href="${APP_URL}" style="color:#2534ff;text-decoration:none;font-weight:600;">gowerest.com</a>
            &nbsp;·&nbsp; Bangkok, Thailand
            &nbsp;·&nbsp; <a href="mailto:werestcompany@gmail.com" style="color:#9ca3af;text-decoration:none;">werestcompany@gmail.com</a>
          </p>
          <p style="margin:0;color:#d1d5db;font-size:11px;">
            You received this because you made a booking with Werest Travel.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Email verification ────────────────────────────────────────────────────────

export async function sendVerificationEmail(params: {
  to:        string;
  name:      string;
  verifyUrl: string; // full URL, e.g. https://gowerest.com/api/user/verify-email?token=xxx
}): Promise<void> {
  if (!resend) {
    console.warn('[email] Resend not configured — verification email not sent');
    return;
  }

  await resend.emails.send({
    from:    FROM,
    to:      [params.to],
    subject: 'Verify your Werest Travel account',
    html: baseLayout('Verify Your Email', `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 36px 24px">
          <h2 style="color:#111827;font-size:22px;margin:0 0 8px">Hi ${escapeHtml(params.name)}, welcome to Werest! 🇹🇭</h2>
          <p style="color:#4b5563;line-height:1.6;margin:0 0 24px">Please verify your email address to activate your account and receive booking confirmations.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${params.verifyUrl}" style="display:inline-block;background:#2534ff;color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:10px">Verify My Email</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:16px 0 0">This link expires in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.</p>
        </td></tr>
      </table>
    `),
  });
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
    <!-- Success header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:60px;height:60px;background:#d1fae5;border-radius:50%;line-height:60px;font-size:28px;margin-bottom:12px;">✓</div>
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:900;color:#065f46;letter-spacing:-0.5px;">Booking Confirmed!</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, your transfer is locked in.</p>
    </div>

    <!-- Booking ref box -->
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8edff);border:2px solid #c7d2fe;border-radius:14px;padding:18px 24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#6366f1;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Booking Reference</p>
      <p style="margin:0;font-size:30px;font-weight:900;color:#2534ff;letter-spacing:3px;">${booking.bookingRef}</p>
      <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">Save this for tracking and support</p>
    </div>

    <!-- Route card -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;width:44%;">
            <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">📍 Pickup</p>
            <p style="margin:0;font-size:13px;color:#111827;font-weight:700;line-height:1.4;">${escapeHtml(booking.pickupAddress)}</p>
          </td>
          <td style="text-align:center;vertical-align:middle;width:12%;color:#d1d5db;font-size:20px;padding:0 4px;">→</td>
          <td style="vertical-align:top;width:44%;">
            <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">🏁 Drop-off</p>
            <p style="margin:0;font-size:13px;color:#111827;font-weight:700;line-height:1.4;">${escapeHtml(booking.dropoffAddress)}</p>
          </td>
        </tr>
      </table>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:33%;vertical-align:top;text-align:center;">
              <p style="margin:0 0 3px;font-size:18px;">📅</p>
              <p style="margin:0 0 2px;font-size:10px;color:#9ca3af;text-transform:uppercase;">Date</p>
              <p style="margin:0;font-size:13px;color:#111827;font-weight:700;">${dateStr}</p>
            </td>
            <td style="width:33%;vertical-align:top;text-align:center;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <p style="margin:0 0 3px;font-size:18px;">⏰</p>
              <p style="margin:0 0 2px;font-size:10px;color:#9ca3af;text-transform:uppercase;">Pickup Time</p>
              <p style="margin:0;font-size:20px;color:#2534ff;font-weight:900;">${booking.pickupTime}</p>
            </td>
            <td style="width:33%;vertical-align:top;text-align:center;">
              <p style="margin:0 0 3px;font-size:18px;">🚗</p>
              <p style="margin:0 0 2px;font-size:10px;color:#9ca3af;text-transform:uppercase;">Vehicle</p>
              <p style="margin:0;font-size:13px;color:#111827;font-weight:700;">${vehicleLabel}</p>
            </td>
          </tr>
        </table>
      </div>
      <div style="margin-top:12px;padding:8px 12px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;display:inline-block;">
        <span style="font-size:12px;color:#374151;">👥 ${booking.passengers} passenger${booking.passengers !== 1 ? 's' : ''} · 🧳 ${booking.luggage} bag${booking.luggage !== 1 ? 's' : ''}</span>
      </div>
    </div>

    <!-- Price summary -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px 24px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Price Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:14px;color:#374151;padding:4px 0;">Base fare</td>
          <td align="right" style="font-size:14px;color:#374151;padding:4px 0;">${formatCurrency(booking.basePrice)}</td>
        </tr>
        ${booking.addOnsTotal > 0 ? `<tr>
          <td style="font-size:14px;color:#374151;padding:4px 0;">Add-ons</td>
          <td align="right" style="font-size:14px;color:#374151;padding:4px 0;">${formatCurrency(booking.addOnsTotal)}</td>
        </tr>` : ''}
        <tr>
          <td style="font-size:16px;font-weight:900;color:#111827;padding-top:12px;border-top:2px solid #e5e7eb;">Total</td>
          <td align="right" style="font-size:20px;font-weight:900;color:#2534ff;padding-top:12px;border-top:2px solid #e5e7eb;">${formatCurrency(booking.totalPrice)}</td>
        </tr>
      </table>
      <p style="margin:10px 0 0;font-size:12px;color:#f59e0b;background:#fffbeb;border-radius:8px;padding:8px 12px;">💳 Payment is due on the day of travel. Your driver will collect payment on arrival.</p>
    </div>

    ${booking.specialNotes ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#92400e;"><strong>📝 Your notes:</strong> ${escapeHtml(booking.specialNotes)}</p>
    </div>` : ''}

    <!-- What happens next -->
    <div style="margin-bottom:24px;">
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">What happens next</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:36px;vertical-align:top;padding:6px 0;"><span style="font-size:18px;">📱</span></td>
          <td style="vertical-align:top;padding:6px 0 6px 8px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">Driver assigned</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Your driver will be confirmed 24 hours before pickup.</p>
          </td>
        </tr>
        <tr>
          <td style="width:36px;vertical-align:top;padding:6px 0;"><span style="font-size:18px;">💬</span></td>
          <td style="vertical-align:top;padding:6px 0 6px 8px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">Reminder sent</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">You'll receive a WhatsApp reminder the evening before.</p>
          </td>
        </tr>
        <tr>
          <td style="width:36px;vertical-align:top;padding:6px 0;"><span style="font-size:18px;">🚗</span></td>
          <td style="vertical-align:top;padding:6px 0 6px 8px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">Pickup day</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Your driver will contact you 30 min before arrival.</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA button -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${confirmUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:800;font-size:15px;padding:16px 40px;border-radius:14px;text-decoration:none;letter-spacing:-0.3px;">Track My Booking →</a>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:8px 0 0;">Or enter ref <strong>${booking.bookingRef}</strong> at <a href="${trackUrl}" style="color:#2534ff;">${APP_URL}/tracking</a></p>
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
    <!-- Success header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:60px;height:60px;background:#d1fae5;border-radius:50%;line-height:60px;font-size:28px;margin-bottom:12px;">✓</div>
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:900;color:#065f46;letter-spacing:-0.5px;">Tour Booking Confirmed!</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, your adventure is booked!</p>
    </div>

    <!-- Booking ref box -->
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8edff);border:2px solid #c7d2fe;border-radius:14px;padding:18px 24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#6366f1;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Booking Reference</p>
      <p style="margin:0;font-size:30px;font-weight:900;color:#2534ff;letter-spacing:3px;">${booking.bookingRef}</p>
      <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">Save this for tracking and support</p>
    </div>

    <!-- Tour info card -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">🗺️ Tour Details</p>
      <p style="margin:0 0 16px;font-size:17px;font-weight:800;color:#111827;line-height:1.3;">${escapeHtml(booking.tourTitle)}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:12px;">
            <p style="margin:0 0 3px;font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:700;">📅 Date</p>
            <p style="margin:0;font-size:14px;color:#111827;font-weight:700;">${dateStr}</p>
          </td>
          <td style="width:50%;vertical-align:top;">
            <p style="margin:0 0 3px;font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:700;">⏰ Departure</p>
            <p style="margin:0;font-size:14px;color:#2534ff;font-weight:900;">${booking.tourTime ?? 'TBC'}</p>
          </td>
        </tr>
        ${booking.meetingPoint ? `<tr>
          <td colspan="2" style="padding-top:14px;vertical-align:top;">
            <p style="margin:0 0 3px;font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:700;">📍 Meeting Point</p>
            <p style="margin:0;font-size:13px;color:#111827;font-weight:700;">${escapeHtml(booking.meetingPoint)}</p>
          </td>
        </tr>` : ''}
        <tr>
          <td colspan="2" style="padding-top:14px;vertical-align:top;">
            <p style="margin:0 0 3px;font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:700;">👥 Guests</p>
            <p style="margin:0;font-size:13px;color:#111827;font-weight:700;">${booking.adultQty} adult${booking.adultQty !== 1 ? 's' : ''}${booking.childQty > 0 ? ` · ${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''}` : ''}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Price summary -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px 24px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Price Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:14px;color:#374151;padding:4px 0;">${booking.adultQty} adult${booking.adultQty !== 1 ? 's' : ''} × ${formatCurrency(booking.adultPrice)}</td>
          <td align="right" style="font-size:14px;color:#374151;padding:4px 0;">${formatCurrency(booking.adultQty * booking.adultPrice)}</td>
        </tr>
        ${booking.childQty > 0 ? `<tr>
          <td style="font-size:14px;color:#374151;padding:4px 0;">${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''} × ${formatCurrency(booking.childPrice)}</td>
          <td align="right" style="font-size:14px;color:#374151;padding:4px 0;">${formatCurrency(booking.childQty * booking.childPrice)}</td>
        </tr>` : ''}
        <tr>
          <td style="font-size:16px;font-weight:900;color:#111827;padding-top:12px;border-top:2px solid #e5e7eb;">Total</td>
          <td align="right" style="font-size:20px;font-weight:900;color:#2534ff;padding-top:12px;border-top:2px solid #e5e7eb;">${formatCurrency(booking.totalPrice)}</td>
        </tr>
      </table>
    </div>

    ${booking.notes ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#92400e;"><strong>📝 Your notes:</strong> ${escapeHtml(booking.notes)}</p>
    </div>` : ''}

    <!-- What to bring -->
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:14px;padding:18px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0369a1;">🎒 What to bring</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:24px;vertical-align:top;padding:4px 0;font-size:16px;">👟</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Comfortable walking shoes</td>
        </tr>
        <tr>
          <td style="width:24px;vertical-align:top;padding:4px 0;font-size:16px;">☀️</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Sunscreen &amp; sun hat</td>
        </tr>
        <tr>
          <td style="width:24px;vertical-align:top;padding:4px 0;font-size:16px;">📷</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Camera or smartphone for photos</td>
        </tr>
      </table>
    </div>

    <!-- CTA button -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${confirmUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:800;font-size:15px;padding:16px 40px;border-radius:14px;text-decoration:none;letter-spacing:-0.3px;">Track My Booking →</a>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:8px 0 0;">Ref: <strong>${booking.bookingRef}</strong></p>
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
    <!-- Success header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:60px;height:60px;background:#d1fae5;border-radius:50%;line-height:60px;font-size:28px;margin-bottom:12px;">✓</div>
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:900;color:#065f46;letter-spacing:-0.5px;">Tickets Confirmed!</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${escapeHtml(booking.customerName)}, enjoy your visit!</p>
    </div>

    <!-- Booking ref box -->
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8edff);border:2px solid #c7d2fe;border-radius:14px;padding:18px 24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#6366f1;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Booking Reference</p>
      <p style="margin:0;font-size:30px;font-weight:900;color:#2534ff;letter-spacing:3px;">${booking.bookingRef}</p>
      <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">Present this reference at the ticket counter</p>
    </div>

    <!-- Ticket info card -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">🎫 Your Tickets</p>
      <p style="margin:0 0 16px;font-size:17px;font-weight:800;color:#111827;line-height:1.3;">${escapeHtml(booking.attractionName)}</p>
      <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">${escapeHtml(booking.packageName)}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:12px;">
            <p style="margin:0 0 3px;font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:700;">📅 Visit Date</p>
            <p style="margin:0;font-size:15px;color:#2534ff;font-weight:900;">${dateStr}</p>
          </td>
          <td style="width:50%;vertical-align:top;">
            <p style="margin:0 0 3px;font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:700;">👥 Guests</p>
            <p style="margin:0;font-size:13px;color:#111827;font-weight:700;">
              ${booking.adultQty > 0 ? `${booking.adultQty} adult${booking.adultQty > 1 ? 's' : ''}` : ''}${booking.childQty > 0 ? ` · ${booking.childQty} child${booking.childQty > 1 ? 'ren' : ''}` : ''}
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Price summary -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Price Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:16px;font-weight:900;color:#111827;">Total</td>
          <td align="right" style="font-size:24px;font-weight:900;color:#2534ff;">${formatCurrency(booking.totalPrice)}</td>
        </tr>
      </table>
      <p style="margin:10px 0 0;font-size:12px;color:#f59e0b;background:#fffbeb;border-radius:8px;padding:8px 12px;">💳 Payment is due on the day of your visit unless otherwise stated.</p>
    </div>

    <!-- What to bring -->
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:14px;padding:18px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0369a1;">🎒 What to bring</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:24px;vertical-align:top;padding:4px 0;font-size:16px;">👟</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Comfortable walking shoes</td>
        </tr>
        <tr>
          <td style="width:24px;vertical-align:top;padding:4px 0;font-size:16px;">☀️</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Sunscreen &amp; sun hat</td>
        </tr>
        <tr>
          <td style="width:24px;vertical-align:top;padding:4px 0;font-size:16px;">📷</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Camera or smartphone for photos</td>
        </tr>
      </table>
    </div>
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
  const waNumber   = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392';
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
      <a href="https://gowerest.com/unsubscribe?email=${encodeURIComponent(booking.customerEmail)}" style="color:#9ca3af;">Unsubscribe</a>
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
  const waNumber       = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392';
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
      <a href="https://gowerest.com/unsubscribe?email=${encodeURIComponent(booking.customerEmail)}" style="color:#9ca3af;">Unsubscribe</a>
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

// ─── Quote email ──────────────────────────────────────────────────────────────

export async function sendQuoteEmail(params: {
  to: string;
  name: string;
  inquiryRef: string;
  lineItems: Array<{ description: string; unitPrice: number; qty: number }>;
  totalAmount: number;
  validUntil: Date;
  acceptUrl: string;
  notes?: string;
}): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping quote email');
    return;
  }

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392';
  const waUrl    = `https://wa.me/${waNumber}`;
  const validStr = params.validUntil.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const lineItemsHtml = params.lineItems.map(item => {
    const lineTotal = item.unitPrice * item.qty;
    return `
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">${escapeHtml(item.description)}</td>
        <td style="padding:10px 0;font-size:14px;color:#6b7280;text-align:center;border-bottom:1px solid #f3f4f6;">${item.qty}</td>
        <td style="padding:10px 0;font-size:14px;color:#6b7280;text-align:right;border-bottom:1px solid #f3f4f6;">฿${item.unitPrice.toLocaleString()}</td>
        <td style="padding:10px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6;">฿${lineTotal.toLocaleString()}</td>
      </tr>`;
  }).join('');

  const body = `
    <!-- Header -->
    <div style="margin-bottom:28px;">
      <div style="display:inline-block;background:#f0f4ff;border-radius:12px;padding:10px 18px;margin-bottom:16px;">
        <span style="font-size:13px;font-weight:700;color:#2534ff;letter-spacing:0.5px;">YOUR QUOTE IS READY</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#111827;letter-spacing:-0.5px;">
        Hi ${escapeHtml(params.name)}, here's your personalised quote 🎉
      </h1>
      <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
        Thank you for your interest in Werest Travel. We've prepared a detailed quote for your group trip.
      </p>
    </div>

    <!-- Ref box -->
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8edff);border:2px solid #c7d2fe;border-radius:14px;padding:16px 24px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:11px;color:#6366f1;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Inquiry Reference</p>
      <p style="margin:0;font-size:26px;font-weight:900;color:#2534ff;letter-spacing:2px;">${escapeHtml(params.inquiryRef)}</p>
    </div>

    <!-- Line items table -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Quote Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:10px;border-bottom:2px solid #e5e7eb;">Description</th>
            <th style="text-align:center;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:10px;border-bottom:2px solid #e5e7eb;">Qty</th>
            <th style="text-align:right;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:10px;border-bottom:2px solid #e5e7eb;">Unit Price</th>
            <th style="text-align:right;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:10px;border-bottom:2px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding-top:14px;font-size:16px;font-weight:900;color:#111827;">Grand Total</td>
            <td style="padding-top:14px;font-size:22px;font-weight:900;color:#2534ff;text-align:right;">฿${params.totalAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${params.notes ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#92400e;"><strong>📝 Notes from our team:</strong> ${escapeHtml(params.notes)}</p>
    </div>` : ''}

    <!-- Validity -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-bottom:28px;text-align:center;">
      <p style="margin:0;font-size:14px;color:#166534;">
        ⏳ This quote is valid until <strong>${validStr}</strong>
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${params.acceptUrl}"
        style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:800;font-size:16px;padding:18px 48px;border-radius:14px;text-decoration:none;letter-spacing:-0.3px;box-shadow:0 4px 14px rgba(37,52,255,0.3);">
        Accept This Quote →
      </a>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:0 0 28px;">
      Clicking "Accept" confirms your interest — our team will follow up within 2 hours.
    </p>

    <!-- Contact strip -->
    <div style="text-align:center;padding:20px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:14px;color:#374151;font-weight:600;">Questions about your quote?</p>
      <p style="margin:0;font-size:13px;color:#6b7280;">
        Reply to this email or
        <a href="${waUrl}" style="color:#25D366;font-weight:700;text-decoration:none;"> WhatsApp us</a>
        — we reply within minutes.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      params.to,
      subject: `Your Werest Travel Quote — ${params.inquiryRef}`,
      html:    baseLayout(`Your Quote — ${params.inquiryRef}`, body),
    });
  } catch (err) {
    console.error('[email] sendQuoteEmail failed:', err);
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

// ─── Abandoned booking recovery ────────────────────────────────────────────────

export async function sendAbandonedBookingEmail(params: {
  to:          string;
  name:        string;
  bookingType: 'transfer' | 'tour';
  partialData: Record<string, unknown>;
  resumeUrl:   string;
}): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping abandoned booking email');
    return;
  }

  const { to, name, bookingType, partialData, resumeUrl } = params;
  const safeeName = escapeHtml(name);
  const typeLabel = bookingType === 'transfer' ? 'transfer' : 'tour';

  // Build a human-readable summary from partial data
  let tripSummary = '';
  if (bookingType === 'transfer') {
    const pickup  = typeof partialData.pickupAddress  === 'string' ? escapeHtml(partialData.pickupAddress)  : null;
    const dropoff = typeof partialData.dropoffAddress === 'string' ? escapeHtml(partialData.dropoffAddress) : null;
    if (pickup && dropoff) {
      tripSummary = `<p style="font-size:14px;color:#374151;margin:0 0 4px;"><strong>Route:</strong> ${pickup} → ${dropoff}</p>`;
    }
    const date = typeof partialData.pickupDate === 'string' ? escapeHtml(partialData.pickupDate) : null;
    if (date) {
      tripSummary += `<p style="font-size:14px;color:#374151;margin:0;">📅 ${date}</p>`;
    }
  } else {
    const tourName = typeof partialData.tourTitle === 'string' ? escapeHtml(partialData.tourTitle) : null;
    if (tourName) {
      tripSummary = `<p style="font-size:14px;color:#374151;margin:0;"><strong>Tour:</strong> ${tourName}</p>`;
    }
    const date = typeof partialData.bookingDate === 'string' ? escapeHtml(partialData.bookingDate) : null;
    if (date) {
      tripSummary += `<p style="font-size:14px;color:#374151;margin:4px 0 0;">📅 ${date}</p>`;
    }
  }

  const body = `
    <!-- Header icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:60px;height:60px;background:#fff7ed;border-radius:50%;line-height:60px;font-size:28px;margin-bottom:12px;">⏳</div>
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#111827;">You left something behind</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${safeeName}, your ${typeLabel} booking is waiting for you.</p>
    </div>

    <!-- Trip summary card -->
    ${tripSummary ? `
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Your saved booking</p>
      ${tripSummary}
    </div>` : ''}

    <!-- Urgency notice -->
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:12px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#92400e;">🔥 <strong>Popular dates fill up fast.</strong> Complete your booking to lock in your spot.</p>
    </div>

    <!-- CTA button -->
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${resumeUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:800;font-size:16px;padding:16px 44px;border-radius:14px;text-decoration:none;letter-spacing:-0.3px;">Complete Your Booking →</a>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:12px 0 0;">This link expires in 24 hours. After that, you can start a new booking at <a href="${APP_URL}" style="color:#2534ff;">gowerest.com</a></p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      [to],
      subject: `You left something behind — complete your ${typeLabel} booking`,
      html:    baseLayout('Complete Your Booking', body),
    });
  } catch (err) {
    console.error('[email] sendAbandonedBookingEmail failed:', err);
  }
}

// ─── Post-trip review request ──────────────────────────────────────────────────

export async function sendPostTripReviewEmail(params: {
  to:          string;
  name:        string;
  serviceName: string;
  serviceType: 'tour' | 'transfer' | 'attraction';
  entityId:    string;
  bookingRef:  string;
}): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set – skipping post-trip review email');
    return;
  }

  const { to, name, serviceName, serviceType, entityId, bookingRef } = params;
  const reviewUrl   = `${APP_URL}/review/write?ref=${encodeURIComponent(bookingRef)}&type=${encodeURIComponent(serviceType)}&entity=${encodeURIComponent(entityId)}`;
  const safeeName   = escapeHtml(name);
  const safeService = escapeHtml(serviceName);

  // Star rating row — each star links to the review page with a pre-selected rating
  const stars = [1, 2, 3, 4, 5]
    .map(n => `<a href="${reviewUrl}&rating=${n}" style="font-size:36px;text-decoration:none;line-height:1;">⭐</a>`)
    .join('&nbsp;');

  const body = `
    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:60px;height:60px;background:#fef9c3;border-radius:50%;line-height:60px;font-size:28px;margin-bottom:12px;">⭐</div>
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#111827;">How was your experience?</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${safeeName}, we hope you had an amazing time!</p>
    </div>

    <!-- Service card -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px 24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Your recent experience</p>
      <p style="margin:0;font-size:17px;font-weight:800;color:#111827;">${safeService}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">Booking: ${escapeHtml(bookingRef)}</p>
    </div>

    <!-- Star rating -->
    <div style="text-align:center;margin-bottom:24px;">
      <p style="font-size:14px;color:#374151;margin:0 0 16px;font-weight:600;">Tap a star to rate your experience:</p>
      <div>${stars}</div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:20px;">
      <a href="${reviewUrl}" style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:800;font-size:15px;padding:14px 40px;border-radius:14px;text-decoration:none;letter-spacing:-0.3px;">Write a Review →</a>
    </div>

    <p style="text-align:center;font-size:13px;color:#9ca3af;margin:0;">It only takes 2 minutes and helps other travellers discover great experiences in Thailand 🇹🇭</p>
  `;

  try {
    await resend.emails.send({
      from:    FROM,
      to:      [to],
      subject: `How was your experience? Leave a review — ${safeService}`,
      html:    baseLayout('How was your experience?', body),
    });
  } catch (err) {
    console.error('[email] sendPostTripReviewEmail failed:', err);
  }
}
