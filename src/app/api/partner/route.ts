import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const FROM    = process.env.EMAIL_FROM      ?? 'Werest Travel <noreply@werest.com>'
const ADMIN   = process.env.EMAIL_ADMIN     ?? 'werestcompany@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com'

interface PartnerApplication {
  partnerType:   string
  companyName:   string
  website?:      string
  location:      string
  monthlyVolume: string
  contactName:   string
  email:         string
  phone:         string
  message?:      string
}

export async function POST(req: NextRequest) {
  try {
    const body: PartnerApplication = await req.json()

    const { partnerType, companyName, contactName, email, phone, location, monthlyVolume } = body
    if (!partnerType || !companyName || !contactName || !email || !phone) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 })
    }

    // ── Send admin notification ─────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New Partner Application</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;">
  <tr><td style="background:#2534ff;padding:28px 40px;">
    <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Werest Travel</p>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">🤝 New Partner Application</h1>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Partner Type</p>
        <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:700;">${partnerType}</p>
      </td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Company</p>
        <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:700;">${companyName}${body.website ? ` · <a href="${body.website}" style="color:#2534ff;">${body.website}</a>` : ''}</p>
      </td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Contact</p>
        <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:700;">${contactName}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${email} · ${phone}</p>
      </td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Location</p>
        <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:600;">${location}</p>
      </td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Monthly Volume</p>
        <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:600;">${monthlyVolume} bookings/month</p>
      </td></tr>
      ${body.message ? `<tr><td style="padding:10px 0;">
        <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Message</p>
        <p style="margin:4px 0 0;font-size:14px;color:#374151;line-height:1.6;">${body.message}</p>
      </td></tr>` : ''}
    </table>
    <div style="margin-top:24px;">
      <a href="mailto:${email}" style="display:inline-block;background:#2534ff;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">Reply to ${contactName}</a>
    </div>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-radius:0 0 16px 16px;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">Submitted via ${APP_URL}/partner</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`

      // Send to admin
      await resend.emails.send({
        from:    FROM,
        to:      ADMIN,
        replyTo: email,
        subject: `🤝 New Partner Application — ${companyName} (${partnerType})`,
        html:    adminHtml,
      })

      // Send acknowledgement to applicant
      const ackHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;">
  <tr><td style="background:#2534ff;padding:32px 40px;text-align:center;">
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Werest Travel</p>
    <h1 style="margin:0 0 4px;color:#fff;font-size:26px;font-weight:800;">Application Received ✓</h1>
    <p style="margin:0;color:rgba(255,255,255,0.8);">We'll be in touch within 1–2 business days.</p>
  </td></tr>
  <tr><td style="padding:36px 40px;">
    <p style="margin:0 0 20px;font-size:15px;color:#374151;">Hi <strong>${contactName.split(' ')[0]}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">Thank you for your interest in partnering with Werest Travel. We've received your application for <strong style="color:#111827;">${companyName}</strong> and our partnerships team will review it shortly.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">Expect a reply from us within <strong style="color:#111827;">1–2 business days</strong>. In the meantime, feel free to browse our tour offerings or reach us on WhatsApp for any urgent questions.</p>
    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#374151;">Your Application Summary</p>
      <p style="margin:2px 0;font-size:13px;color:#6b7280;">Type: ${partnerType}</p>
      <p style="margin:2px 0;font-size:13px;color:#6b7280;">Company: ${companyName}</p>
      <p style="margin:2px 0;font-size:13px;color:#6b7280;">Location: ${location}</p>
    </div>
    <a href="${APP_URL}/tours" style="display:block;background:#2534ff;color:#fff;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">Explore Our Tours</a>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:24px 40px;text-align:center;border-radius:0 0 16px 16px;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Werest Travel · Thailand</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`

      await resend.emails.send({
        from:    FROM,
        to:      email,
        subject: `We received your partnership application — Werest Travel`,
        html:    ackHtml,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/partner]', err)
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 })
  }
}
