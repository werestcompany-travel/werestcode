import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId required' }, { status: 400 })
  }

  try {
    // ── Tour bookings (TR- prefix) ────────────────────────────────────────────
    if (orderId.startsWith('TR-')) {
      const tourBooking = await prisma.tourBooking.findUnique({
        where:  { bookingRef: orderId },
        select: { id: true, bookingRef: true, paymentStatus: true, status: true },
      })

      if (!tourBooking) {
        return NextResponse.json({ success: false, error: 'Tour booking not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          bookingId:       tourBooking.id,
          bookingRef:      tourBooking.bookingRef,
          paymentStatus:   tourBooking.paymentStatus,
          bookingStatus:   tourBooking.status,
          confirmationUrl: `/confirmation/tour/${tourBooking.id}`,
          bookingType:     'tour',
        },
      })
    }

    // ── Attraction bookings (AT- prefix) ─────────────────────────────────────
    if (orderId.startsWith('AT-')) {
      const attractionBooking = await prisma.attractionBooking.findUnique({
        where:  { bookingRef: orderId },
        select: { id: true, bookingRef: true, paymentStatus: true, status: true },
      })

      if (!attractionBooking) {
        return NextResponse.json({ success: false, error: 'Attraction booking not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          bookingId:       attractionBooking.id,
          bookingRef:      attractionBooking.bookingRef,
          paymentStatus:   attractionBooking.paymentStatus,
          bookingStatus:   attractionBooking.status,
          confirmationUrl: `/confirmation/attraction/${attractionBooking.id}`,
          bookingType:     'attraction',
        },
      })
    }

    // ── Transfer bookings (WR- prefix) ────────────────────────────────────────
    const booking = await prisma.booking.findFirst({
      where:  { paysoOrderId: orderId },
      select: { id: true, bookingRef: true, paymentStatus: true, currentStatus: true },
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId:       booking.id,
        bookingRef:      booking.bookingRef,
        paymentStatus:   booking.paymentStatus,
        bookingStatus:   booking.currentStatus,
        confirmationUrl: `/confirmation/${booking.id}`,
        bookingType:     'transfer',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
