'use client';

import { useRef, useState } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import CalendarPicker from '@/components/search/CalendarPicker';
import { cn } from '@/lib/utils';

/* ── Time options (30-min slots, matches CalendarPicker) ────────────────── */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h  = Math.floor(i / 2);
  const m  = i % 2 === 0 ? '00' : '30';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return {
    label: `${h12}:${m} ${h < 12 ? 'am' : 'pm'}`,
    value: `${h.toString().padStart(2, '0')}:${m}`,
  };
});

function fmtDate(d: string) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function fmtTime(t: string) {
  return TIME_OPTIONS.find(o => o.value === t)?.label ?? t;
}

interface TripEditPanelProps {
  isRoundTrip:       boolean;
  initialDate:       string;
  initialTime:       string;
  initialReturnDate: string;
  initialReturnTime: string;
  onApply:  (date: string, time: string, returnDate: string, returnTime: string) => void;
  onCancel: () => void;
}

/* ── DateTimeRow ─────────────────────────────────────────────────────────── */
function DateTimeRow({
  label, date, time, minDate, isReturn,
  active, onOpen, onClose,
  onDateChange, onTimeChange,
  triggerRef,
}: {
  label: string;
  date: string;
  time: string;
  minDate: string;
  isReturn?: boolean;
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={triggerRef} className="relative">
      <div
        className={cn(
          'rounded-xl border transition-colors',
          active ? 'border-[#2534ff] bg-blue-50/40' : 'border-gray-200 bg-white',
        )}
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {/* Calendar icon — clicking opens the picker */}
          <button
            type="button"
            onClick={onOpen}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
          >
            <Calendar className={cn('w-3.5 h-3.5 shrink-0', isReturn ? 'text-[#2534ff]' : 'text-[#2534ff]')} />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">{label}</p>
              <p className={cn(
                'text-sm font-semibold truncate',
                date ? 'text-gray-900' : 'text-gray-400 font-normal italic',
              )}>
                {date ? fmtDate(date) : 'Select date'}
              </p>
            </div>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 shrink-0" />

          {/* Time select */}
          <div className="relative shrink-0 flex items-center gap-1">
            <div className="pointer-events-none select-none">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Time</p>
              <p className="text-sm font-semibold text-gray-900">{fmtTime(time)}</p>
            </div>
            <select
              value={time}
              onChange={e => onTimeChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ fontSize: 16 /* prevents iOS zoom */ }}
            >
              {TIME_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CalendarPicker portal */}
      {active && (
        <CalendarPicker
          label={label}
          date={date}
          time={time}
          minDate={minDate}
          triggerRef={triggerRef}
          onChange={(d, t) => { onDateChange(d); onTimeChange(t); }}
          onClose={onClose}
          align="right"
        />
      )}
    </div>
  );
}

/* ── TripEditPanel ───────────────────────────────────────────────────────── */
export default function TripEditPanel({
  isRoundTrip,
  initialDate, initialTime,
  initialReturnDate, initialReturnTime,
  onApply, onCancel,
}: TripEditPanelProps) {
  const today = new Date().toISOString().split('T')[0];

  const [date,       setDate]       = useState(initialDate);
  const [time,       setTime]       = useState(initialTime);
  const [returnDate, setReturnDate] = useState(initialReturnDate);
  const [returnTime, setReturnTime] = useState(initialReturnTime);
  const [showDepart, setShowDepart] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  const departRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);

  const canApply = !!date && (!isRoundTrip || !!returnDate);

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2.5 animate-fade-in">

      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Edit trip dates
      </p>

      {/* Departure */}
      <DateTimeRow
        label="Departure"
        date={date}
        time={time}
        minDate={today}
        active={showDepart}
        triggerRef={departRef}
        onOpen={() => { setShowDepart(s => !s); setShowReturn(false); }}
        onClose={() => setShowDepart(false)}
        onDateChange={setDate}
        onTimeChange={setTime}
      />

      {/* Return (round trip only) */}
      {isRoundTrip && (
        <DateTimeRow
          label="Return"
          date={returnDate}
          time={returnTime}
          minDate={date || today}
          isReturn
          active={showReturn}
          triggerRef={returnRef}
          onOpen={() => { setShowReturn(s => !s); setShowDepart(false); }}
          onClose={() => setShowReturn(false)}
          onDateChange={setReturnDate}
          onTimeChange={setReturnTime}
        />
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-0.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
        <button
          type="button"
          disabled={!canApply}
          onClick={() => onApply(date, time, returnDate, returnTime)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white rounded-xl py-2.5 transition-colors',
            canApply
              ? 'bg-[#2534ff] hover:bg-[#1420cc]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          )}
        >
          <Check className="w-3 h-3" />
          Apply
        </button>
      </div>
    </div>
  );
}
