import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPaysoPayment } from '@/lib/payso'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tourBookingId, amount } = body as { tourBookingId?: string; amount?: number }

    if (!tourBookingId) {
      return NextResponse.json({ success: false, error: 'tourBookingId is required' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: 'amount must be a positive number' }, { status: 400 })
    }

    // Fetch the tour booking
    const tourBooking = await prisma.tourBooking.findUnique({ where: { id: tourBookingId } })
    if (!tourBooking) {
      return NextResponse.json({ success: false, error: 'Tour booking not found' }, { status: 404 })
    }
    if (tourBooking.paymentStatus === 'PAID') {
      return NextResponse.json({ success: false, error: 'Tour booking is already paid' }, { status: 400 })
    }

    // Use bookingRef as the Payso orderId (e.g. "TR-20250001")
    const orderId = tourBooking.bookingRef

    // Create Payso payment session
    const paysoRes = await createPaysoPayment({
      orderId,
      amount,
      description: `Werest Tour: ${tourBooking.tourTitle}`,
      customerName: tourBooking.customerName,
      customerEmail: tourBooking.customerEmail,
      customerPhone: tourBooking.customerPhone,
    })

    // Update tour booking with Payso order ID and payment status
    await prisma.tourBooking.update({
      where: { id: tourBookingId },
      data: {
        paysoOrderId: orderId,
        paymentStatus: 'AWAITING_PAYMENT',
      },
    })

    // Create a PaymentTransaction record
    // Note: PaymentTransaction has no tourBookingId field — use paysoOrderId only
    await prisma.paymentTransaction.create({
      data: {
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
    console.error('[payment/tour/create]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
