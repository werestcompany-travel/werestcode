'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

// Thai public holidays 2025–2026 (YYYY-MM-DD format)
const THAI_HOLIDAYS = new Set([
  '2025-01-01', '2025-02-12', '2025-04-06', '2025-04-07', '2025-04-13',
  '2025-04-14', '2025-04-15', '2025-05-01', '2025-05-05', '2025-05-12',
  '2025-06-03', '2025-07-28', '2025-08-12', '2025-10-13', '2025-10-23',
  '2025-12-05', '2025-12-10', '2025-12-31',
  '2026-01-01', '2026-04-06', '2026-04-13', '2026-04-14', '2026-04-15',
  '2026-05-01', '2026-05-11', '2026-06-03', '2026-07-28', '2026-08-12',
  '2026-10-13', '2026-10-23', '2026-12-05', '2026-12-10', '2026-12-31',
]);

function getBusyness(dateStr: string): { level: 'busy' | 'quiet'; label: string; color: string } {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;
  const isHoliday = THAI_HOLIDAYS.has(dateStr);

  if (isWeekend || isHoliday) {
    return {
      level: 'busy',
      label: isHoliday ? 'Thai public holiday — book early' : 'Very Busy — book early',
      color: 'text-red-600',
    };
  }
  return {
    level: 'quiet',
    label: 'Quiet — great time to visit',
    color: 'text-green-600',
  };
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function VisitDatePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const todayStr = toLocalISO(new Date());
  const paramDate = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState<string>(paramDate ?? '');

  useEffect(() => {
    if (paramDate) setSelectedDate(paramDate);
  }, [paramDate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSelectedDate(val);
    if (val) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('date', val);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }

  const busyness = selectedDate ? getBusyness(selectedDate) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5 text-brand-600" />
        </div>
        <div className="flex-1">
          <label htmlFor="visit-date" className="block text-xs font-semibold text-gray-500 mb-1">
            Select your visit date
          </label>
          <input
            id="visit-date"
            type="date"
            value={selectedDate}
            min={todayStr}
            onChange={handleChange}
            className="block w-full text-sm font-semibold text-gray-900 border-0 p-0 focus:ring-0 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {busyness && (
        <div className="flex items-center gap-2 sm:border-l sm:border-gray-100 sm:pl-5">
          <span className="text-lg" aria-hidden="true">
            {busyness.level === 'busy' ? '🔴' : '🟢'}
          </span>
          <p className={`text-sm font-semibold ${busyness.color}`}>
            {busyness.label}
          </p>
        </div>
      )}

      {!selectedDate && (
        <p className="text-xs text-gray-400 sm:border-l sm:border-gray-100 sm:pl-5">
          Pick a date to check crowd levels
        </p>
      )}
    </div>
  );
}
