import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromCookies } from '@/lib/user-auth'

/**
 * POST /api/user/loyalty/redeem
 * Body: { points: number }
 * 1 loyalty point = ฿1 discount.
 * Returns { discountAmount: number } — caller applies to their total.
 * Points are actually deducted only when booking is confirmed (called from checkout).
 */
export async function POST(req: NextRequest) {
  const session = await getUserFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let points: number
  try {
    const body = await req.json()
    points = Number(body.points)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!points || points < 100 || points % 50 !== 0) {
    return NextResponse.json({ error: 'Minimum 100 points, in multiples of 50.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.id },
    select: { loyaltyPoints: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.loyaltyPoints < points) {
    return NextResponse.json({ error: `You only have ${user.loyaltyPoints} points available.` }, { status: 400 })
  }

  // Deduct points
  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.id },
      data:  { loyaltyPoints: { decrement: points } },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        userId:      session.id,
        points:      -points,
        type:        'REDEEM',
        description: `Redeemed ${points} points for ฿${points} discount`,
      },
    }),
  ])

  return NextResponse.json({ success: true, discountAmount: points, pointsUsed: points })
}
