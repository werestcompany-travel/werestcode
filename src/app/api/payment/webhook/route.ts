import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyWebhookSignature, type PaysoWebhookPayload } from '@/lib/payso'
import { sendBookingConfirmationEmail, sendTourBookingConfirmationEmail } from '@/lib/email'
import { sendCustomerBookingConfirmation, sendPostBookingUpsell } from '@/lib/whatsapp'

/** Map Payso/internal raw method strings to our canonical values. */
const PAYMENT_METHOD_MAP: Record<string, string> = {
  payso_card: 'CREDIT_CARD',
  card:       'CREDIT_CARD',
  promptpay:  'PROMPTPAY',
  qr:         'QR_CODE',
  qr_code:    'QR_CODE',
}

/** Save the preferred payment method for the user identified by email. Fire-and-forget safe. */
async function recordPaymentPreference(customerEmail: string, rawMethod: string | null | undefined) {
  if (!rawMethod) return
  const canonical = PAYMENT_METHOD_MAP[rawMethod.toLowerCase()]
  if (!canonical) return
  const linkedUser = await prisma.user.findUnique({ where: { email: customerEmail }, select: { id: true } })
  if (linkedUser) {
    await prisma.user.update({
      where: { id: linkedUser.id },
      data: { preferredPaymentMethod: canonical, lastPaymentAt: new Date() },
    }).catch((err: unknown) => console.error('[payment/webhook] Failed to save payment pref:', err))
  }
}

/**
 * Payso webhook (backendReturnUrl)
 * Payso POSTs here after a payment attempt.
 * We verify the signature, update booking + transaction status.
 */
