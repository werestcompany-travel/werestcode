'use client';

import { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Calendar, ChevronDown, Users, Luggage, MapPin, Search, Plus, X } from 'lucide-react';
import PassengerSheet, { type PassengerState } from './PassengerSheet';
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

function lookupPlace(name: string): { address: string; lat: number; lng: number } | null {
  const n = name.toLowerCase().trim();
  if (PLACE_COORDS[n]) {
    const p = PLACE_COORDS[n];
    return { address: p.label, lat: p.lat, lng: p.lng };
  }
  const keys = Object.keys(PLACE_COORDS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (n.includes(key)) {
      const p = PLACE_COORDS[key];
      return { address: p.label, lat: p.lat, lng: p.lng };
    }
  }
  return null;
}

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
  const [pax, setPax] = useState<PassengerState>({ adults: 2, children: 0, extraBags: 0 });
  const [showPax,      setShowPax]      = useState(false);
  const [showDepartMob,  setShowDepartMob]  = useState(false);
  const [showReturnMob,  setShowReturnMob]  = useState(false);
  const [showDepartDesk, setShowDepartDesk] = useState(false);
  const [showReturnDesk, setShowReturnDesk] = useState(false);
  const [error,        setError]        = useState('');

  /* ── Refs: mobile gets the Google Maps AC; desktop inputs are controlled ── */
  const pickupRefMobile  = useRef<HTMLInputElement>(null);
  const dropoffRefMobile = useRef<HTMLInputElement>(null);
  const pickupRefDesktop  = useRef<HTMLInputElement>(null);
  const dropoffRefDesktop = useRef<HTMLInputElement>(null);
  const paxRef           = useRef<HTMLDivElement>(null);
  const departTrigger    = useRef<HTMLDivElement>(null);
  const departTriggerMob = useRef<HTMLDivElement>(null);
  const returnTrigger    = useRef<HTMLDivElement>(null);
  const returnTriggerMob = useRef<HTMLDivElement>(null);
  const pickupACMobile   = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffACMobile  = useRef<google.maps.places.Autocomplete | null>(null);
  const pickupACDesktop  = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffACDesktop = useRef<google.maps.places.Autocomplete | null>(null);

  const initAC = useCallback(() => {
    if (!window.google) return;
    const opts: google.maps.places.AutocompleteOptions = {
      fields: ['formatted_address', 'geometry'],
      componentRestrictions: { country: 'TH' },
    };

    if (pickupRefMobile.current && !pickupACMobile.current) {
      pickupACMobile.current = new google.maps.places.Autocomplete(pickupRefMobile.current, opts);
      pickupACMobile.current.addListener('place_changed', () => {
        const p = pickupACMobile.current!.getPlace();
        if (p.geometry?.location) {
          const addr = p.formatted_address ?? pickupRefMobile.current!.value;
          setPickup({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() });
          setPickupInput(addr);
        }
      });
    }
    if (dropoffRefMobile.current && !dropoffACMobile.current) {
      dropoffACMobile.current = new google.maps.places.Autocomplete(dropoffRefMobile.current, opts);
      dropoffACMobile.current.addListener('place_changed', () => {
        const p = dropoffACMobile.current!.getPlace();
        if (p.geometry?.location) {
          const addr = p.formatted_address ?? dropoffRefMobile.current!.value;
          setDropoff({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() });
          setDropoffInput(addr);
        }
      });
    }
    if (pickupRefDesktop.current && !pickupACDesktop.current) {
      pickupACDesktop.current = new google.maps.places.Autocomplete(pickupRefDesktop.current, opts);
      pickupACDesktop.current.addListener('place_changed', () => {
        const p = pickupACDesktop.current!.getPlace();
        if (p.geometry?.location) {
          const addr = p.formatted_address ?? pickupRefDesktop.current!.value;
          setPickup({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() });
          setPickupInput(addr);
        }
      });
    }
    if (dropoffRefDesktop.current && !dropoffACDesktop.current) {
      dropoffACDesktop.current = new google.maps.places.Autocomplete(dropoffRefDesktop.current, opts);
      dropoffACDesktop.current.addListener('place_changed', () => {
        const p = dropoffACDesktop.current!.getPlace();
        if (p.geometry?.location) {
          const addr = p.formatted_address ?? dropoffRefDesktop.current!.value;
          setDropoff({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() });
          setDropoffInput(addr);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (window.google) { initAC(); return; }
    const iv = setInterval(() => { if (window.google) { clearInterval(iv); initAC(); } }, 300);
    return () => clearInterval(iv);
  }, [initAC]);

  /* Close pax dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) {
        setShowPax(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Apply prefill from SEO route grid */
  useEffect(() => {
    if (!prefillRoute) return;
    const fromPlace = lookupPlace(prefillRoute.from);
    const toPlace   = lookupPlace(prefillRoute.to);
    if (fromPlace) { setPickup(fromPlace); setPickupInput(fromPlace.address); }
    else           { setPickup(null); setPickupInput(prefillRoute.from); }
    if (toPlace)   { setDropoff(toPlace); setDropoffInput(toPlace.address); }
    else           { setDropoff(null); setDropoffInput(prefillRoute.to); }
    setError('');
    setShowDepartMob(false);
    setShowDepartDesk(true);
    setShowReturnMob(false);
    setShowReturnDesk(false);
    setShowPax(false);
  }, [prefillRoute]);

  const swap = () => {
    setPickup(dropoff); setDropoff(pickup);
    setPickupInput(dropoffInput); setDropoffInput(pickupInput);
  };

  const handleSearch = () => {
    if (!pickup)  { setError(t('form.errPickup'));  return; }
    if (!dropoff) { setError(t('form.errDropoff')); return; }
    setError('');
    router.push(`/results?${new URLSearchParams({
      pickup_address:  pickup.address,  pickup_lat:  String(pickup.lat),  pickup_lng:  String(pickup.lng),
      dropoff_address: dropoff.address, dropoff_lat: String(dropoff.lat), dropoff_lng: String(dropoff.lng),
      date, time, passengers: String(pax.adults + pax.children), luggage: String(pax.extraBags),
      is_round_trip: hasReturn && returnDate ? 'true' : 'false',
      ...(hasReturn && returnDate ? { return_date: returnDate, return_time: returnTime } : {}),
    })}`);
  };

  const fmtDate = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : '';

  /* thin vertical divider (desktop) */
  const Divider = () => <div className="w-px self-stretch bg-gray-200 shrink-0 my-3" />;

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  MOBILE / TABLET vertical layout  (< lg)                               */
  /* ─────────────────────────────────────────────────────────────────────── */
  const MobileForm = (
    <div className="lg:hidden">

      {/* Passengers & luggage row */}
      <div className="relative border-b border-gray-100">
        <button
          type="button"
          onClick={() => { setShowPax(true); setShowDepartMob(false); setShowReturnMob(false); }}
          className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-800">{pax.adults + pax.children}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Luggage className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-800">{pax.extraBags}</span>
            </div>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', showPax && 'rotate-180')} />
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {showPax && (
        <PassengerSheet
          value={pax}
          onChange={setPax}
          onClose={() => setShowPax(false)}
          mode="sheet"
        />
      )}

      {/* FROM field */}
      <div className="border-b border-gray-100 flex items-center gap-3 px-4 py-3.5">
        <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0" />
        <input
          ref={pickupRefMobile}
          type="text"
          value={pickupInput}
          onChange={e => { setPickupInput(e.target.value); if (!e.target.value) setPickup(null); }}
          placeholder={t('form.fromPlaceholder')}
          className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
        />
        {pickupInput && (
          <button type="button" onClick={() => { setPickupInput(''); setPickup(null); }}
            className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0">×</button>
        )}
      </div>

      {/* TO field */}
      <div className="border-b border-gray-100 flex items-center gap-3 px-4 py-3.5">
        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          ref={dropoffRefMobile}
          type="text"
          value={dropoffInput}
          onChange={e => { setDropoffInput(e.target.value); if (!e.target.value) setDropoff(null); }}
          placeholder={t('form.toPlaceholder')}
          className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
        />
        {dropoffInput && (
          <button type="button" onClick={() => { setDropoffInput(''); setDropoff(null); }}
            className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0">×</button>
        )}
      </div>

      {/* Date row */}
      <div className="border-b border-gray-100 flex">

        {/* Departure */}
        <div ref={departTriggerMob} className="relative flex-1 border-r border-gray-100">
          <button
            type="button"
            onClick={() => { setShowDepartMob(s => !s); setShowReturnMob(false); setShowPax(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className={cn('text-sm', date ? 'text-gray-800 font-medium' : 'text-gray-400')}>
              {fmtDate(date) || 'Departure'}
            </span>
          </button>
          {showDepartMob && (
            <CalendarPicker
              label={t('cal.departureDate')}
              date={date}
              time={time}
              minDate={today}
              triggerRef={departTriggerMob}
              onChange={(d, tm) => { setDate(d); setTime(tm); }}
              onClose={() => setShowDepartMob(false)}
              align="left"
            />
          )}
        </div>

        {/* Add return / Return date */}
        <div ref={returnTriggerMob} className="relative flex-1">
          {hasReturn ? (
            <button
              type="button"
              onClick={() => { setShowReturnMob(s => !s); setShowDepartMob(false); setShowPax(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#2534ff] shrink-0" />
              <span className={cn('text-sm', returnDate ? 'text-gray-800 font-medium' : 'text-gray-400')}>
                {fmtDate(returnDate) || 'Return date'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setHasReturn(true)}
              className="flex items-center gap-2.5 w-full px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-400">{t('form.addReturn')}</span>
            </button>
          )}
          {showReturnMob && hasReturn && (
            <CalendarPicker
              label={t('cal.returnDate')}
              date={returnDate || date}
              time={returnTime}
              minDate={date || today}
              triggerRef={returnTriggerMob}
              onChange={(d, tm) => { setReturnDate(d); setReturnTime(tm); }}
              onClose={() => setShowReturnMob(false)}
              align="right"
            />
          )}
        </div>
      </div>

      {/* Multi-city pill */}
      <div className="px-4 py-3 border-b border-gray-100">
        <button type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium px-4 py-1.5 rounded-full transition-colors">
          {t('form.multiCity')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-1 pt-2">
          <p className="text-red-500 text-sm flex items-center gap-1.5 font-medium">
            <span>⚠</span> {error}
          </p>
        </div>
      )}

      {/* Search button */}
      <div className="px-4 py-4">
        <button
          type="button"
          onClick={handleSearch}
          className="w-full bg-[#2534ff] hover:bg-[#1420cc] active:bg-[#0f18a8] text-white font-bold text-base py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
        >
          {t('form.search')}
        </button>
      </div>

    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  DESKTOP horizontal layout  (lg+)                                      */
  /* ─────────────────────────────────────────────────────────────────────── */
  const DesktopForm = (
    <Fragment>
      {/* ── Single row ── */}
      <div className="hidden lg:flex items-stretch h-[72px] px-2 min-w-[600px]">

        {/* FROM */}
        <div className="flex items-center gap-2.5 flex-[2] min-w-0 px-4">
          <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('form.pickup')}</p>
            <input
              ref={pickupRefDesktop}
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
              ref={dropoffRefDesktop}
              type="text"
              value={dropoffInput}
              onChange={e => { setDropoffInput(e.target.value); if (!e.target.value) setDropoff(null); }}
              placeholder={t('form.whereTo')}
              className="text-sm font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal bg-transparent outline-none w-full truncate"
            />
          </div>
        </div>

        <Divider />

        {/* DEPARTURE DATE */}
        <div ref={departTrigger} className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => { setShowDepartDesk(s => !s); setShowReturnDesk(false); setShowPax(false); }}
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
          {showDepartDesk && (
            <CalendarPicker
              label={t('cal.departureDate')}
              date={date}
              time={time}
              minDate={today}
              triggerRef={departTrigger}
              onChange={(d, tm) => { setDate(d); setTime(tm); }}
              onClose={() => setShowDepartDesk(false)}
              align="left"
            />
          )}
        </div>

        {/* RETURN DATE — or "Add return" trigger */}
        <>
          <Divider />
          <div ref={returnTrigger} className="relative flex items-center shrink-0">
            {hasReturn ? (
              <button
                type="button"
                onClick={() => { setShowReturnDesk(s => !s); setShowDepartDesk(false); setShowPax(false); }}
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
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setHasReturn(false); setReturnDate(''); setShowReturnDesk(false); }}
                  className="ml-1 p-0.5 rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Remove return"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setHasReturn(true)}
                className="flex items-center gap-2 px-4 h-full text-gray-400 hover:text-[#2534ff] hover:bg-blue-50 rounded-xl transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{t('form.addReturn')}</span>
              </button>
            )}
            {showReturnDesk && hasReturn && (
              <CalendarPicker
                label={t('cal.returnDate')}
                date={returnDate || date}
                time={returnTime}
                minDate={date || today}
                triggerRef={returnTrigger}
                onChange={(d, tm) => { setReturnDate(d); setReturnTime(tm); }}
                onClose={() => setShowReturnDesk(false)}
                align="right"
              />
            )}
          </div>
        </>

        <Divider />

        {/* PASSENGERS + LUGGAGE */}
        <div className="relative flex items-center shrink-0" ref={paxRef}>
          <button type="button"
            onClick={() => { setShowPax(!showPax); setShowDepartDesk(false); setShowReturnDesk(false); }}
            className="flex items-center gap-2 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap">
            <Users className="w-4 h-4 text-[#2534ff]" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('form.paxLuggage')}</p>
              <p className="text-sm font-semibold text-gray-900">
                {pax.adults + pax.children} {t('form.paxSummary')} · {pax.extraBags} {t('form.extraBags')}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ml-1 ${showPax ? 'rotate-180' : ''}`} />
          </button>

          {showPax && (
            <PassengerSheet
              value={pax}
              onChange={setPax}
              onClose={() => setShowPax(false)}
              mode="dropdown"
            />
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

      {/* Error (desktop) */}
      {error && (
        <div className="hidden lg:block px-6 pb-3 -mt-1">
          <p className="text-red-500 text-sm flex items-center gap-1.5 font-medium">
            <span>⚠</span> {error}
          </p>
        </div>
      )}
    </Fragment>
  );

  return (
    <Fragment>
      {MobileForm}
      {DesktopForm}
    </Fragment>
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
