'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 30-min time slots, 12-hour format */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = h < 12 ? 'am' : 'pm';
  return {
    label: `${h12}:${m} ${ampm}`,
    value: `${h.toString().padStart(2, '0')}:${m}`,
  };
});

function fmt12(t: string) {
  return TIME_OPTIONS.find(o => o.value === t)?.label ?? t;
}

/* ─── Single-month grid ──────────────────────────────────────────────────── */
function MonthGrid({
  year, month, selectedDate, minDate, todayStr, onSelect,
}: {
  year: number; month: number; selectedDate: string;
  minDate: string; todayStr: string; onSelect: (d: string) => void;
}) {
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex-1 min-w-0">
      <p className="text-center text-sm font-bold text-gray-900 mb-3 select-none">
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 pb-1 select-none">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = ds === selectedDate;
          const isToday    = ds === todayStr;
          const disabled   = !!minDate && ds < minDate;
          return (
            <button
              key={ds}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(ds)}
              className={[
                'h-9 w-full flex items-center justify-center text-sm rounded-full transition-colors select-none',
                isSelected ? 'bg-[#2534ff] text-white font-bold shadow-sm'
                  : disabled  ? 'text-gray-300 cursor-not-allowed'
                  : isToday   ? 'font-bold text-gray-900 underline underline-offset-2 hover:bg-blue-50'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-[#2534ff]',
              ].join(' ')}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CalendarPicker ─────────────────────────────────────────────────────── */
interface CalendarPickerProps {
  label: string;
  date: string;
  time: string;
  minDate: string;
  onChange: (date: string, time: string) => void;
  onClose: () => void;
  /** ref of the wrapper div that triggered this picker, used to calculate position */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  triggerRef: React.RefObject<any>;
  align?: 'left' | 'right';
}

export default function CalendarPicker({
  label, date, time, minDate, onChange, onClose, triggerRef, align = 'left',
}: CalendarPickerProps) {
  const { t } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [style,   setStyle]   = useState<React.CSSProperties>({});

  /* Initialise calendar view to the selected date's month */
  const base = date ? new Date(date + 'T00:00:00') : new Date();
  const [viewYear,  setViewYear]  = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  const todayStr   = new Date().toISOString().split('T')[0];
  const PANEL_W    = 680;

  /* Right calendar is always +1 month */
  const rightMonth = (viewMonth + 1) % 12;
  const rightYear  = viewMonth === 11 ? viewYear + 1 : viewYear;

  const goBack = () => {
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  };
  const goFwd = () => {
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });
  };

  /* Position the panel below the trigger button using viewport coords (fixed) */
  const reposition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const top  = r.bottom + 8;
    const rawL = align === 'right' ? r.right - PANEL_W : r.left;
    const left = Math.max(8, Math.min(rawL, window.innerWidth - PANEL_W - 8));
    setStyle({ position: 'fixed', top, left, width: PANEL_W, zIndex: 9999 });
  }, [align, triggerRef]);

  useEffect(() => {
    setMounted(true);
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [reposition]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      const outsidePanel   = !panelRef.current?.contains(t);
      const outsideTrigger = !triggerRef.current?.contains(t);
      if (outsidePanel && outsideTrigger) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, triggerRef]);

  /* Long-form date display */
  const fmtDateLong = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    }) : '—';

  if (!mounted) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className="bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.22)] border border-gray-100"
    >
      {/* ── Dual calendar ── */}
      <div className="flex items-start gap-2 px-4 pt-5 pb-4">
        {/* Prev */}
        <button type="button" onClick={goBack}
          className="mt-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 shrink-0 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Left month */}
        <MonthGrid
          year={viewYear} month={viewMonth}
          selectedDate={date} minDate={minDate} todayStr={todayStr}
          onSelect={d => onChange(d, time)}
        />

        <div className="w-px self-stretch bg-gray-100 mx-2 mt-8" />

        {/* Right month */}
        <MonthGrid
          year={rightYear} month={rightMonth}
          selectedDate={date} minDate={minDate} todayStr={todayStr}
          onSelect={d => onChange(d, time)}
        />

        {/* Next */}
        <button type="button" onClick={goFwd}
          className="mt-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 shrink-0 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-100 flex items-center gap-4 px-6 py-3">

        {/* Selected date label */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 font-medium mb-0.5">{label}</p>
          <p className="text-sm font-bold text-gray-900">{fmtDateLong(date)}</p>
        </div>

        <div className="w-px h-10 bg-gray-200 shrink-0" />

        {/* Time — native <select> hidden behind visible display, always works */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 pointer-events-none">
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-0.5">{t('form.departureTime')}</p>
              <p className="text-sm font-bold text-gray-900">{fmt12(time)}</p>
            </div>
            {/* chevron indicator */}
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {/* Invisible native select sits on top — handles all interaction */}
          <select
            value={time}
            onChange={e => onChange(date, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ fontSize: 16 /* prevents iOS zoom */ }}
          >
            {TIME_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

      </div>
    </div>,
    document.body,
  );
}
