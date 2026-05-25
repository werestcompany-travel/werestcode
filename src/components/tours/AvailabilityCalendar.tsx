'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayData {
  booked: number;
  maxCapacity: number;
  isBlocked: boolean;
  status: 'available' | 'limited' | 'full' | 'blocked';
}

interface AvailabilityCalendarProps {
  tourSlug: string;
  maxCapacity: number;
  onDateSelect?: (date: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toMonthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Returns Mon-aligned array of {day, dateStr} | null for blank cells */
function buildCalendarGrid(year: number, month: number): ({ day: number; dateStr: string } | null)[] {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert Sunday=0 to Monday-first index: Sun→6, Mon→0, …
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: ({ day: number; dateStr: string } | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: toDateStr(year, month, d) });
  }
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function StatusDot({ status }: { status: DayData['status'] | undefined }) {
  if (!status || status === 'available') {
    return <span className="w-1.5 h-1.5 rounded-full bg-green-500 mx-auto block mt-0.5" />;
  }
  if (status === 'limited') {
    return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto block mt-0.5" />;
  }
  if (status === 'full' || status === 'blocked') {
    return <span className="w-1.5 h-1.5 rounded-full bg-red-400 mx-auto block mt-0.5" />;
  }
  return null;
}

export default function AvailabilityCalendar({
  tourSlug,
  maxCapacity,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const [dates, setDates] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(false);

  const fetchAvailability = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tours/${tourSlug}/availability?month=${toMonthKey(y, m)}`,
        { cache: 'no-store' },
      );
      if (res.ok) {
        const data = await res.json();
        setDates(data.dates ?? {});
      }
    } catch {
      // silently fail — dates will show as available (no dot override)
    } finally {
      setLoading(false);
    }
  }, [tourSlug]);

  useEffect(() => {
    fetchAvailability(year, month);
  }, [fetchAvailability, year, month]);

  function prevMonth() {
    if (year === today.getFullYear() && month === today.getMonth()) return; // don't go to past months
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else { setMonth(m => m - 1); }
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else { setMonth(m => m + 1); }
  }

  function handleDayClick(dateStr: string, isPast: boolean) {
    const info = dates[dateStr];
    if (isPast) return;
    if (info?.status === 'full' || info?.status === 'blocked') return;
    setSelected(dateStr);
    onDateSelect?.(dateStr);
  }

  const grid = buildCalendarGrid(year, month);
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-sm font-bold text-gray-900">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        /* Skeleton */
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5">
          {grid.map((cell, i) => {
            if (!cell) return <div key={`blank-${i}`} />;
            const { day, dateStr } = cell;
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selected;
            const info = dates[dateStr];
            const isFull = info?.status === 'full' || info?.status === 'blocked';
            const isDisabled = isPast || isFull;

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(dateStr, isPast)}
                disabled={isDisabled}
                className={`h-9 w-full rounded-lg flex flex-col items-center justify-center text-[12px] font-medium transition-colors relative ${
                  isSelected
                    ? 'bg-[#2534ff] text-white shadow-sm'
                    : isToday
                    ? 'ring-2 ring-[#2534ff] text-[#2534ff] font-bold'
                    : isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : isFull
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <span>{day}</span>
                {!isPast && !isSelected && (
                  <StatusDot status={info?.status} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Available
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Limited
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Unavailable
        </div>
      </div>
    </div>
  );
}
