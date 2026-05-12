import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPaysoPayment } from '@/lib/payso'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { attractionBookingId, amount } = body as { attractionBookingId?: string; amount?: number }

    if (!attractionBookingId) {
      return NextResponse.json({ success: false, error: 'attractionBookingId is required' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: 'amount must be a positive number' }, { status: 400 })
    }

    // Fetch the attraction booking
    const booking = await prisma.attractionBooking.findUnique({ where: { id: attractionBookingId } })
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Attraction booking not found' }, { status: 404 })
    }
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ success: false, error: 'Booking is already paid' }, { status: 400 })
    }

    // Use bookingRef as the Payso orderId (e.g. "AT-20250001")
    const orderId = booking.bookingRef

    // Create Payso payment session
    const paysoRes = await createPaysoPayment({
      orderId,
      amount,
      description:   `Werest Attraction: ${booking.attractionName} – ${booking.packageName} on ${new Date(booking.visitDate).toLocaleDateString('en-GB')}`,
      customerName:  booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
    })

    // Update attraction booking with Payso order ID and payment status
    await prisma.attractionBooking.update({
      where: { id: attractionBookingId },
      data: {
        paysoOrderId:  orderId,
        paymentStatus: 'AWAITING_PAYMENT',
      },
    })

    // Create a PaymentTransaction record
    await prisma.paymentTransaction.create({
      data: {
        attractionBookingId,
        paysoOrderId: orderId,
        paymentUrl:   paysoRes.paymentUrl,
        amount,
        currency:     'THB',
        status:       'AWAITING_PAYMENT',
      },
    })

    return NextResponse.json({ success: true, data: { paymentUrl: paysoRes.paymentUrl } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[payment/attraction/create]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
