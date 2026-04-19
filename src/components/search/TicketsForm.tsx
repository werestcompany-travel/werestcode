'use client';

import { useRef, useState } from 'react';
import { MapPin, Calendar, Ticket, Search, Plus, Minus } from 'lucide-react';
import CalendarPicker from './CalendarPicker';
import { useLocale } from '@/context/LocaleContext';

const today = new Date().toISOString().split('T')[0];

function fmt12(t: string) {
  if (!t) return '';
  const [hh, mm] = t.split(':').map(Number);
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`;
}

const Divider = () => <div className="w-px self-stretch bg-gray-200 shrink-0 my-3" />;

export default function TicketsForm() {
  const { t } = useLocale();

  const [keyword, setKeyword] = useState('');
  const [date,    setDate]    = useState(today);
  const [time,    setTime]    = useState('09:00');
  const [tickets, setTickets] = useState(1);
  const [showCal, setShowCal] = useState(false);

  const calTrigger = useRef<HTMLDivElement>(null);

  const fmtDate = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : '';

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-visible">

        {/* Header strip — same height as sub-tabs */}
        <div className="flex items-center px-6 pt-4 pb-0 border-b border-gray-100">
          <span className="pb-3 text-sm font-semibold border-b-2 border-[#2534ff] text-[#2534ff]">
            {t('tickets.tab')}
          </span>
        </div>

        {/* Single row */}
        <div className="flex items-stretch h-[72px] px-2">

          {/* ATTRACTION */}
          <div className="flex items-center gap-2.5 flex-[2.5] min-w-0 px-4">
            <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('tickets.attraction')}</p>
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder={t('tickets.hint')}
                className="text-sm font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal bg-transparent outline-none w-full truncate"
              />
            </div>
          </div>

          <Divider />

          {/* DATE */}
          <div ref={calTrigger} className="relative flex items-center shrink-0">
            <button type="button" onClick={() => setShowCal(s => !s)}
              className="flex items-center gap-2.5 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors">
              <Calendar className="w-4 h-4 text-[#2534ff] shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('tickets.visitDate')}</p>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {fmtDate(date) || <span className="font-normal text-gray-300">{t('form.selectDate')}</span>}
                </p>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">{fmt12(time)}</p>
              </div>
            </button>
            {showCal && (
              <CalendarPicker
                label={t('cal.visitDate')}
                date={date} time={time} minDate={today}
                triggerRef={calTrigger}
                onChange={(d, tm) => { setDate(d); setTime(tm); }}
                onClose={() => setShowCal(false)}
                align="left"
              />
            )}
          </div>

          <Divider />

          {/* TICKETS COUNTER */}
          <div className="flex items-center gap-3 px-4 shrink-0">
            <Ticket className="w-4 h-4 text-[#2534ff] shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('tickets.tickets')}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setTickets(v => Math.max(1, v - 1))}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                    tickets <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-[#2534ff] hover:text-[#2534ff]'
                  }`}>
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold text-gray-900 w-5 text-center">{tickets}</span>
                <button type="button" onClick={() => setTickets(v => Math.min(20, v + 1))}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                    tickets >= 20 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-[#2534ff] hover:text-[#2534ff]'
                  }`}>
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* SEARCH — SOON */}
          <div className="flex items-center pl-2 pr-3 shrink-0">
            <button type="button" disabled
              className="flex items-center gap-2 bg-gray-200 text-gray-400 font-bold text-sm px-6 h-11 rounded-xl cursor-not-allowed whitespace-nowrap">
              <Search className="w-4 h-4" />
              {t('form.search')}
              <span className="text-[9px] font-black bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full leading-none ml-1">SOON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/60 font-medium">{t('form.popular')}</span>
        {['Grand Palace', 'Sanctuary of Truth', 'Floating market', 'Tiger Temple'].map(s => (
          <button key={s} type="button" onClick={() => setKeyword(s)}
            className="text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 px-3 py-1.5 rounded-full font-medium transition-colors backdrop-blur-sm">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
