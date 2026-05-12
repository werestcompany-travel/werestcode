'use client';

import { Fragment, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Tag, Search, ChevronDown } from 'lucide-react';
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

// Maps locale activity keys → URL category values
const ACTIVITY_TO_CATEGORY: Record<string, string> = {
  'act.all':    '',
  'act.day':    'day-trip',
  'act.adv':    'adventure',
  'act.cult':   'cultural',
  'act.food':   'food',
  'act.water':  'water',
  'act.nature': 'nature',
  'act.city':   'cultural',
};

export default function ToursForm() {
  const { t } = useLocale();
  const router = useRouter();

  const [destination, setDestination] = useState('');
  const [date,        setDate]        = useState(today);
  const [time,        setTime]        = useState('09:00');
  const [activityKey, setActivityKey] = useState('act.all');
  const [tripType,    setTripType]    = useState<'day' | 'multi'>('day');
  const [showCal,     setShowCal]     = useState(false);

  const calTrigger = useRef<HTMLDivElement>(null);

  const ACTIVITY_KEYS = [
    'act.all', 'act.day', 'act.adv', 'act.cult',
    'act.food', 'act.water', 'act.nature', 'act.city',
  ];

  const fmtDate = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : '';

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (destination.trim()) p.set('destination', destination.trim());
    if (date)               p.set('date', date);
    const category = ACTIVITY_TO_CATEGORY[activityKey];
    if (category)           p.set('category', category);
    if (tripType === 'multi') p.set('type', 'multi');
    router.push(`/tours?${p.toString()}`);
  };

  const handleChipClick = (label: string) => {
    setDestination(label);
    const p = new URLSearchParams();
    p.set('destination', label);
    router.push(`/tours?${p.toString()}`);
  };

  return (
    <Fragment>

        {/* Sub-tabs */}
        <div className="flex items-center px-6 pt-4 pb-0 border-b border-gray-100">
          <button type="button" onClick={() => setTripType('day')}
            className={`pb-3 mr-7 text-sm font-semibold border-b-2 transition-colors ${
              tripType === 'day' ? 'border-[#2534ff] text-[#2534ff]' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}>
            {t('tours.dayTrip')}
          </button>
          <button type="button" onClick={() => setTripType('multi')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              tripType === 'multi' ? 'border-[#2534ff] text-[#2534ff]' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}>
            {t('tours.multiDay')}
          </button>
        </div>

        {/* Single row */}
        <div className="flex items-stretch h-[72px] px-2">

          {/* DESTINATION */}
          <div className="flex items-center gap-2.5 flex-[2.5] min-w-0 px-4">
            <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('tours.destination')}</p>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                placeholder={t('tours.destHint')}
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
                <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('tours.tourDate')}</p>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {fmtDate(date) || <span className="font-normal text-gray-300">{t('form.selectDate')}</span>}
                </p>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">{fmt12(time)}</p>
              </div>
            </button>
            {showCal && (
              <CalendarPicker
                label={t('cal.tourDate')}
                date={date} time={time} minDate={today}
                triggerRef={calTrigger}
                onChange={(d, tm) => { setDate(d); setTime(tm); }}
                onClose={() => setShowCal(false)}
                align="left"
              />
            )}
          </div>

          <Divider />

          {/* ACTIVITY TYPE */}
          <div className="relative flex items-center flex-[1.4] min-w-0 px-4">
            <Tag className="w-4 h-4 text-[#2534ff] shrink-0 mr-2.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('tours.activityType')}</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{t(activityKey)}</p>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </div>
            </div>
            <select
              value={activityKey}
              onChange={e => setActivityKey(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ fontSize: 16 }}
            >
              {ACTIVITY_KEYS.map(k => <option key={k} value={k}>{t(k)}</option>)}
            </select>
          </div>

          {/* SEARCH — now functional */}
          <div className="flex items-center pl-2 pr-3 shrink-0">
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center gap-2 bg-[#2534ff] hover:bg-[#1e2ce6] text-white font-bold text-sm px-6 h-11 rounded-xl transition-colors whitespace-nowrap shadow-[0_4px_14px_rgba(37,52,255,0.35)]"
            >
              <Search className="w-4 h-4" />
              {t('form.search')}
            </button>
          </div>
        </div>

    </Fragment>
  );
}
