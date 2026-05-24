export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/user-auth';

const applySchema = z.object({
  pointsToRedeem: z.number().int().positive(),
  orderTotal:     z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    // Require authenticated user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to redeem loyalty points.' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Invalid request';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const { pointsToRedeem, orderTotal } = parsed.data;

    // Minimum redemption: 100 points
    if (pointsToRedeem < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum redemption is 100 points (฿100 off).' },
        { status: 400 },
      );
    }

    // Maximum redemption: 20% of order total
    const maxAllowed = Math.floor(orderTotal * 0.2);
    if (pointsToRedeem > maxAllowed) {
      return NextResponse.json(
        { success: false, error: `You can redeem at most ${maxAllowed} points (20% of order total = ฿${maxAllowed}).` },
        { status: 400 },
      );
    }

    // Fetch current user balance from DB (never trust the cookie for point balance)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { loyaltyPoints: true, tierLevel: true },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    if (dbUser.loyaltyPoints < pointsToRedeem) {
      return NextResponse.json(
        {
          success: false,
          error: `You only have ${dbUser.loyaltyPoints} points available. Cannot redeem ${pointsToRedeem}.`,
        },
        { status: 400 },
      );
    }

    // Validation passes — return the preview. Actual deduction happens at booking creation.
    return NextResponse.json({
      success: true,
      discountAmount:  pointsToRedeem,          // 1 point = ฿1
      remainingPoints: dbUser.loyaltyPoints - pointsToRedeem,
      currentPoints:   dbUser.loyaltyPoints,
      tierLevel:       dbUser.tierLevel,
    });
  } catch (err) {
    console.error('[loyalty/apply] POST error:', err);
    return NextResponse.json({ success: false, error: 'Failed to apply loyalty points.' }, { status: 500 });
  }
}
