'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car, Map, Ticket, Ship, Users, Gift,
  ArrowRight, Clock, Star, MapPin,
  Plane, Utensils, Globe,
} from 'lucide-react';

type SideTabId = 'transfers' | 'tours' | 'attractions' | 'dinner-cruise' | 'group-tours' | 'rewards';

/* ─── Sidebar tab definition ─────────────────────────────────────────────── */
interface SideTab {
  id:      SideTabId;
  label:   string;
  icon:    React.ReactNode;
  badge?:  string;
  badgeColor?: string;
}

const GROUPS: SideTab[][] = [
  [
    { id: 'transfers',     label: 'Private Transfers', icon: <Car    className="w-[18px] h-[18px]" /> },
    { id: 'tours',         label: 'Tours',             icon: <Globe  className="w-[18px] h-[18px]" /> },
    { id: 'attractions',   label: 'Attractions',       icon: <Ticket className="w-[18px] h-[18px]" /> },
    { id: 'dinner-cruise', label: 'Dinner Cruise',     icon: <Utensils className="w-[18px] h-[18px]" />, badge: 'New', badgeColor: 'bg-emerald-500' },
    { id: 'group-tours',   label: 'Group Tours',       icon: <Users  className="w-[18px] h-[18px]" /> },
  ],
  [
    { id: 'rewards',       label: 'Werest Rewards',   icon: <Gift   className="w-[18px] h-[18px]" />, badge: 'Earn Points', badgeColor: 'bg-[#2534ff]' },
  ],
];

/* ─── Right-panel content ────────────────────────────────────────────────── */
const TRANSFERS_ROUTES = [
  { from: 'BKK Airport',    to: 'Bangkok City',  price: '฿1,200', time: '45 min',  emoji: '🏙️' },
  { from: 'BKK Airport',    to: 'Pattaya',       price: '฿1,800', time: '1h 45m',  emoji: '🏖️' },
  { from: 'BKK Airport',    to: 'Hua Hin',       price: '฿2,200', time: '2h 30m',  emoji: '🌊' },
  { from: 'Phuket Airport', to: 'Patong Beach',  price: '฿1,200', time: '45 min',  emoji: '🏝️' },
  { from: 'Chiang Mai',     to: 'Chiang Rai',    price: '฿2,500', time: '3h 00m',  emoji: '🌿' },
  { from: 'DMK Airport',    to: 'Bangkok City',  price: '฿1,200', time: '40 min',  emoji: '✈️' },
];

const TOURS_DATA = [
  { name: 'Grand Palace & Temples',        loc: 'Bangkok',    price: '฿1,800', emoji: '🏛️' },
  { name: 'Elephant Sanctuary Day Trip',   loc: 'Chiang Mai', price: '฿2,200', emoji: '🐘' },
  { name: 'Phi Phi Islands',              loc: 'Phuket',     price: '฿2,800', emoji: '🏝️' },
  { name: 'Floating Market',              loc: 'Bangkok',    price: '฿1,500', emoji: '⛵' },
  { name: 'White Temple & Golden Triangle', loc: 'Chiang Rai', price: '฿2,500', emoji: '🛕' },
  { name: 'James Bond Island',            loc: 'Krabi',      price: '฿2,000', emoji: '🗻' },
];

const ATTRACTIONS_DATA = [
  { name: 'Sanctuary of Truth',  loc: 'Pattaya',    price: '฿500',   rating: 4.9, emoji: '🏯', href: '/attractions/sanctuary-of-truth' },
  { name: 'Grand Palace',        loc: 'Bangkok',    price: '฿500',   rating: 4.8, emoji: '🏛️', href: '/attractions' },
  { name: 'Elephant Kingdom',    loc: 'Chonburi',   price: '฿400',   rating: 4.7, emoji: '🐘', href: '/attractions' },
  { name: 'Phi Phi Island Tour', loc: 'Phuket',     price: '฿1,200', rating: 4.9, emoji: '🏝️', href: '/attractions' },
  { name: 'Similan Islands',     loc: 'Phang Nga',  price: '฿1,800', rating: 4.8, emoji: '🤿', href: '/attractions' },
  { name: 'Doi Inthanon',        loc: 'Chiang Mai', price: '฿800',   rating: 4.6, emoji: '⛰️', href: '/attractions' },
];

