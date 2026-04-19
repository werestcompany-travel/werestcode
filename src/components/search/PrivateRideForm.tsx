'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Calendar, ChevronDown, Users, Luggage, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceResult } from '@/types';
import CalendarPicker from './CalendarPicker';
import { useLocale } from '@/context/LocaleContext';

declare global { interface Window { google: typeof google; } }

const today = new Date().toISOString().split('T')[0];

/* ── Known place coordinates (covers SEO route grid) ────────────────────── */
type PlaceCoord = { lat: number; lng: number; label: string };
const PLACE_COORDS: Record<string, PlaceCoord> = {
  'suvarnabhumi airport':          { lat: 13.6900, lng: 100.7501, label: 'Suvarnabhumi Airport (BKK), Samut Prakan, Thailand' },
  'bangkok airport':               { lat: 13.6900, lng: 100.7501, label: 'Suvarnabhumi Airport (BKK), Samut Prakan, Thailand' },
  'don mueang international airport': { lat: 13.9126, lng: 100.6068, label: 'Don Mueang International Airport (DMK), Bangkok, Thailand' },
  'don mueang airport':            { lat: 13.9126, lng: 100.6068, label: 'Don Mueang International Airport (DMK), Bangkok, Thailand' },
  'chiang mai airport':            { lat: 18.7669, lng: 98.9625,  label: 'Chiang Mai International Airport, Thailand' },
  'chiang rai airport':            { lat: 19.9523, lng: 99.8829,  label: 'Chiang Rai International Airport, Thailand' },
  'phuket airport':                { lat: 8.1132,  lng: 98.3167,  label: 'Phuket International Airport, Thailand' },
  'bangkok city':                  { lat: 13.7563, lng: 100.5018, label: 'Bangkok, Thailand' },
  'bangkok':                       { lat: 13.7563, lng: 100.5018, label: 'Bangkok, Thailand' },
  'sukhumvit':                     { lat: 13.7383, lng: 100.5601, label: 'Sukhumvit, Bangkok, Thailand' },
  'pattaya':                       { lat: 12.9236, lng: 100.8825, label: 'Pattaya City, Chonburi, Thailand' },
  'hua hin':                       { lat: 12.5698, lng: 99.9584,  label: 'Hua Hin, Prachuap Khiri Khan, Thailand' },
  'patong beach':                  { lat: 7.8960,  lng: 98.2980,  label: 'Patong Beach, Phuket, Thailand' },
  'patong':                        { lat: 7.8960,  lng: 98.2980,  label: 'Patong, Phuket, Thailand' },
  'bang tao':                      { lat: 8.0878,  lng: 98.2975,  label: 'Bang Tao Beach, Phuket, Thailand' },
  'khao lak':                      { lat: 8.6833,  lng: 98.2942,  label: 'Khao Lak, Phang Nga, Thailand' },
  'kata beach':                    { lat: 7.8199,  lng: 98.2983,  label: 'Kata Beach, Phuket, Thailand' },
  'karon':                         { lat: 7.8487,  lng: 98.2961,  label: 'Karon Beach, Phuket, Thailand' },
  'phuket town':                   { lat: 7.8874,  lng: 98.3874,  label: 'Phuket Town, Phuket, Thailand' },
  'phuket':                        { lat: 7.8874,  lng: 98.3874,  label: 'Phuket, Thailand' },
  'rawai':                         { lat: 7.7740,  lng: 98.3347,  label: 'Rawai, Phuket, Thailand' },
  'chalong':                       { lat: 7.8177,  lng: 98.3538,  label: 'Chalong, Phuket, Thailand' },
  'nai thon':                      { lat: 8.1486,  lng: 98.2874,  label: 'Nai Thon Beach, Phuket, Thailand' },
  'panwa':                         { lat: 7.7968,  lng: 98.4102,  label: 'Cape Panwa, Phuket, Thailand' },
  'mai khao':                      { lat: 8.1866,  lng: 98.3003,  label: 'Mai Khao, Phuket, Thailand' },
  'kamala beach':                  { lat: 7.9561,  lng: 98.2768,  label: 'Kamala Beach, Phuket, Thailand' },
  'kamala':                        { lat: 7.9561,  lng: 98.2768,  label: 'Kamala, Phuket, Thailand' },
  'krabi':                         { lat: 8.0863,  lng: 98.9063,  label: 'Krabi, Thailand' },
  'ao nang':                       { lat: 8.0327,  lng: 98.8286,  label: 'Ao Nang, Krabi, Thailand' },
  'railay':                        { lat: 8.0122,  lng: 98.8371,  label: 'Railay Beach, Krabi, Thailand' },
  'chiang mai':                    { lat: 18.7883, lng: 98.9853,  label: 'Chiang Mai, Thailand' },
  'chiang rai':                    { lat: 19.9105, lng: 99.8406,  label: 'Chiang Rai, Thailand' },
  'pai':                           { lat: 19.3589, lng: 98.4417,  label: 'Pai, Mae Hong Son, Thailand' },
  'sukhothai':                     { lat: 17.0087, lng: 99.8230,  label: 'Sukhothai, Thailand' },
  'ayutthaya':                     { lat: 14.3532, lng: 100.5683, label: 'Ayutthaya, Thailand' },
  'kanchanaburi':                  { lat: 14.0024, lng: 99.5470,  label: 'Kanchanaburi, Thailand' },
  'surat thani':                   { lat: 9.1396,  lng: 99.3272,  label: 'Surat Thani, Thailand' },
  'trang':                         { lat: 7.5582,  lng: 99.6114,  label: 'Trang, Thailand' },
  'khao sok':                      { lat: 8.9167,  lng: 98.5167,  label: 'Khao Sok National Park, Surat Thani, Thailand' },
  'don sak':                       { lat: 9.3167,  lng: 99.9000,  label: 'Don Sak, Surat Thani, Thailand' },
  'chumphon':                      { lat: 10.4930, lng: 99.1800,  label: 'Chumphon, Thailand' },
  'phitsanulok':                   { lat: 16.8211, lng: 100.2659, label: 'Phitsanulok, Thailand' },
  'lampang':                       { lat: 18.2888, lng: 99.5012,  label: 'Lampang, Thailand' },
  'khao yai':                      { lat: 14.4289, lng: 101.3668, label: 'Khao Yai, Nakhon Ratchasima, Thailand' },
  'laem chabang port':             { lat: 13.0838, lng: 100.9031, label: 'Laem Chabang Port, Chonburi, Thailand' },
  'laem chabang':                  { lat: 13.0838, lng: 100.9031, label: 'Laem Chabang, Chonburi, Thailand' },
  'rayong':                        { lat: 12.6839, lng: 101.2816, label: 'Rayong, Thailand' },
  'nakhon ratchasima':             { lat: 14.9799, lng: 102.0978, label: 'Nakhon Ratchasima (Korat), Thailand' },
  'nakhon pathom':                 { lat: 13.8196, lng: 100.0596, label: 'Nakhon Pathom, Thailand' },
  'nakhon sawan':                  { lat: 15.7030, lng: 100.1347, label: 'Nakhon Sawan, Thailand' },
  'lopburi':                       { lat: 14.7995, lng: 100.6534, label: 'Lopburi, Thailand' },
  'chanthaburi':                   { lat: 12.6106, lng: 102.1038, label: 'Chanthaburi, Thailand' },
  'koh chang':                     { lat: 12.0556, lng: 102.3217, label: 'Koh Chang, Trat, Thailand' },
  'damnoen saduak':                { lat: 13.5200, lng: 99.9700,  label: 'Damnoen Saduak, Ratchaburi, Thailand' },
  'ratchaburi':                    { lat: 13.5282, lng: 99.8138,  label: 'Ratchaburi, Thailand' },
  'sai yok':                       { lat: 14.1833, lng: 98.8833,  label: 'Sai Yok, Kanchanaburi, Thailand' },
  'amphawa':                       { lat: 13.4234, lng: 99.9598,  label: 'Amphawa, Samut Songkhram, Thailand' },
  'buriram':                       { lat: 14.9933, lng: 103.1027, label: 'Buriram, Thailand' },
  'surin':                         { lat: 14.8824, lng: 103.4936, label: 'Surin, Thailand' },
  'laem sok':                      { lat: 8.5167,  lng: 99.8667,  label: 'Laem Sok, Trang, Thailand' },
  'ban phe pier':                  { lat: 12.6464, lng: 101.4596, label: 'Ban Phe Pier, Rayong, Thailand' },
  'hat yai':                       { lat: 7.0067,  lng: 100.4757, label: 'Hat Yai, Songkhla, Thailand' },
  'penang':                        { lat: 5.4141,  lng: 100.3288, label: 'Penang, Malaysia' },
  'golden triangle':               { lat: 20.3500, lng: 100.0833, label: 'Golden Triangle, Chiang Rai, Thailand' },
  'chiang saen':                   { lat: 20.2715, lng: 100.0844, label: 'Chiang Saen, Chiang Rai, Thailand' },
  'white temple':                  { lat: 19.8247, lng: 99.7641,  label: 'Wat Rong Khun (White Temple), Chiang Rai, Thailand' },
};