export async function POST(req: NextRequest) {
  let payload: PaysoWebhookPayload

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  // Always verify webhook signature — sandbox mode does NOT skip this check.
  if (!verifyWebhookSignature(payload)) {
    console.warn('[payment/webhook] Invalid signature for orderId:', payload.orderId)
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
  }

  const { orderId, txnId, status, amount } = payload

  try {
    // Map Payso status → our PaymentStatus
    const paymentStatus =
      status === 'SUCCESS'   ? 'PAID'    :
      status === 'FAILED'    ? 'FAILED'  :
      status === 'CANCELLED' ? 'FAILED'  : 'AWAITING_PAYMENT'

    // Update PaymentTransaction
    await prisma.paymentTransaction.updateMany({
      where: { paysoOrderId: orderId },
      data: {
        paysoTxnId:  txnId ?? null,
        status:      paymentStatus as 'PAID' | 'FAILED' | 'AWAITING_PAYMENT',
        rawWebhook:  payload as object,
      },
    })

    // ── Handle private transfer Booking ──────────────────────────────────────
    const booking = await prisma.booking.findFirst({ where: { paysoOrderId: orderId } })
    if (booking) {
      // Idempotency: if already marked PAID, skip to avoid duplicate emails / status writes
      if (booking.paymentStatus === 'PAID' && paymentStatus === 'PAID') {
        console.log(`[payment/webhook] orderId=${orderId} already PAID — skipping (idempotent)`)
        return NextResponse.json({ success: true })
      }

      // Amount verification: ensure the paid amount matches the booking total (±1 THB tolerance)
      if (paymentStatus === 'PAID' && Math.abs(Number(amount) - booking.totalPrice) > 1) {
        console.error(
          `[payment/webhook] Amount mismatch orderId=${orderId}: ` +
          `received ฿${amount}, expected ฿${booking.totalPrice}`,
        )
        return NextResponse.json({ success: false, error: 'Amount mismatch' }, { status: 400 })
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: paymentStatus as 'PAID' | 'FAILED' | 'AWAITING_PAYMENT',
          paidAt:        paymentStatus === 'PAID' ? new Date() : undefined,
        },
      })

      // If payment succeeded, update booking status to DRIVER_CONFIRMED
      if (paymentStatus === 'PAID') {
        await recordPaymentPreference(booking.customerEmail, booking.paymentMethod)

        await prisma.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            status:    'DRIVER_CONFIRMED',
            note:      `Payment confirmed via Payso. Txn: ${txnId}. Amount: ฿${amount}`,
            updatedBy: 'system',
          },
        })
        await prisma.booking.update({
          where: { id: booking.id },
          data:  { currentStatus: 'DRIVER_CONFIRMED' },
        })

        // Load add-ons for email
        const fullBooking = await prisma.booking.findUnique({
          where: { id: booking.id },
          include: { bookingAddOns: { include: { addOn: true } } },
        })
        if (fullBooking) {
          const emailData = {
            bookingRef:     fullBooking.bookingRef,
            customerName:   fullBooking.customerName,
            customerEmail:  fullBooking.customerEmail,
            pickupAddress:  fullBooking.pickupAddress,
            dropoffAddress: fullBooking.dropoffAddress,
            pickupDate:     fullBooking.pickupDate,
            pickupTime:     fullBooking.pickupTime,
            vehicleType:    fullBooking.vehicleType,
            passengers:     fullBooking.passengers,
            luggage:        fullBooking.luggage,
            basePrice:      fullBooking.basePrice,
            addOnsTotal:    fullBooking.addOnsTotal,
            totalPrice:     fullBooking.totalPrice,
            specialNotes:   fullBooking.specialNotes,
          }
          sendBookingConfirmationEmail(emailData).catch(console.error)
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com'
          sendCustomerBookingConfirmation(
            fullBooking.customerPhone,
            fullBooking.customerName,
            fullBooking.bookingRef,
            fullBooking.pickupDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            fullBooking.pickupTime,
            fullBooking.pickupAddress,
            `${appUrl}/tracking`,
          ).catch(console.error)

          // Fire-and-forget upsell message
          if (fullBooking.customerPhone && fullBooking.dropoffAddress) {
            sendPostBookingUpsell({
              customerPhone: fullBooking.customerPhone,
              customerName:  fullBooking.customerName,
              bookingRef:    fullBooking.bookingRef,
              destination:   fullBooking.dropoffAddress,
              bookingDate:   new Date(fullBooking.pickupDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }),
            }).catch(console.warn)
          }
        }
      }
    }

    // ── Handle TourBooking (orderId starts with "TR-") ────────────────────────
    if (orderId.startsWith('TR-')) {
      const tourBooking = await prisma.tourBooking.findUnique({ where: { bookingRef: orderId } })
      if (tourBooking) {
        // Idempotency: skip if already in the target state
        if (tourBooking.paymentStatus === 'PAID' && paymentStatus === 'PAID') {
          console.log(`[payment/webhook] TourBooking ${orderId} already PAID — skipping (idempotent)`)
          return NextResponse.json({ success: true })
        }

        await prisma.tourBooking.update({
          where: { id: tourBooking.id },
          data: {
            paymentStatus: paymentStatus as 'PAID' | 'FAILED' | 'AWAITING_PAYMENT',
            status:        paymentStatus === 'PAID'   ? 'CONFIRMED' :
                           paymentStatus === 'FAILED' ? 'CANCELLED' : undefined,
          },
        })

        if (paymentStatus === 'PAID') {
          await recordPaymentPreference(tourBooking.customerEmail, tourBooking.paymentMethod)

          // Send customer confirmation email + WhatsApp
          sendTourBookingConfirmationEmail({
            bookingRef:    tourBooking.bookingRef,
            customerName:  tourBooking.customerName,
            customerEmail: tourBooking.customerEmail,
            tourTitle:     tourBooking.tourTitle,
            tourSlug:      tourBooking.tourSlug,
            optionLabel:   tourBooking.optionLabel,
            bookingDate:   tourBooking.bookingDate,
            adultQty:      tourBooking.adultQty,
            childQty:      tourBooking.childQty,
            adultPrice:    tourBooking.adultPrice,
            childPrice:    tourBooking.childPrice,
            totalPrice:    tourBooking.totalPrice,
            notes:         tourBooking.notes,
          }).catch(err => console.error('[payment/webhook] TourBooking email error:', err))
        }

        console.log(`[payment/webhook] TourBooking ${orderId} → ${paymentStatus}`)
      }
    }

    // ── Handle AttractionBooking (look up by paysoOrderId) ───────────────────
    const attractionBooking = await prisma.attractionBooking.findFirst({ where: { paysoOrderId: orderId } })
    if (attractionBooking) {
      // Idempotency: skip if already in the target state
      if (attractionBooking.paymentStatus === 'PAID' && paymentStatus === 'PAID') {
        console.log(`[payment/webhook] AttractionBooking ${attractionBooking.bookingRef} already PAID — skipping (idempotent)`)
        return NextResponse.json({ success: true })
      }

      await prisma.attractionBooking.update({
        where: { id: attractionBooking.id },
        data: {
          paymentStatus: paymentStatus,
          status:        paymentStatus === 'PAID'   ? 'CONFIRMED' :
                         paymentStatus === 'FAILED' ? 'CANCELLED' : undefined,
          paidAt:        paymentStatus === 'PAID' ? new Date() : undefined,
        },
      })

      if (paymentStatus === 'PAID') {
        await recordPaymentPreference(attractionBooking.customerEmail, attractionBooking.paymentMethod)
      }

      console.log(`[payment/webhook] AttractionBooking ${attractionBooking.bookingRef} → ${paymentStatus}`)
    }

    console.log(`[payment/webhook] orderId=${orderId} status=${status} → ${paymentStatus}`)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[payment/webhook]', err)
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Payso may also GET the webhook URL to verify it's reachable
export async function GET() {
  return NextResponse.json({ success: true, message: 'Werest Payso webhook active' })
}