const TIER_ROWS = [
  { label: 'Explorer',   emoji: '🌍', pts: '0 pts',      g: 'from-amber-400 to-orange-500'  },
  { label: 'Adventurer', emoji: '🧭', pts: '1,000 pts',  g: 'from-slate-400 to-slate-600'    },
  { label: 'Navigator',  emoji: '⭐', pts: '3,000 pts',  g: 'from-yellow-400 to-amber-500'   },
  { label: 'Voyager',    emoji: '💎', pts: '8,000 pts',  g: 'from-indigo-500 to-purple-600'  },
];

/* shared row card */
function RowCard({ href, emoji, title, sub, right }: { href: string; emoji: string; title: string; sub: string; right: React.ReactNode }) {
  return (
    <Link href={href}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
      <span className="text-xl w-7 text-center shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#2534ff] transition-colors">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <span className="text-xs font-bold text-[#2534ff] shrink-0">{right}</span>
    </Link>
  );
}

function PanelHeader({ title, href, cta = 'See all' }: { title: string; href: string; cta?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h3 className="font-extrabold text-gray-900">{title}</h3>
      <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-[#2534ff] hover:underline">
        {cta} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

/* ─── Panels ──────────────────────────────────────────────────────────────── */
function TransfersPanel() {
  return (
    <div>
      <PanelHeader title="Popular Transfer Routes" href="/private-transfer" />
      <div className="divide-y divide-gray-50">
        {TRANSFERS_ROUTES.map(r => (
          <RowCard
            key={r.from + r.to}
            href={`/results?pickup_address=${encodeURIComponent(r.from)}&dropoff_address=${encodeURIComponent(r.to)}`}
            emoji={r.emoji}
            title={`${r.from} → ${r.to}`}
            sub={r.time}
            right={r.price}
          />
        ))}
      </div>
      <div className="px-5 py-4">
        <Link href="/private-transfer"
          className="flex items-center justify-center gap-2 w-full bg-[#2534ff] hover:bg-[#1a27e0] text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
          Book a private transfer <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function ToursPanel() {
  return (
    <div>
      <PanelHeader title="Popular Day Trips & Tours" href="/tours" />
      <div className="divide-y divide-gray-50">
        {TOURS_DATA.map(t => (
          <RowCard key={t.name} href="/tours" emoji={t.emoji} title={t.name} sub={t.loc} right={t.price} />
        ))}
      </div>
      <div className="px-5 py-4">
        <Link href="/tours"
          className="flex items-center justify-center gap-2 w-full bg-[#2534ff] hover:bg-[#1a27e0] text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
          Explore all tours <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function AttractionsPanel() {
  return (
    <div>
      <PanelHeader title="Top Attractions in Thailand" href="/attractions" />
      <div className="divide-y divide-gray-50">
        {ATTRACTIONS_DATA.map(a => (
          <RowCard
            key={a.name}
            href={a.href}
            emoji={a.emoji}
            title={a.name}
            sub={`${a.loc} · ★ ${a.rating}`}
            right={a.price}
          />
        ))}
      </div>
      <div className="px-5 py-4">
        <Link href="/attractions"
          className="flex items-center justify-center gap-2 w-full bg-[#2534ff] hover:bg-[#1a27e0] text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
          Browse all attractions <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function ComingSoonPanel({ emoji, title, desc, href, cta }: { emoji: string; title: string; desc: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[340px] px-10 text-center gap-5">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center text-4xl">{emoji}</div>
      <div>
        <p className="font-extrabold text-gray-900 text-xl mb-2">{title}</p>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">{desc}</p>
      </div>
      <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Coming Soon</span>
      {href && cta && (
        <Link href={href}
          className="flex items-center gap-2 bg-[#2534ff] hover:bg-[#1a27e0] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
          {cta} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function RewardsPanel() {
  return (
    <div>
      <PanelHeader title="Werest Rewards" href="/account?tab=rewards" cta="My rewards" />

      {/* Earn rates */}
      <div className="px-5 py-4 border-b border-gray-50">
        <p className="text-xs text-gray-500 mb-3">Earn points on every booking and unlock exclusive perks.</p>
        <div className="flex gap-3">
          {[
            { emoji: '🚗', label: 'Transfer',    pts: '+100 pts' },
            { emoji: '🎟️', label: 'Attraction',  pts: '+50 pts'  },
            { emoji: '⭐', label: 'Review',      pts: '+25 pts'  },
            { emoji: '🎁', label: 'First booking', pts: '+200 pts' },
          ].map(e => (
            <div key={e.label} className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-lg">{e.emoji}</p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{e.label}</p>
              <p className="text-xs font-extrabold text-[#2534ff] mt-0.5">{e.pts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tier ladder */}
      <div className="divide-y divide-gray-50">
        {TIER_ROWS.map(t => (
          <div key={t.label} className="flex items-center gap-3 px-5 py-2.5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${t.g} flex items-center justify-center text-base shrink-0`}>
              {t.emoji}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{t.label}</p>
              <p className="text-xs text-gray-400">{t.pts}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4">
        <Link href="/auth/register"
          className="flex items-center justify-center gap-2 w-full bg-[#2534ff] hover:bg-[#1a27e0] text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
          Join & start earning <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function HomeSideTabs() {
  const [active, setActive] = useState<SideTabId>('transfers');

  const allTabs = GROUPS.flat();
  const activeTab = allTabs.find(t => t.id === active)!;

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-8">
          <p className="text-[#2534ff] text-sm font-semibold uppercase tracking-widest mb-2">
            Everything you need
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            What are you looking for?
          </h2>
        </div>

        {/* ── Card wrapper ── */}
        <div className="flex rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white min-h-[420px]">

          {/* ── Left sidebar ── */}
          <nav className="w-52 shrink-0 border-r border-gray-100 flex flex-col bg-white py-2">
            {GROUPS.map((group, gi) => (
              <div key={gi}>
                {/* group separator */}
                {gi > 0 && <div className="my-2 mx-4 border-t border-gray-100" />}

                {group.map(tab => {
                  const isActive = active === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActive(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 relative ${
                        isActive
                          ? 'text-[#2534ff] bg-blue-50/60'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {/* active left accent */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#2534ff]" />
                      )}

                      {/* icon */}
                      <span className={`shrink-0 transition-colors ${isActive ? 'text-[#2534ff]' : 'text-gray-400'}`}>
                        {tab.icon}
                      </span>

                      {/* label */}
                      <span className="text-sm font-medium leading-tight flex-1">{tab.label}</span>

                      {/* badge */}
                      {tab.badge && (
                        <span className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded-full leading-none shrink-0 ${tab.badgeColor ?? 'bg-gray-400'}`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* ── Right content panel ── */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {active === 'transfers'    && <TransfersPanel />}
            {active === 'tours'        && <ToursPanel />}
            {active === 'attractions'  && <AttractionsPanel />}
            {active === 'dinner-cruise' && (
              <ComingSoonPanel
                emoji="🚢"
                title="Dinner Cruise"
                desc="Romantic sunset dinner cruises along Bangkok's Chao Phraya River and Phuket's Andaman Sea. Booking opens soon."
              />
            )}
            {active === 'group-tours' && (
              <ComingSoonPanel
                emoji="🧳"
                title="Group Tours"
                desc="Curated group packages across Thailand. Explore temples, beaches, and national parks with expert guides."
                href="/tours"
                cta="Browse tours"
              />
            )}
            {active === 'rewards' && <RewardsPanel />}
          </div>
        </div>
      </div>
    </section>
  );
}
