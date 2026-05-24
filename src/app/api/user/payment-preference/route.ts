import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/user-auth'

const VALID_METHODS = ['CREDIT_CARD', 'PROMPTPAY', 'QR_CODE'] as const
type PaymentMethod = typeof VALID_METHODS[number]

/**
 * GET /api/user/payment-preference
 * Returns the logged-in user's preferred payment method.
 */
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ preferredPaymentMethod: null }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferredPaymentMethod: true, lastPaymentAt: true },
  })

  return NextResponse.json({
    preferredPaymentMethod: dbUser?.preferredPaymentMethod ?? null,
    lastPaymentAt: dbUser?.lastPaymentAt ?? null,
  })
}

/**
 * POST /api/user/payment-preference
 * Body: { paymentMethod: "CREDIT_CARD" | "PROMPTPAY" | "QR_CODE" }
 * Saves the preferred payment method for the current user.
 */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { paymentMethod?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { paymentMethod } = body
  if (!paymentMethod || !VALID_METHODS.includes(paymentMethod as PaymentMethod)) {
    return NextResponse.json(
      { success: false, error: `paymentMethod must be one of: ${VALID_METHODS.join(', ')}` },
      { status: 400 },
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      preferredPaymentMethod: paymentMethod,
      lastPaymentAt: new Date(),
    },
  })

  return NextResponse.json({ success: true, preferredPaymentMethod: paymentMethod })
}
