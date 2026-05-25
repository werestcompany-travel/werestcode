import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createPaysoPayment } from '@/lib/payso'

const paymentCreateSchema = z.object({
  bookingId: z.string().min(1, 'bookingId is required').max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = paymentCreateSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Invalid input'
      return NextResponse.json({ success: false, error: msg }, { status: 400 })
    }

    const { bookingId } = parsed.data

    // Fetch the booking
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
      amount:        booking.totalPrice,
      description:   `Werest Transfer: ${booking.pickupAddress} → ${booking.dropoffAddress}`,
      customerName:  booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
    })

    // Save the payment transaction
    await prisma.paymentTransaction.create({
      data: {
        bookingId,
        paysoOrderId: orderId,
        paysoTxnId:   paysoRes.txnId || null,
        paymentUrl:   paysoRes.paymentUrl,
        amount:       booking.totalPrice,
        currency:     'THB',
        status:       'AWAITING_PAYMENT',
      },
    })

    // Update booking with paysoOrderId + status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paysoOrderId:  orderId,
        paymentStatus: 'AWAITING_PAYMENT',
        paymentMethod: 'payso_card',
      },
    })

    return NextResponse.json({ success: true, data: { paymentUrl: paysoRes.paymentUrl } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[payment/create]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
