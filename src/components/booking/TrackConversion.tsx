'use client'
import { useEffect } from 'react'
import { trackBookingCompleted } from '@/lib/analytics'

export default function TrackConversion({
  bookingRef,
  totalPrice,
  vehicleType,
}: {
  bookingRef: string
  totalPrice: number
  vehicleType: string
}) {
  useEffect(() => {
    trackBookingCompleted(bookingRef, totalPrice, vehicleType)
  }, [bookingRef, totalPrice, vehicleType])
  return null
}
