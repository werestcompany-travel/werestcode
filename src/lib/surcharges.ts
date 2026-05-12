// Surcharge rules applied on top of the base distance fare.
// All amounts in THB. Surcharges stack (e.g. airport + night both apply).

export interface SurchargeResult {
  total:      number;
  breakdown:  { label: string; amount: number }[];
}

// ─── Airport surcharge ────────────────────────────────────────────────────────
// Applied when either pickup or dropoff contains an airport keyword.

const AIRPORT_KEYWORDS = [
  'suvarnabhumi', 'don mueang', 'dmk', 'bkk', 'phuket airport',
  'chiang mai airport', 'krabi airport', 'samui airport', 'u-tapao',
  'hat yai airport', 'ubon airport', 'khon kaen airport',
];

const AIRPORT_SURCHARGE = 150; // THB flat

function isAirport(address: string): boolean {
  const lower = address.toLowerCase();
  return AIRPORT_KEYWORDS.some(k => lower.includes(k));
}

// ─── Late-night / early-morning surcharge ─────────────────────────────────────
// 22:00–05:59 local time pickup

const NIGHT_SURCHARGE_PERCENT = 0.15; // 15%

function isNightTime(pickupTime: string): boolean {
  const [hh] = pickupTime.split(':').map(Number);
  return hh >= 22 || hh < 6;
}

// ─── Peak-hour surcharge (BKK area, weekdays) ─────────────────────────────────
// 07:00–09:00 and 17:00–20:00, Monday–Friday

const PEAK_SURCHARGE_PERCENT = 0.10; // 10%

function isPeakHour(pickupTime: string, pickupDate: Date): boolean {
  const dayOfWeek = pickupDate.getDay(); // 0=Sun, 6=Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  const [hh] = pickupTime.split(':').map(Number);
  return (hh >= 7 && hh < 9) || (hh >= 17 && hh < 20);
}

// ─── Thai public holidays ─────────────────────────────────────────────────────
// 20% surcharge on Songkran (Apr 13–15), New Year (Dec 31–Jan 1), Loy Krathong

const HOLIDAY_SURCHARGE_PERCENT = 0.20; // 20%

const FIXED_HOLIDAYS: [number, number][] = [
  [1,   1],  // New Year's Day
  [4,  13],  // Songkran
  [4,  14],  // Songkran
  [4,  15],  // Songkran
  [5,   1],  // Labour Day
  [5,   4],  // Coronation Day
  [6,   3],  // Queen's Birthday
  [7,  28],  // King's Birthday
  [8,  12],  // Queen Mother's Day
  [10, 13],  // Memorial Day
  [10, 23],  // Chulalongkorn Day
  [12,  5],  // King Rama IX Memorial
  [12, 10],  // Constitution Day
  [12, 31],  // New Year's Eve
];

function isHoliday(date: Date): boolean {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return FIXED_HOLIDAYS.some(([hm, hd]) => hm === m && hd === d);
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export function calculateSurcharges(
  basePrice:      number,
  pickupAddress:  string,
  dropoffAddress: string,
  pickupTime:     string,
  pickupDate:     Date,
): SurchargeResult {
  const breakdown: { label: string; amount: number }[] = [];

  // Airport
  if (isAirport(pickupAddress) || isAirport(dropoffAddress)) {
    breakdown.push({ label: 'Airport service fee', amount: AIRPORT_SURCHARGE });
  }

  // Night
  if (isNightTime(pickupTime)) {
    const amount = Math.round(basePrice * NIGHT_SURCHARGE_PERCENT);
    breakdown.push({ label: 'Late-night / early-morning surcharge (22:00–06:00)', amount });
  }

  // Public holiday (takes priority over peak hour — don't double-apply)
  if (isHoliday(pickupDate)) {
    const amount = Math.round(basePrice * HOLIDAY_SURCHARGE_PERCENT);
    breakdown.push({ label: 'Public holiday surcharge', amount });
  } else if (isPeakHour(pickupTime, pickupDate)) {
    const amount = Math.round(basePrice * PEAK_SURCHARGE_PERCENT);
    breakdown.push({ label: 'Peak hour surcharge (07:00–09:00, 17:00–20:00)', amount });
  }

  const total = breakdown.reduce((s, b) => s + b.amount, 0);
  return { total, breakdown };
}
