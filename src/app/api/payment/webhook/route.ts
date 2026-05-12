import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyWebhookSignature, type PaysoWebhookPayload } from '@/lib/payso'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { sendCustomerBookingConfirmation } from '@/lib/whatsapp'

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

  // Skip signature verification in sandbox (env var PAYSO_SANDBOX=true)
  const isSandbox = process.env.PAYSO_SANDBOX === 'true'
  if (!isSandbox && !verifyWebhookSignature(payload)) {
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
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: paymentStatus as 'PAID' | 'FAILED' | 'AWAITING_PAYMENT',
          paidAt:        paymentStatus === 'PAID' ? new Date() : undefined,
        },
      })

      // If payment succeeded, update booking status to DRIVER_CONFIRMED
      if (paymentStatus === 'PAID') {
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
        }
      }
    }

    // ── Handle TourBooking (orderId starts with "TR-") ────────────────────────
    if (orderId.startsWith('TR-')) {
      const tourBooking = await prisma.tourBooking.findUnique({ where: { bookingRef: orderId } })
      if (tourBooking) {
        await prisma.tourBooking.update({
          where: { id: tourBooking.id },
          data: {
            paymentStatus: paymentStatus as 'PAID' | 'FAILED' | 'AWAITING_PAYMENT',
            status:        paymentStatus === 'PAID'   ? 'CONFIRMED' :
                           paymentStatus === 'FAILED' ? 'CANCELLED' : undefined,
          },
        })

        console.log(`[payment/webhook] TourBooking ${orderId} → ${paymentStatus}`)
      }
    }

    // ── Handle AttractionBooking (look up by paysoOrderId) ───────────────────
    const attractionBooking = await prisma.attractionBooking.findFirst({ where: { paysoOrderId: orderId } })
    if (attractionBooking) {
      await prisma.attractionBooking.update({
        where: { id: attractionBooking.id },
        data: {
          paymentStatus: paymentStatus,
          status:        paymentStatus === 'PAID'   ? 'CONFIRMED' :
                         paymentStatus === 'FAILED' ? 'CANCELLED' : undefined,
          paidAt:        paymentStatus === 'PAID' ? new Date() : undefined,
        },
      })
      console.log(`[payment/webhook] AttractionBooking ${attractionBooking.bookingRef} → ${paymentStatus}`)
    }

    console.log(`[payment/webhook] orderId=${orderId} status=${status} → ${paymentStatus}`)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'DB error'
    console.error('[payment/webhook]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// Payso may also GET the webhook URL to verify it's reachable
export async function GET() {
  return NextResponse.json({ success: true, message: 'Werest Payso webhook active' })
}
