import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPaysoPayment } from '@/lib/payso'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingId, amount } = body as { bookingId?: string; amount?: number }

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'bookingId is required' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: 'amount must be a positive number' }, { status: 400 })
    }

    // Fetch the transfer booking
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ success: false, error: 'Booking is already paid' }, { status: 400 })
    }

    // Use bookingRef as the Payso orderId (e.g. "WR-20240001")
    const orderId = booking.bookingRef

    // Create Payso payment session
    const paysoRes = await createPaysoPayment({
      orderId,
      amount,
      description: `Werest Transfer: ${booking.pickupAddress} → ${booking.dropoffAddress}`,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
    })

    // Update booking with Payso order ID and payment status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paysoOrderId: orderId,
        paymentStatus: 'AWAITING_PAYMENT',
      },
    })

    // Create a PaymentTransaction record
    await prisma.paymentTransaction.create({
      data: {
        bookingId,
        paysoOrderId: orderId,
        paymentUrl: paysoRes.paymentUrl,
        amount,
        currency: 'THB',
        status: 'AWAITING_PAYMENT',
      },
    })

    return NextResponse.json({ success: true, data: { paymentUrl: paysoRes.paymentUrl } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[payment/transfer/create]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
