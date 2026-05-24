/**
 * Email HTML generators for the automated post-trip journey.
 *
 * All functions return a complete HTML string ready to pass to Resend.
 * They follow the same baseLayout() approach as src/lib/email.ts.
 */

const APP_URL  = process.env.NEXT_PUBLIC_APP_URL  ?? 'https://werest.com';
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function baseLayout(title: string, body: string): string {
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi, I need help with my booking')}`;
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
                <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Werest Travel &#x1F1F9;&#x1F1ED;</span>
                <br/><span style="color:rgba(255,255,255,0.65);font-size:12px;letter-spacing:0.5px;">PRIVATE TRANSFERS · TOURS · EXPERIENCES</span>
              </td>
              <td align="right">
                <span style="color:rgba(255,255,255,0.9);font-size:28px;">&#9992;&#xFE0F;</span>
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
                <a href="${waHref}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:12px;font-weight:700;padding:8px 16px;border-radius:8px;text-decoration:none;">&#x1F4AC; WhatsApp Us</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
          <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
            <a href="${APP_URL}" style="color:#2534ff;text-decoration:none;font-weight:600;">werest.com</a>
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

// ─── 1. Post-trip review request ──────────────────────────────────────────────

export interface ReviewRequestEmailData {
  customerName: string;
  bookingRef:   string;
  pickupDate:   string | Date;
  reviewUrl:    string;
}

/**
 * Builds the HTML for the post-trip review request email.
 * Subject (caller's responsibility): "How was your Werest transfer? ⭐"
 */
export function buildReviewRequestEmail(data: ReviewRequestEmailData): string {
  const name      = escapeHtml(data.customerName.split(' ')[0] ?? data.customerName);
  const ref       = escapeHtml(data.bookingRef);
  const reviewUrl = data.reviewUrl;

  const dateStr = typeof data.pickupDate === 'string'
    ? data.pickupDate
    : data.pickupDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const body = `
    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">&#11088;</div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#111827;letter-spacing:-0.5px;">How was your journey?</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">We hope you had a smooth ride, ${name}!</p>
    </div>

    <!-- Booking reference -->
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8edff);border:2px solid #c7d2fe;border-radius:14px;padding:16px 24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#6366f1;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Booking</p>
      <p style="margin:0;font-size:22px;font-weight:900;color:#2534ff;letter-spacing:2px;">${ref}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">${dateStr}</p>
    </div>

    <!-- Message body -->
    <p style="font-size:15px;color:#374151;line-height:1.6;margin-bottom:16px;">
      Your feedback helps other travellers make great choices — and it means the world to our local driver team.
      It only takes <strong>2 minutes</strong> and every star counts!
    </p>

    <!-- Star CTA -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:13px;color:#92400e;font-weight:600;">How would you rate your experience?</p>
      <p style="margin:0 0 20px;font-size:32px;letter-spacing:4px;">&#11088;&#11088;&#11088;&#11088;&#11088;</p>
      <a href="${reviewUrl}"
         style="display:inline-block;background:#f59e0b;color:#ffffff;font-weight:800;font-size:16px;padding:16px 48px;border-radius:14px;text-decoration:none;letter-spacing:-0.3px;">
        Leave a Review &#x2192;
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">Takes about 2 minutes &middot; Helps other travellers</p>
    </div>

    <!-- Why it matters -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:8px;">
      <p style="margin:0 0 10px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Why review?</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:28px;vertical-align:top;padding:4px 0;font-size:16px;">&#10003;</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Your review gets a <strong>Verified</strong> badge — automatically applied</td>
        </tr>
        <tr>
          <td style="width:28px;vertical-align:top;padding:4px 0;font-size:16px;">&#10003;</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Helps travellers choose a trusted service</td>
        </tr>
        <tr>
          <td style="width:28px;vertical-align:top;padding:4px 0;font-size:16px;">&#10003;</td>
          <td style="vertical-align:top;padding:4px 0 4px 8px;font-size:13px;color:#374151;">Your feedback improves our drivers' service</td>
        </tr>
      </table>
    </div>
  `;

  return baseLayout('How was your Werest transfer?', body);
}

// ─── 2. Re-engagement email ───────────────────────────────────────────────────

export interface ReEngagementEmailData {
  customerName: string;
  bookingRef:   string;
  discountCode: string;
}

/**
 * Builds the HTML for the 7-day re-engagement email.
 * Subject (caller's responsibility): "Your next Thailand adventure awaits 🌴"
 */
export function buildReEngagementEmail(data: ReEngagementEmailData): string {
  const name         = escapeHtml(data.customerName.split(' ')[0] ?? data.customerName);
  const discountCode = escapeHtml(data.discountCode);
  const bookUrl      = `${APP_URL}?utm_source=email&utm_campaign=re_engagement`;

  const body = `
    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">&#x1F334;</div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#111827;letter-spacing:-0.5px;">Miss Thailand already?</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">It's been a week since your last trip with us, ${name}!</p>
    </div>

    <!-- Personal message -->
    <p style="font-size:15px;color:#374151;line-height:1.6;margin-bottom:20px;">
      We loved having you on board. Whether you're planning your next adventure, heading back to the airport, or
      exploring somewhere new — Werest Travel is ready to take you there in style and comfort.
    </p>

    <!-- Discount offer -->
    <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #6ee7b7;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;color:#065f46;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Special Offer — Just for You</p>
      <p style="margin:0 0 12px;font-size:15px;color:#374151;">Get <strong style="color:#059669;">฿100 off</strong> your next booking</p>

      <!-- Discount code box -->
      <div style="display:inline-block;background:#ffffff;border:2px dashed #6ee7b7;border-radius:10px;padding:10px 28px;margin-bottom:16px;">
        <p style="margin:0 0 2px;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Discount Code</p>
        <p style="margin:0;font-size:26px;font-weight:900;color:#059669;letter-spacing:3px;">${discountCode}</p>
      </div>

      <br/>
      <a href="${bookUrl}"
         style="display:inline-block;background:#059669;color:#ffffff;font-weight:800;font-size:16px;padding:16px 48px;border-radius:14px;text-decoration:none;letter-spacing:-0.3px;">
        Book Your Next Transfer &#x2192;
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#6b7280;">Apply code at checkout &middot; Valid for 30 days</p>
    </div>

    <!-- What we offer -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Why choose Werest again?</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:28px;vertical-align:top;padding:5px 0;font-size:18px;">&#x1F697;</td>
          <td style="vertical-align:top;padding:5px 0 5px 10px;font-size:13px;color:#374151;"><strong>Private transfers</strong> — airport, city-to-city, hotel hops</td>
        </tr>
        <tr>
          <td style="width:28px;vertical-align:top;padding:5px 0;font-size:18px;">&#x1F5FA;&#xFE0F;</td>
          <td style="vertical-align:top;padding:5px 0 5px 10px;font-size:13px;color:#374151;"><strong>Tours &amp; day trips</strong> — Phi Phi, Kanchanaburi, Floating Markets &amp; more</td>
        </tr>
        <tr>
          <td style="width:28px;vertical-align:top;padding:5px 0;font-size:18px;">&#x1F3AB;</td>
          <td style="vertical-align:top;padding:5px 0 5px 10px;font-size:13px;color:#374151;"><strong>Attraction tickets</strong> — book online, skip the queue</td>
        </tr>
        <tr>
          <td style="width:28px;vertical-align:top;padding:5px 0;font-size:18px;">&#x2764;&#xFE0F;</td>
          <td style="vertical-align:top;padding:5px 0 5px 10px;font-size:13px;color:#374151;"><strong>English-speaking drivers</strong> — friendly, punctual, professional</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin-bottom:8px;">
      <a href="${bookUrl}"
         style="display:inline-block;background:#2534ff;color:#ffffff;font-weight:700;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;">
        Explore Thailand with Werest &#x2192;
      </a>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:8px 0 0;">We can't wait to travel with you again! &#x1F1F9;&#x1F1ED;</p>
  `;

  return baseLayout('Your next Thailand adventure awaits', body);
}
