import { prisma } from '@/lib/db';
import type { VehicleType } from '@/types';

export interface Surcharge {
  name: string;
  amount: number;
}

export interface DynamicPricingResult {
  finalPrice: number;
  surcharges: Surcharge[];
}

/**
 * Apply all active dynamic pricing rules to a base price.
 *
 * Rules are fetched ordered by priority DESC — higher-priority rules are
 * evaluated first, but ALL matching rules are applied additively:
 *   • multiplier rules:    price = price × multiplier
 *   • flatAmount rules:    price = price + flatAmount  (negative = discount)
 *
 * @param basePrice       The raw base price in THB (from calculateBasePrice)
 * @param vehicleType     The vehicle type for this booking
 * @param pickupAddress   Full pickup address string (for keyword matching)
 * @param dropoffAddress  Full dropoff address string (for keyword matching)
 * @param pickupDate      ISO date string  e.g. "2025-12-25"
 * @param pickupTime      "HH:mm"          e.g. "22:30"
 */
export async function applyDynamicPricing(
  basePrice: number,
  vehicleType: VehicleType,
  pickupAddress: string,
  dropoffAddress: string,
  pickupDate: string,
  pickupTime: string,
): Promise<DynamicPricingResult> {
  // Fetch all active rules, highest priority first
  const rules = await prisma.dynamicPricingRule.findMany({
    where: { isActive: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  // Parse booking date/time
  const bookingDate = new Date(pickupDate);
  const dayOfWeek = bookingDate.getDay(); // 0=Sun…6=Sat
  const [hourStr, minuteStr] = pickupTime.split(':');
  const pickupHour = parseInt(hourStr ?? '0', 10);

  let runningPrice = basePrice;
  const surcharges: Surcharge[] = [];

  for (const rule of rules) {
    // 1. Vehicle type match (null = all vehicles)
    if (rule.vehicleType !== null && rule.vehicleType !== vehicleType) continue;

    // 2. Day of week match (empty array = all days)
    if (rule.daysOfWeek.length > 0 && !rule.daysOfWeek.includes(dayOfWeek)) continue;

    // 3. Hour range match
    if (rule.startHour !== null && rule.endHour !== null) {
      const matched = hourRangeIncludes(rule.startHour, rule.endHour, pickupHour);
      if (!matched) continue;
    }

    // 4. Date range match
    if (rule.startDate !== null) {
      const start = new Date(rule.startDate);
      start.setHours(0, 0, 0, 0);
      if (bookingDate < start) continue;
    }
    if (rule.endDate !== null) {
      const end = new Date(rule.endDate);
      end.setHours(23, 59, 59, 999);
      if (bookingDate > end) continue;
    }

    // 5. Keyword match (case-insensitive partial match)
    if (rule.pickupKeyword) {
      if (!pickupAddress.toLowerCase().includes(rule.pickupKeyword.toLowerCase())) continue;
    }
    if (rule.dropoffKeyword) {
      if (!dropoffAddress.toLowerCase().includes(rule.dropoffKeyword.toLowerCase())) continue;
    }

    // ── Rule matches — apply adjustment ──────────────────────────────────────
    if (rule.flatAmount !== null) {
      // Fixed surcharge / discount
      const amount = rule.flatAmount;
      runningPrice = runningPrice + amount;
      surcharges.push({ name: rule.name, amount });
    } else {
      // Multiplier-based (e.g. 1.3 = +30%, 0.85 = -15%)
      const amountDelta = Math.round(runningPrice * rule.multiplier) - runningPrice;
      runningPrice = Math.round(runningPrice * rule.multiplier);
      if (amountDelta !== 0) {
        surcharges.push({ name: rule.name, amount: amountDelta });
      }
    }
  }

  return {
    finalPrice: Math.max(0, Math.round(runningPrice)),
    surcharges,
  };
}

/**
 * Check if `hour` falls within [startHour, endHour].
 * Supports overnight ranges: startHour=22, endHour=6 means 22:00–06:00.
 */
function hourRangeIncludes(startHour: number, endHour: number, hour: number): boolean {
  if (startHour <= endHour) {
    // Normal range: e.g. 08–20
    return hour >= startHour && hour < endHour;
  } else {
    // Overnight range: e.g. 22–06 → hour >= 22 OR hour < 6
    return hour >= startHour || hour < endHour;
  }
}
