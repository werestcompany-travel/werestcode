import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/user-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getUserFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.id

  const [attractionBookings, tourBookings, wishlistItems, loyaltyTx] = await Promise.all([
    prisma.attractionBooking.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, bookingRef: true, attractionName: true, status: true, totalPrice: true, createdAt: true },
    }),
    prisma.tourBooking.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, bookingRef: true, tourTitle: true, status: true, totalPrice: true, createdAt: true },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, attractionName: true, itemType: true, createdAt: true },
    }),
    prisma.loyaltyTransaction.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, points: true, type: true, description: true, bookingRef: true, createdAt: true },
    }),
  ])

  type ActivityItem = {
    id: string
    type: 'booking_attraction' | 'booking_tour' | 'wishlist_add' | 'points_earned' | 'points_redeemed'
    title: string
    subtitle: string
    amount?: number
    points?: number
    status?: string
    ref?: string
    createdAt: string
  }

  const items: ActivityItem[] = []

  for (const b of attractionBookings) {
    items.push({
      id: `ab-${b.id}`,
      type: 'booking_attraction',
      title: b.attractionName,
      subtitle: `Attraction ticket · ฿${b.totalPrice.toLocaleString()}`,
      amount: b.totalPrice,
      status: b.status,
      ref: b.bookingRef,
      createdAt: b.createdAt.toISOString(),
    })
  }

  for (const b of tourBookings) {
    items.push({
      id: `tb-${b.id}`,
      type: 'booking_tour',
      title: b.tourTitle,
      subtitle: `Tour booking · ฿${b.totalPrice.toLocaleString()}`,
      amount: b.totalPrice,
      status: b.status,
      ref: b.bookingRef,
      createdAt: b.createdAt.toISOString(),
    })
  }

  for (const w of wishlistItems) {
    items.push({
      id: `wl-${w.id}`,
      type: 'wishlist_add',
      title: w.attractionName,
      subtitle: `Added to wishlist · ${w.itemType === 'tour' ? 'Tour' : 'Attraction'}`,
      createdAt: w.createdAt.toISOString(),
    })
  }

  for (const tx of loyaltyTx) {
    items.push({
      id: `lx-${tx.id}`,
      type: tx.points > 0 ? 'points_earned' : 'points_redeemed',
      title: tx.description,
      subtitle: tx.bookingRef ? `Ref: ${tx.bookingRef}` : 'Loyalty reward',
      points: Math.abs(tx.points),
      ref: tx.bookingRef ?? undefined,
      createdAt: tx.createdAt.toISOString(),
    })
  }

  // Sort by date descending, take top 25
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const activity = items.slice(0, 25)

  return NextResponse.json({ activity })
}
