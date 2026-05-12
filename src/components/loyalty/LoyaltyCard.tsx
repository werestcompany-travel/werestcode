'use client';

import { useEffect, useState } from 'react';
import { TierLevel } from '@prisma/client';
import { ChevronRight, Star, Gift, Zap } from 'lucide-react';

interface TxItem {
  id: string;
  points: number;
  type: string;
  description: string;
  bookingRef: string | null;
  createdAt: string;
}

interface LoyaltyData {
  points: number;
  tier: TierLevel;
  tierMeta:  { label: string; gradient: string; emoji: string; perks: string[] };
  nextTier:  TierLevel | null;
  nextTierMeta: { label: string; emoji: string } | null;
  needed:    number;
  progress:  number;
  thresholds: Record<string, number>;
  transactions: TxItem[];
}

const TX_ICONS: Record<string, React.ReactNode> = {
  BOOKING_EARN:    <Zap className="w-3.5 h-3.5 text-blue-500" />,
  ATTRACTION_EARN: <Star className="w-3.5 h-3.5 text-amber-500" />,
  REVIEW_EARN:     <Star className="w-3.5 h-3.5 text-emerald-500" />,
  BONUS:           <Gift className="w-3.5 h-3.5 text-purple-500" />,
  REDEEM:          <ChevronRight className="w-3.5 h-3.5 text-red-500" />,
};

export default function LoyaltyCard() {
  const [data,    setData]    = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/loyalty')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-52 bg-gray-200 rounded-3xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!data || 'error' in data) return null;

  const { points, tierMeta, nextTierMeta, needed, progress, transactions } = data;

  return (
    <div className="space-y-6">

      {/* ── Tier card ── */}
      <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${tierMeta.gradient} text-white p-6 shadow-lg`}>
        {/* background decoration */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-4 right-6 text-6xl opacity-20 select-none">{tierMeta.emoji}</div>

        <div className="relative z-10">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Werest Rewards</p>
          <h2 className="text-2xl font-extrabold mb-0.5">{tierMeta.label}</h2>
          <p className="text-white/80 text-sm">Member since joining Werest Travel</p>

          {/* Points balance */}
          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-extrabold leading-none">{points.toLocaleString()}</span>
            <span className="text-white/70 text-sm pb-1">points</span>
          </div>

          {/* Progress to next tier */}
          {nextTierMeta ? (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/80 mb-1.5">
                <span className="font-semibold">{tierMeta.label}</span>
                <span className="font-semibold">{nextTierMeta.emoji} {nextTierMeta.label}</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/70 text-xs mt-1.5">
                {needed.toLocaleString()} more points to {nextTierMeta.label}
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-full" />
              </div>
              <p className="text-white/70 text-xs mt-1.5">You've reached the top tier! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Perks ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="w-4 h-4 text-brand-500" /> {tierMeta.label} Benefits
        </h3>
        <ul className="space-y-2.5">
          {tierMeta.perks.map(perk => (
            <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* ── How to earn ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-extrabold text-gray-900 mb-4">How to earn points</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🚗', label: 'Transfer Booking', pts: '+100 pts' },
            { emoji: '🎟️', label: 'Attraction Ticket', pts: '+50 pts'  },
            { emoji: '⭐', label: 'Write a Review',   pts: '+25 pts'  },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1.5">{item.emoji}</div>
              <p className="text-[11px] text-gray-500 leading-tight mb-1">{item.label}</p>
              <p className="text-sm font-extrabold text-[#2534ff]">{item.pts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tier ladder ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-extrabold text-gray-900 mb-4">Tier ladder</h3>
        <div className="space-y-2">
          {[
            { tier: 'EXPLORER',   label: 'Explorer',   emoji: '🌍', min: 0,    max: 999,  gradient: 'from-amber-400 to-orange-500'   },
            { tier: 'ADVENTURER', label: 'Adventurer', emoji: '🧭', min: 1000, max: 2999, gradient: 'from-slate-400 to-slate-600'     },
            { tier: 'NAVIGATOR',  label: 'Navigator',  emoji: '⭐', min: 3000, max: 7999, gradient: 'from-yellow-400 to-amber-500'    },
            { tier: 'VOYAGER',    label: 'Voyager',    emoji: '💎', min: 8000, max: null, gradient: 'from-indigo-500 to-purple-600'   },
          ].map(row => {
            const isCurrent = data.tier === row.tier;
            return (
              <div key={row.tier}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${isCurrent ? 'bg-brand-50 border-2 border-brand-200' : 'bg-gray-50'}`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${row.gradient} flex items-center justify-center text-lg shrink-0`}>
                  {row.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{row.label}</p>
                  <p className="text-xs text-gray-400">
                    {row.max ? `${row.min.toLocaleString()} – ${row.max.toLocaleString()} pts` : `${row.min.toLocaleString()}+ pts`}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full shrink-0">Current</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Transaction history ── */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-extrabold text-gray-900 mb-4">Points history</h3>
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  {TX_ICONS[tx.type] ?? <Star className="w-3.5 h-3.5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {tx.bookingRef && ` · ${tx.bookingRef}`}
                  </p>
                </div>
                <span className={`text-sm font-extrabold shrink-0 ${tx.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
