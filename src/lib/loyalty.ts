import { db } from './db';
import { TierLevel, LoyaltyTxType } from '@prisma/client';

export const TIER_THRESHOLDS: Record<TierLevel, number> = {
  EXPLORER:   0,
  ADVENTURER: 1000,
  NAVIGATOR:  3000,
  VOYAGER:    8000,
};

export const TIER_ORDER: TierLevel[] = ['EXPLORER', 'ADVENTURER', 'NAVIGATOR', 'VOYAGER'];

export const TIER_META: Record<TierLevel, { label: string; color: string; gradient: string; emoji: string; perks: string[] }> = {
  EXPLORER: {
    label:    'Explorer',
    color:    'text-amber-700',
    gradient: 'from-amber-400 to-orange-500',
    emoji:    '🌍',
    perks:    ['Welcome bonus 200 points', 'Earn 50 pts / attraction booking', 'Earn 100 pts / transfer'],
  },
  ADVENTURER: {
    label:    'Adventurer',
    color:    'text-slate-600',
    gradient: 'from-slate-400 to-slate-600',
    emoji:    '🧭',
    perks:    ['All Explorer perks', '5% off next booking', 'Priority support', 'Double points on reviews'],
  },
  NAVIGATOR: {
    label:    'Navigator',
    color:    'text-yellow-600',
    gradient: 'from-yellow-400 to-amber-500',
    emoji:    '⭐',
    perks:    ['All Adventurer perks', '10% off any booking', 'Free add-on upgrade', 'Dedicated phone line'],
  },
  VOYAGER: {
    label:    'Voyager',
    color:    'text-indigo-600',
    gradient: 'from-indigo-500 to-purple-600',
    emoji:    '💎',
    perks:    ['All Navigator perks', '15% off any booking', 'VIP meet & greet', 'Exclusive Voyager deals'],
  },
};

export function calcTier(points: number): TierLevel {
  if (points >= TIER_THRESHOLDS.VOYAGER)   return 'VOYAGER';
  if (points >= TIER_THRESHOLDS.NAVIGATOR)  return 'NAVIGATOR';
  if (points >= TIER_THRESHOLDS.ADVENTURER) return 'ADVENTURER';
  return 'EXPLORER';
}

export function nextTierInfo(points: number): { next: TierLevel | null; needed: number; progress: number } {
  const idx = TIER_ORDER.indexOf(calcTier(points));
  if (idx === TIER_ORDER.length - 1) return { next: null, needed: 0, progress: 100 };
  const next      = TIER_ORDER[idx + 1];
  const current   = TIER_ORDER[idx];
  const rangeMin  = TIER_THRESHOLDS[current];
  const rangeMax  = TIER_THRESHOLDS[next];
  const progress  = Math.min(100, Math.round(((points - rangeMin) / (rangeMax - rangeMin)) * 100));
  const needed    = rangeMax - points;
  return { next, needed, progress };
}

export async function awardPoints(
  userId: string,
  points: number,
  type: LoyaltyTxType,
  description: string,
  bookingRef?: string,
) {
  const updated = await db.user.update({
    where: { id: userId },
    data:  { loyaltyPoints: { increment: points } },
    select: { loyaltyPoints: true },
  });

  const newTier = calcTier(updated.loyaltyPoints);

  await db.$transaction([
    db.loyaltyTransaction.create({
      data: { userId, points, type, description, bookingRef: bookingRef ?? null },
    }),
    db.user.update({
      where: { id: userId },
      data:  { tierLevel: newTier },
    }),
  ]);
}