/** Resolve a free-text place name to coordinates. Longer keys are tried first. */
function lookupPlace(name: string): { address: string; lat: number; lng: number } | null {
  const n = name.toLowerCase().trim();
  if (PLACE_COORDS[n]) {
    const p = PLACE_COORDS[n];
    return { address: p.label, lat: p.lat, lng: p.lng };
  }
  // Sort keys longest→shortest so "phuket airport" wins over "phuket"
  const keys = Object.keys(PLACE_COORDS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (n.includes(key)) {
      const p = PLACE_COORDS[key];
      return { address: p.label, lat: p.lat, lng: p.lng };
    }
  }
  return null;
}

const QUICK_ROUTES = [
  {
    label: 'BKK → Bangkok',
    pickup:  { address: 'Suvarnabhumi Airport (BKK), Bang Phli District, Samut Prakan, Thailand', lat: 13.6900, lng: 100.7501 },
    dropoff: { address: 'Sukhumvit Road, Bangkok, Thailand', lat: 13.7383, lng: 100.5601 },
  },
  {
    label: 'DMK → Bangkok',
    pickup:  { address: 'Don Mueang International Airport (DMK), Don Mueang, Bangkok, Thailand', lat: 13.9126, lng: 100.6068 },
    dropoff: { address: 'Sukhumvit Road, Bangkok, Thailand', lat: 13.7383, lng: 100.5601 },
  },
  {
    label: 'BKK → Pattaya',
    pickup:  { address: 'Suvarnabhumi Airport (BKK), Bang Phli District, Samut Prakan, Thailand', lat: 13.6900, lng: 100.7501 },
    dropoff: { address: 'Pattaya City, Chonburi, Thailand', lat: 12.9236, lng: 100.8825 },
  },
];

