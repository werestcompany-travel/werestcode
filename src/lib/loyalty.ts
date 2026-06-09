import { db } from './db';
import { LoyaltyTxType } from '@prisma/client';

/** 20 THB spent = 1 point earned */
export const POINTS_PER_THB = 1 / 20;

/** Calculate points earned from a booking total (floor) */
export function calcPointsEarned(totalPriceTHB: number): number {
  return Math.floor(totalPriceTHB / 20);
}

/**
 * Award (or deduct) loyalty points for a user.
 * Creates a LoyaltyTransaction and increments User.loyaltyPoints atomically.
 */
export async function awardPoints(
  userId: string,
  points: number,
  type: LoyaltyTxType,
  description: string,
  bookingRef?: string,
): Promise<void> {
  await db.$transaction([
    db.loyaltyTransaction.create({
      data: { userId, points, type, description, bookingRef: bookingRef ?? null },
    }),
    db.user.update({
      where: { id: userId },
      data:  { loyaltyPoints: { increment: points } },
    }),
  ]);
}
