export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTHB(amount: number): string {
  return `฿${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function statusBadgeColor(status: string): string {
  const s = status.toUpperCase()
  if (['CONFIRMED', 'COMPLETED', 'DRIVER_CONFIRMED', 'PAID', 'USED'].includes(s)) return '#10b981'
  if (['CANCELLED', 'FAILED'].includes(s)) return '#ef4444'
  return '#f59e0b'
}

function not404Html(bookingRef: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Voucher Not Found — Werest Travel</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; color: #374151; }
    .box { text-align: center; padding: 2rem; }
    h1 { font-size: 1.5rem; color: #111827; }
    p { color: #6b7280; }
    a { color: #2534ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Voucher Not Found</h1>
    <p>No booking found for reference <strong>${bookingRef}</strong>.</p>
    <p><a href="https://www.werest.com">Return to Werest Travel</a></p>
  </div>
</body>
</html>`
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

interface VoucherData {
  bookingRef: string
  type: 'transfer' | 'attraction' | 'tour'
  customerName: string
  status: string
  serviceTitle: string
  serviceDetail: string
  dateLabel: string
  dateValue: string
  timeLabel?: string
  timeValue?: string
  totalPrice: number
  extraRows?: { label: string; value: string }[]
}

function buildVoucherHtml(v: VoucherData): string {
  const statusColor = statusBadgeColor(v.status)
  const typeLabel = v.type === 'transfer' ? 'Transfer' : v.type === 'attraction' ? 'Attraction Ticket' : 'Tour'
  const extraRowsHtml = (v.extraRows ?? []).map(r => `
    <tr>
      <td style="padding:8px 0; color:#6b7280; font-size:13px; width:40%">${r.label}</td>
      <td style="padding:8px 0; font-size:13px; font-weight:600; color:#111827">${r.value}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Voucher ${v.bookingRef} — Werest Travel</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px 16px 60px;
      background: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
    }
    .page {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    }
    /* Header */
    .header {
      background: #2534ff;
      padding: 28px 32px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .logo span { color: rgba(255,255,255,0.65); font-weight: 400; }
    .type-badge {
      background: rgba(255,255,255,0.18);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 999px;
    }
    /* Booking ref band */
    .ref-band {
      background: #f8f9ff;
      border-bottom: 1px solid #e5e7eb;
      padding: 18px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .ref-number {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #2534ff;
    }
    .status-badge {
      display: inline-block;
      background: ${statusColor};
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 999px;
    }
    /* Body */
    .body { padding: 28px 32px; }
    .customer-name {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px;
    }
    .service-title {
      font-size: 15px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 2px;
    }
    .service-detail {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 20px;
    }
    .divider {
      border: none;
      border-top: 1px dashed #e5e7eb;
      margin: 20px 0;
    }
    table { width: 100%; border-collapse: collapse; }
    .total-row td {
      padding-top: 14px;
      border-top: 2px solid #e5e7eb;
      font-size: 15px;
      font-weight: 700;
      color: #111827;
    }
    /* QR placeholder */
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin: 24px 0 0;
    }
    .qr-box {
      width: 120px;
      height: 120px;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-align: center;
      line-height: 1.4;
    }
    .qr-label { font-size: 11px; color: #9ca3af; }
    /* Print button */
    .print-btn {
      display: block;
      margin: 28px auto 0;
      background: #2534ff;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      padding: 12px 36px;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
    }
    .print-btn:hover { background: #1a27e0; }
    /* Footer */
    .footer {
      margin-top: 32px;
      padding: 18px 32px;
      background: #f8f9ff;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      line-height: 1.6;
    }
    /* Print styles */
    @media print {
      body { background: #fff; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { box-shadow: none; border-radius: 0; }
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="logo">Werest<span> Travel</span></div>
      <span class="type-badge">${typeLabel}</span>
    </div>

    <!-- Booking Reference -->
    <div class="ref-band">
      <div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:2px">Booking Reference</div>
        <div class="ref-number">${v.bookingRef}</div>
      </div>
      <span class="status-badge">${v.status.replace(/_/g, ' ')}</span>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="customer-name">${v.customerName}</p>
      <p class="service-title">${v.serviceTitle}</p>
      <p class="service-detail">${v.serviceDetail}</p>

      <hr class="divider" />

      <table>
        <tr>
          <td style="padding:8px 0; color:#6b7280; font-size:13px; width:40%">${v.dateLabel}</td>
          <td style="padding:8px 0; font-size:13px; font-weight:600; color:#111827">${v.dateValue}</td>
        </tr>
        ${v.timeLabel && v.timeValue ? `
        <tr>
          <td style="padding:8px 0; color:#6b7280; font-size:13px">${v.timeLabel}</td>
          <td style="padding:8px 0; font-size:13px; font-weight:600; color:#111827">${v.timeValue}</td>
        </tr>` : ''}
        ${extraRowsHtml}
        <tr class="total-row">
          <td>Total Paid</td>
          <td>${formatTHB(v.totalPrice)}</td>
        </tr>
      </table>

      <!-- QR Placeholder -->
      <div class="qr-section">
        <div class="qr-box">QR Code<br />(${v.bookingRef})</div>
        <span class="qr-label">Show this code at the venue or to your driver</span>
      </div>

      <!-- Print button -->
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <!-- Footer -->
    <div class="footer">
      Valid only with booking reference &bull; Werest Travel &bull; werest.com
    </div>

  </div>
</body>
</html>`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookingRef: string } },
) {
  const { bookingRef } = params

  let html: string

  if (bookingRef.startsWith('WR-')) {
    // ── Transfer booking ──────────────────────────────────────────────────────
    const booking = await prisma.booking.findUnique({ where: { bookingRef } })
    if (!booking) {
      return new NextResponse(not404Html(bookingRef), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
    html = buildVoucherHtml({
      bookingRef,
      type: 'transfer',
      customerName: booking.customerName,
      status: booking.currentStatus,
      serviceTitle: `Private ${booking.vehicleType.replace(/_/g, ' ')} Transfer`,
      serviceDetail: `${booking.pickupAddress} → ${booking.dropoffAddress}`,
      dateLabel: 'Pickup Date',
      dateValue: formatDate(booking.pickupDate),
      timeLabel: 'Pickup Time',
      timeValue: booking.pickupTime,
      totalPrice: booking.totalPrice,
      extraRows: [
        { label: 'Passengers', value: String(booking.passengers) },
        { label: 'Luggage', value: String(booking.luggage) },
        ...(booking.vehicleType ? [{ label: 'Vehicle', value: booking.vehicleType.replace(/_/g, ' ') }] : []),
      ],
    })
  } else if (bookingRef.startsWith('AT-')) {
    // ── Attraction booking ────────────────────────────────────────────────────
    const booking = await prisma.attractionBooking.findUnique({ where: { bookingRef } })
    if (!booking) {
      return new NextResponse(not404Html(bookingRef), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
    const ticketParts: string[] = []
    if (booking.adultQty > 0) ticketParts.push(`${booking.adultQty}x Adult`)
    if (booking.childQty > 0) ticketParts.push(`${booking.childQty}x Child`)
    if (booking.infantQty > 0) ticketParts.push(`${booking.infantQty}x Infant`)

    html = buildVoucherHtml({
      bookingRef,
      type: 'attraction',
      customerName: booking.customerName,
      status: booking.status,
      serviceTitle: booking.attractionName,
      serviceDetail: booking.packageName,
      dateLabel: 'Visit Date',
      dateValue: formatDate(booking.visitDate),
      totalPrice: booking.totalPrice,
      extraRows: [
        { label: 'Tickets', value: ticketParts.join(', ') || '—' },
      ],
    })
  } else if (bookingRef.startsWith('TR-')) {
    // ── Tour booking ──────────────────────────────────────────────────────────
    const booking = await prisma.tourBooking.findUnique({ where: { bookingRef } })
    if (!booking) {
      return new NextResponse(not404Html(bookingRef), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
    const ticketParts: string[] = []
    if (booking.adultQty > 0) ticketParts.push(`${booking.adultQty}x Adult`)
    if (booking.childQty > 0) ticketParts.push(`${booking.childQty}x Child`)

    html = buildVoucherHtml({
      bookingRef,
      type: 'tour',
      customerName: booking.customerName,
      status: booking.status,
      serviceTitle: booking.tourTitle,
      serviceDetail: booking.optionLabel ?? 'Standard Tour',
      dateLabel: 'Tour Date',
      dateValue: formatDate(booking.bookingDate),
      timeLabel: booking.tourTime ? 'Meeting Time' : undefined,
      timeValue: booking.tourTime ?? undefined,
      totalPrice: booking.totalPrice,
      extraRows: [
        { label: 'Guests', value: ticketParts.join(', ') || '—' },
      ],
    })
  } else {
    return new NextResponse(not404Html(bookingRef), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
