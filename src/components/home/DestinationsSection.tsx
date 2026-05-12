'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Car, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

/* ── Destination route type ───────────────────────────────────────────────── */
interface DestRoute {
  fromCode: string;
  fromCity: string;
  toCode:   string;
  toCity:   string;
  price:    string;
  image:    string;
}

/* ── Stable tab keys (language-independent) ──────────────────────────────── */
const DEST_TAB_KEYS = [
  'dest.tab.bkk',
  'dest.tab.hkt',
  'dest.tab.cnx',
  'dest.tab.beach',
] as const;
type DestTabKey = typeof DEST_TAB_KEYS[number];

/* ── Route data keyed by stable tab key ───────────────────────────────────── */
const DEST_ROUTES: Record<DestTabKey, DestRoute[]> = {
  'dest.tab.bkk': [
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'PTY', toCity: 'Pattaya',    price: '฿1,800', image: 'photo-1544551763-77ef2d0cfc6c' },
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'HHN', toCity: 'Hua Hin',    price: '฿1,800', image: 'photo-1552465011-b4e21bf6e79a' },
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'CNX', toCity: 'Chiang Mai', price: '฿5,500', image: 'photo-1558618666-fcd25c85cd64' },
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'KBI', toCity: 'Krabi',      price: '฿3,200', image: 'photo-1467003909585-2f8a72700288' },
  ],
  'dest.tab.hkt': [
    { fromCode: 'HKT', fromCity: 'Phuket', toCode: 'PTG', toCity: 'Patong',   price: '฿800',   image: 'photo-1537956965359-7573183d1f57' },
    { fromCode: 'HKT', fromCity: 'Phuket', toCode: 'KLK', toCity: 'Khao Lak', price: '฿2,200', image: 'photo-1596895111956-bf1cf0599ce5' },
    { fromCode: 'HKT', fromCity: 'Phuket', toCode: 'KBI', toCity: 'Krabi',    price: '฿2,800', image: 'photo-1467003909585-2f8a72700288' },
    { fromCode: 'HKT', fromCity: 'Phuket', toCode: 'KSK', toCity: 'Khao Sok', price: '฿2,500', image: 'photo-1606041008023-472dfb5e530f' },
  ],
  'dest.tab.cnx': [
    { fromCode: 'CNX', fromCity: 'Chiang Mai', toCode: 'CEI', toCity: 'Chiang Rai', price: '฿2,500', image: 'photo-1546567668-bf2e45fb7e87' },
    { fromCode: 'CNX', fromCity: 'Chiang Mai', toCode: 'PAI', toCity: 'Pai',         price: '฿2,200', image: 'photo-1606041008023-472dfb5e530f' },
    { fromCode: 'CNX', fromCity: 'Chiang Mai', toCode: 'SKH', toCity: 'Sukhothai',   price: '฿3,500', image: 'photo-1552465011-b4e21bf6e79a' },
    { fromCode: 'CNX', fromCity: 'Chiang Mai', toCode: 'LPG', toCity: 'Lampang',     price: '฿1,800', image: 'photo-1599576439791-3c9bdafb4d60' },
  ],
  'dest.tab.beach': [
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'KSM', toCity: 'Koh Samui', price: '฿3,500', image: 'photo-1589394815804-964ed0be2eb5' },
    { fromCode: 'KBI', fromCity: 'Krabi',   toCode: 'AON', toCity: 'Ao Nang',   price: '฿800',   image: 'photo-1535083783855-aaab7ebfd4f5' },
    { fromCode: 'HKT', fromCity: 'Phuket',  toCode: 'KRC', toCity: 'Karon',     price: '฿500',   image: 'photo-1537956965359-7573183d1f57' },
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'RYG', toCity: 'Rayong',    price: '฿2,000', image: 'photo-1488646953014-85cb44e25828' },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function DestinationsSection() {
  const { t } = useLocale();
  const [activeKey, setActiveKey] = useState<DestTabKey>('dest.tab.bkk');

  const routes = DEST_ROUTES[activeKey];

  return (
    <section aria-labelledby="dest-heading" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">{t('dest.tagline')}</p>
            <h2 id="dest-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('dest.heading')}</h2>
          </div>
          <a href="/results" className="hidden sm:flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-800 transition-colors">
            {t('dest.seeAll')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto scrollbar-none pb-1" role="tablist" aria-label="Destination filter tabs">
          {DEST_TAB_KEYS.map(key => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeKey === key}
              onClick={() => setActiveKey(key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                activeKey === key
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Route cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="tabpanel">
          {routes.map((route) => (
            <Link
              key={`${route.fromCity}-${route.toCity}`}
              href={`/results?pickup_address=${encodeURIComponent(route.fromCity)}&dropoff_address=${encodeURIComponent(route.toCity)}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label={`${t('dest.transfer')}: ${route.fromCity} to ${route.toCity} — ${t('dest.oneWay')} ${route.price}`}
            >
              {/* Photo */}
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <Image
                  src={`https://images.unsplash.com/${route.image}?auto=format&fit=crop&w=400&q=80`}
                  alt={`Transfer to ${route.toCity}, Thailand`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" aria-hidden="true" />
              </div>

              {/* Info */}
              <div className="p-4">
                {/* Vehicle type */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-5 h-5 bg-brand-50 rounded flex items-center justify-center" aria-hidden="true">
                    <Car className="w-3 h-3 text-brand-600" />
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">{t('dest.transfer')}</span>
                </div>

                {/* Route codes */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-extrabold text-gray-900">{route.fromCode}</span>
                  <ArrowLeftRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <span className="text-lg font-extrabold text-gray-900">{route.toCode}</span>
                </div>

                {/* City names */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 flex-1">{route.fromCity}</span>
                  <span className="text-xs text-gray-400 shrink-0" aria-hidden="true">→</span>
                  <span className="text-xs text-gray-500 flex-1 text-right">{route.toCity}</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400">{t('dest.oneWay')}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block leading-none">{t('rt.from')}</span>
                    <span className="text-base font-extrabold text-brand-600">{route.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