/** Format 24h time → "9:00 am" */
function fmtTime(t: string) {
  if (!t) return '';
  const [hh, mm] = t.split(':').map(Number);
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`;
}

interface PrefillRoute { from: string; to: string; }

export default function PrivateRideForm({ prefillRoute }: { prefillRoute?: PrefillRoute | null }) {
  const router = useRouter();
  const { t } = useLocale();

  const [pickup,       setPickup]       = useState<PlaceResult | null>(null);
  const [dropoff,      setDropoff]      = useState<PlaceResult | null>(null);
  const [pickupInput,  setPickupInput]  = useState('');
  const [dropoffInput, setDropoffInput] = useState('');
  const [date,         setDate]         = useState(today);
  const [time,         setTime]         = useState('09:00');
  const [hasReturn,    setHasReturn]    = useState(false);
  const [returnDate,   setReturnDate]   = useState('');
  const [returnTime,   setReturnTime]   = useState('09:00');
  const [passengers,   setPassengers]   = useState(2);
  const [luggage,      setLuggage]      = useState(2);
  const [showPax,      setShowPax]      = useState(false);
  const [showDepart,   setShowDepart]   = useState(false);
  const [showReturn,   setShowReturn]   = useState(false);
  const [error,        setError]        = useState('');

  const pickupRef      = useRef<HTMLInputElement>(null);
  const dropoffRef     = useRef<HTMLInputElement>(null);
  const paxRef         = useRef<HTMLDivElement>(null);
  const departTrigger  = useRef<HTMLDivElement>(null);
  const returnTrigger  = useRef<HTMLDivElement>(null);
  const pickupAC       = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAC      = useRef<google.maps.places.Autocomplete | null>(null);

  const initAC = useCallback(() => {
    if (!window.google || !pickupRef.current || !dropoffRef.current) return;
    const opts: google.maps.places.AutocompleteOptions = {
      fields: ['formatted_address', 'geometry'],
      componentRestrictions: { country: 'TH' },
    };
    pickupAC.current = new google.maps.places.Autocomplete(pickupRef.current, opts);
    pickupAC.current.addListener('place_changed', () => {
      const p = pickupAC.current!.getPlace();
      if (p.geometry?.location) {
        const addr = p.formatted_address ?? pickupRef.current!.value;
        setPickup({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() });
        setPickupInput(addr);
      }
    });
    dropoffAC.current = new google.maps.places.Autocomplete(dropoffRef.current, opts);
    dropoffAC.current.addListener('place_changed', () => {
      const p = dropoffAC.current!.getPlace();
      if (p.geometry?.location) {
        const addr = p.formatted_address ?? dropoffRef.current!.value;
        setDropoff({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() });
        setDropoffInput(addr);
      }
    });
  }, []);

  useEffect(() => {
    if (window.google) { initAC(); return; }
    const iv = setInterval(() => { if (window.google) { clearInterval(iv); initAC(); } }, 300);
    return () => clearInterval(iv);
  }, [initAC]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) setShowPax(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Apply prefill from SEO route grid ── */
  useEffect(() => {
    if (!prefillRoute) return;
    const fromPlace = lookupPlace(prefillRoute.from);
    const toPlace   = lookupPlace(prefillRoute.to);
    if (fromPlace) {
      setPickup(fromPlace);
      setPickupInput(fromPlace.address);
    } else {
      setPickup(null);
      setPickupInput(prefillRoute.from);
    }
    if (toPlace) {
      setDropoff(toPlace);
      setDropoffInput(toPlace.address);
    } else {
      setDropoff(null);
      setDropoffInput(prefillRoute.to);
    }
    setError('');
    // Open the departure date picker so user can pick date & time
    setShowDepart(true);
    setShowReturn(false);
    setShowPax(false);
  }, [prefillRoute]);

  const swap = () => {
    setPickup(dropoff); setDropoff(pickup);
    setPickupInput(dropoffInput); setDropoffInput(pickupInput);
  };

  const applyQuick = (r: typeof QUICK_ROUTES[0]) => {
    setPickup(r.pickup); setPickupInput(r.pickup.address);
    setDropoff(r.dropoff); setDropoffInput(r.dropoff.address);
    setError('');
  };

  const handleSearch = () => {
    if (!pickup)  { setError('Please enter a pickup location');  return; }
    if (!dropoff) { setError('Please enter a drop-off location'); return; }
    setError('');
    router.push(`/results?${new URLSearchParams({
      pickup_address:  pickup.address,  pickup_lat:  String(pickup.lat),  pickup_lng:  String(pickup.lng),
      dropoff_address: dropoff.address, dropoff_lat: String(dropoff.lat), dropoff_lng: String(dropoff.lng),
      date, time, passengers: String(passengers), luggage: String(luggage),
      is_round_trip: hasReturn && returnDate ? 'true' : 'false',
      ...(hasReturn && returnDate ? { return_date: returnDate, return_time: returnTime } : {}),
    })}`);
  };

  const fmtDate = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : '';

  /* thin vertical divider */
  const Divider = () => <div className="w-px self-stretch bg-gray-200 shrink-0 my-3" />;

  return (
    <div className="space-y-3">

      {/* ── White card ── */}
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-visible">

        {/* ── Sub-tabs ── */}
        <div className="flex items-center px-6 pt-4 pb-0 border-b border-gray-100">
          <button type="button" onClick={() => setHasReturn(false)}
            className={`pb-3 mr-7 text-sm font-semibold border-b-2 transition-colors ${
              !hasReturn ? 'border-[#2534ff] text-[#2534ff]' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}>
            {t('form.oneWay')}
          </button>
          <button type="button" onClick={() => setHasReturn(true)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              hasReturn ? 'border-[#2534ff] text-[#2534ff]' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}>
            {t('form.roundTrip')}
          </button>
        </div>

        {/* ── Single row ── */}
        <div className="flex items-stretch h-[72px] px-2">

          {/* FROM */}
          <div className="flex items-center gap-2.5 flex-[2] min-w-0 px-4">
            <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('form.pickup')}</p>
              <input
                ref={pickupRef}
                type="text"
                value={pickupInput}
                onChange={e => { setPickupInput(e.target.value); if (!e.target.value) setPickup(null); }}
                placeholder={t('form.whereFrom')}
                className="text-sm font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal bg-transparent outline-none w-full truncate"
              />
            </div>
          </div>

          {/* SWAP */}
          <div className="flex items-center shrink-0 -mx-1 z-10">
            <button type="button" onClick={swap}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#2534ff] hover:text-[#2534ff] transition-colors text-gray-400 shadow-sm">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TO */}
          <div className="flex items-center gap-2.5 flex-[2] min-w-0 px-4">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('form.dropoff')}</p>
              <input
                ref={dropoffRef}
                type="text"
                value={dropoffInput}
                onChange={e => { setDropoffInput(e.target.value); if (!e.target.value) setDropoff(null); }}
                placeholder={t('form.whereTo')}
                className="text-sm font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal bg-transparent outline-none w-full truncate"
              />
            </div>
          </div>

          <Divider />

          {/* DEPARTURE DATE — opens CalendarPicker */}
          <div ref={departTrigger} className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => { setShowDepart(s => !s); setShowReturn(false); setShowPax(false); }}
              className="flex items-center gap-2.5 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#2534ff] shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('form.departure')}</p>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {fmtDate(date) || <span className="font-normal text-gray-300">{t('form.selectDate')}</span>}
                </p>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">{fmtTime(time)}</p>
              </div>
            </button>

            {showDepart && (
              <CalendarPicker
                label={t('cal.departureDate')}
                date={date}
                time={time}
                minDate={today}
                triggerRef={departTrigger}
                onChange={(d, t) => { setDate(d); setTime(t); }}
                onClose={() => setShowDepart(false)}
                align="left"
              />
            )}
          </div>

          {/* RETURN DATE — only in round trip */}
          {hasReturn && (
            <>
              <Divider />
              <div ref={returnTrigger} className="relative flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => { setShowReturn(s => !s); setShowDepart(false); setShowPax(false); }}
                  className="flex items-center gap-2.5 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('form.return')}</p>
                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {returnDate ? fmtDate(returnDate) : <span className="font-normal text-gray-300">{t('form.selectDate')}</span>}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                      {returnDate ? fmtTime(returnTime) : '—'}
                    </p>
                  </div>
                </button>

                {showReturn && (
                  <CalendarPicker
                    label={t('cal.returnDate')}
                    date={returnDate || date}
                    time={returnTime}
                    minDate={date || today}
                    triggerRef={returnTrigger}
                    onChange={(d, t) => { setReturnDate(d); setReturnTime(t); }}
                    onClose={() => setShowReturn(false)}
                    align="right"
                  />
                )}
              </div>
            </>
          )}

          <Divider />

          {/* PASSENGERS + LUGGAGE */}
          <div className="relative flex items-center shrink-0" ref={paxRef}>
            <button type="button"
              onClick={() => { setShowPax(!showPax); setShowDepart(false); setShowReturn(false); }}
              className="flex items-center gap-2 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap">
              <Users className="w-4 h-4 text-[#2534ff]" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('form.paxLuggage')}</p>
                <p className="text-sm font-semibold text-gray-900">{passengers} pax · {luggage} bags</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ml-1 ${showPax ? 'rotate-180' : ''}`} />
            </button>

            {showPax && (
              <div className="absolute bottom-full right-0 mb-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 space-y-4">
                <CounterRow label={t('form.passengers')} icon={<Users className="w-4 h-4 text-gray-400" />}
                  value={passengers} min={1} max={10} onChange={setPassengers} />
                <CounterRow label={t('form.luggage')} icon={<Luggage className="w-4 h-4 text-gray-400" />}
                  value={luggage} min={0} max={15} onChange={setLuggage} />
                <button type="button" onClick={() => setShowPax(false)}
                  className="w-full text-xs font-bold text-[#2534ff] bg-blue-50 rounded-xl py-2 hover:bg-blue-100 transition-colors">
                  {t('form.done')}
                </button>
              </div>
            )}
          </div>

          {/* SEARCH BUTTON */}
          <div className="flex items-center pl-2 pr-3 shrink-0">
            <button type="button" onClick={handleSearch}
              className="flex items-center gap-2 bg-[#2534ff] hover:bg-[#1420cc] active:bg-[#0f18a8] text-white font-bold text-sm px-6 h-11 rounded-xl transition-colors shadow-md hover:shadow-lg whitespace-nowrap">
              <Search className="w-4 h-4" />
              {t('form.search')}
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="px-6 pb-3 -mt-1">
            <p className="text-red-500 text-sm flex items-center gap-1.5 font-medium">
              <span>⚠</span> {error}
            </p>
          </div>
        )}
      </div>

      {/* ── Quick routes ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/60 font-medium">{t('form.popular')}</span>
        {QUICK_ROUTES.map(r => (
          <button key={r.label} type="button" onClick={() => applyQuick(r)}
            className="text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 px-3 py-1.5 rounded-full font-medium transition-colors backdrop-blur-sm">
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CounterRow({ icon, label, value, min, max, onChange }: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-700">{icon} {label}</div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className={cn('w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 text-lg leading-none transition-colors',
            value <= min ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-[#2534ff] hover:border-blue-300')}>
          −
        </button>
        <span className="text-sm font-bold w-5 text-center">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className={cn('w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 text-lg leading-none transition-colors',
            value >= max ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-[#2534ff] hover:border-blue-300')}>
          +
        </button>
      </div>
    </div>
  );
}
