'use client';

import { Clock } from 'lucide-react';

export interface OpeningHoursData {
  schedule: string;       // e.g. "Mon–Sun: 8:00am – 6:00pm"
  lastEntry?: string;     // e.g. "5:30pm"
  closedOn?: string;      // e.g. "1st Monday of each month"
  openTime: number;       // 24h format hour, e.g. 8
  closeTime: number;      // 24h format hour, e.g. 18
}

// Hard-coded opening hours per attraction slug
export const OPENING_HOURS: Record<string, OpeningHoursData> = {
  'sanctuary-of-truth': {
    schedule:  'Mon–Sun: 8:00am – 6:00pm',
    lastEntry: '5:30pm',
    openTime:  8,
    closeTime: 18,
  },
  'grand-palace': {
    schedule:  'Mon–Sun: 8:30am – 3:30pm',
    lastEntry: '3:30pm',
    openTime:  8,
    closeTime: 15,
  },
  'wat-pho': {
    schedule:  'Mon–Sun: 8:00am – 6:30pm',
    lastEntry: '6:00pm',
    openTime:  8,
    closeTime: 18,
  },
  'elephant-nature-park': {
    schedule:  'Mon–Sun: 8:00am – 5:00pm',
    lastEntry: '4:30pm',
    closedOn:  '1st Monday of each month',
    openTime:  8,
    closeTime: 17,
  },
  '_default': {
    schedule:  'Mon–Sun: 9:00am – 5:00pm',
    openTime:  9,
    closeTime: 17,
  },
};

function isClosedNow(hours: OpeningHoursData): boolean {
  const now = new Date();
  const h = now.getHours();
  return h < hours.openTime || h >= hours.closeTime;
}

interface OpeningHoursCardProps {
  slug: string;
  /** Show as a compact inline row (for listing cards) or full info box */
  compact?: boolean;
}

export default function OpeningHoursCard({ slug, compact = false }: OpeningHoursCardProps) {
  const hours = OPENING_HOURS[slug] ?? OPENING_HOURS['_default'];
  const closed = isClosedNow(hours);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
        <span>{hours.schedule.split(':').slice(1).join(':').trim()}</span>
        {closed && (
          <span className="ml-1 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            ⚠️ Closed now
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" aria-hidden="true">📅</span>
        <p className="font-extrabold text-blue-900 text-sm">Opening Hours</p>
        {closed && (
          <span className="ml-auto text-[11px] font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
            ⚠️ Closed now
          </span>
        )}
        {!closed && (
          <span className="ml-auto text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
            ✅ Open now
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm text-blue-800">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>{hours.schedule}</span>
        </div>
        {hours.lastEntry && (
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-blue-400 ml-0.5">↳</span>
            <span>Last entry: {hours.lastEntry}</span>
          </div>
        )}
        {hours.closedOn && (
          <div className="flex items-center gap-2 text-blue-700">
            <span className="w-3.5 h-3.5 shrink-0 text-center text-xs">🚫</span>
            <span>Closed: {hours.closedOn}</span>
          </div>
        )}
      </div>
    </div>
  );
}
