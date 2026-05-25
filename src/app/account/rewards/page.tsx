'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ChevronLeft, ChevronRight, Star, Award, Zap, Gift,
  Car, MapPin, Tag, Check, Lock, TrendingUp,
} from 'lucide-react';

// ─── Tier data ────────────────────────────────────────────────────────────────

const TIERS = [
  {
    key:      'EXPLORER',
    label:    'Explorer',
    icon:     '🌱',
    min:      0,
    color:    'from-emerald-400 to-emerald-600',
    cardBg:   'bg-emerald-500',
    textColor:'text-emerald-600',
    bgLight:  'bg-emerald-50',
    ring:     'ring-emerald-400',
    benefits: [
      'Access to all tours & transfers',
      'Earn 1 pt per ฿10 spent',
      'Member-only flash deals',
    ],
  },
  {
    key:      'ADVENTURER',
    label:    'Adventurer',
    icon:     '🏔️',
    min:      500,
    color:    'from-blue-400 to-blue-600',
    cardBg:   'bg-blue-500',
    textColor:'text-blue-600',
    bgLight:  'bg-blue-50',
    ring:     'ring-blue-400',
    benefits: [
      'Priority customer support',
      '5% discount on all bookings',
      'Early access to new experiences',
      'Earn 1.2 pts per ฿10 spent',
    ],
  },
  {
    key:      'NAVIGATOR',
    label:    'Navigator',
    icon:     '🧭',
    min:      1500,
    color:    'from-violet-400 to-violet-600',
    cardBg:   'bg-violet-500',
    textColor:'text-violet-600',
    bgLight:  'bg-violet-50',
    ring:     'ring-violet-400',
    benefits: [
      'Dedicated trip coordinator',
      '10% discount on all bookings',
      'Free seat upgrade when available',
      'Earn 1.5 pts per ฿10 spent',
    ],
  },
  {
    key:      'VOYAGER',
    label:    'Voyager',
    icon:     '⛵',
    min:      5000,
    color:    'from-amber-400 to-orange-500',
    cardBg:   'bg-amber-500',
    textColor:'text-amber-600',
    bgLight:  'bg-amber-50',
    ring:     'ring-amber-400',
    benefits: [
      'VIP concierge service 24/7',
      '15% discount on all bookings',
      'One free airport transfer per year',
      'Earn 2 pts per ฿10 spent',
      'Exclusive Voyager-only events',
    ],
  },
];

// ─── Ways to earn ─────────────────────────────────────────────────────────────

const EARN_WAYS = [
  { icon: <Car   className="w-5 h-5" />,  title: 'Book a Transfer',   desc: 'Earn 1+ pt per ฿10 on private transfers',   pts: '60–200 pts'   },
  { icon: <MapPin className="w-5 h-5" />, title: 'Book a Tour',        desc: 'Earn pts on day trips, boat tours & more',   pts: '100–500 pts'  },
  { icon: <Tag   className="w-5 h-5" />,  title: 'Write a Review',     desc: 'Share your experience after a completed trip', pts: '50 pts'      },
  { icon: <Gift  className="w-5 h-5" />,  title: 'Refer a Friend',     desc: 'Your friend books → you earn ฿100 credit',   pts: '฿100 credit' },
  { icon: <Star  className="w-5 h-5" />,  title: 'Complete Your Profile', desc: 'Fill in phone number and travel prefs',   pts: '25 pts'      },
];

// ─── Redeem options ───────────────────────────────────────────────────────────

const REWARDS = [
  { title: '฿50 off your next booking',     pts: 250,   icon: '🎟️', unlocked: true  },
  { title: '฿100 off your next booking',    pts: 500,   icon: '💰', unlocked: true  },
  { title: 'Free airport transfer (sedan)', pts: 1200,  icon: '🚗', unlocked: false },
  { title: 'Exclusive tour upgrade',        pts: 2000,  icon: '🗺️', unlocked: false },
  { title: 'VIP private day trip',          pts: 5000,  icon: '⛵', unlocked: false },
];

// ─── User type ────────────────────────────────────────────────────────────────

interface UserInfo {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  tierLevel: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const router = useRouter();
  const [user,    setUser]    = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/auth/login'); return; }
      setUser(data.user);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2534ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentTierIdx = TIERS.findIndex(t => t.key === (user?.tierLevel ?? 'EXPLORER'));
  const currentTier    = TIERS[currentTierIdx] ?? TIERS[0];
  const nextTier       = TIERS[currentTierIdx + 1] ?? null;
  const points         = user?.loyaltyPoints ?? 0;
  const progressPct    = nextTier
    ? Math.min(100, Math.round(((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100))
    : 100;
  const ptsToNext = nextTier ? Math.max(0, nextTier.min - points) : 0;

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-[#f5f5f5]">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/account" className="flex items-center gap-1 hover:text-[#2534ff] transition-colors">
              <ChevronLeft className="w-4 h-4" /> My Account
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Werest Rewards</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* ── Hero card ─────────────────────────────────────────────────── */}
          <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${currentTier.color} text-white shadow-xl`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white" />
              <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-white" />
            </div>

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                {/* Left: tier + points */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-white/70" />
                    <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">Werest Rewards</span>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Welcome back, {user?.name?.split(' ')[0]}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-black">{points.toLocaleString()}</span>
                    <span className="text-xl font-semibold text-white/70">points</span>
                  </div>
                  {/* Tier badge */}
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-xl">{currentTier.icon}</span>
                    <span className="font-extrabold text-lg">{currentTier.label}</span>
                    <span className="text-white/70 text-sm">Member</span>
                  </div>
                </div>

                {/* Right: card visual */}
                <div className="shrink-0 hidden sm:block">
                  <div className="w-48 h-28 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4 flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Rewards Card</span>
                      <span className="text-lg">{currentTier.icon}</span>
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-sm">{user?.name}</p>
                      <p className="text-xs text-white/60 font-mono">{user?.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {nextTier && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-white/90">{currentTier.icon} {currentTier.label}</span>
                    <span className="font-semibold text-white/90">{nextTier.icon} {nextTier.label}</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-white/75 text-xs mt-2">
                    {ptsToNext.toLocaleString()} more points to reach <strong className="text-white">{nextTier.label}</strong>
                  </p>
                </div>
              )}
              {!nextTier && (
                <div className="mt-4 bg-white/15 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
                  🏆 You&apos;ve reached the highest tier — enjoy your VIP benefits!
                </div>
              )}
            </div>
          </div>

          {/* ── Tier progress track ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-6">Your tier journey</h2>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 hidden sm:block" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-[#2534ff] to-blue-400 hidden sm:block transition-all duration-700"
                style={{ width: `${Math.min(100, (currentTierIdx / (TIERS.length - 1)) * 100)}%` }}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
                {TIERS.map((tier, i) => {
                  const isReached  = i <= currentTierIdx;
                  const isCurrent  = i === currentTierIdx;
                  return (
                    <div key={tier.key} className="flex flex-col items-center text-center gap-2">
                      {/* Dot */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg border-4 transition-all ${
                        isCurrent  ? `border-[#2534ff] bg-white shadow-lg shadow-blue-100` :
                        isReached  ? `border-[#2534ff] bg-[#2534ff]` :
                                     `border-gray-200 bg-white`
                      }`}>
                        {isReached && !isCurrent ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : isCurrent ? (
                          <span>{tier.icon}</span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isCurrent ? 'text-[#2534ff]' : isReached ? 'text-gray-700' : 'text-gray-400'}`}>
                          {tier.icon} {tier.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {tier.min === 0 ? 'Starting tier' : `${tier.min.toLocaleString()} pts`}
                        </p>
                        {isCurrent && (
                          <span className="inline-block text-[10px] font-bold text-[#2534ff] bg-blue-50 px-1.5 py-0.5 rounded-full mt-1">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Benefits grid ──────────────────────────────────────────────── */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Benefits by tier</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TIERS.map((tier, i) => {
                const isReached = i <= currentTierIdx;
                return (
                  <div
                    key={tier.key}
                    className={`rounded-2xl border p-5 transition-all ${
                      isReached ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/60 border-gray-100 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${tier.bgLight}`}>
                        {tier.icon}
                      </div>
                      <div>
                        <p className={`font-extrabold text-base ${isReached ? tier.textColor : 'text-gray-400'}`}>{tier.label}</p>
                        <p className="text-xs text-gray-400">{tier.min === 0 ? 'Starting tier' : `From ${tier.min.toLocaleString()} pts`}</p>
                      </div>
                      {i === currentTierIdx && (
                        <span className="ml-auto text-[10px] font-bold text-[#2534ff] bg-blue-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {tier.benefits.map((b, j) => (
                        <li key={j} className={`flex items-start gap-2 text-sm ${isReached ? 'text-gray-700' : 'text-gray-400'}`}>
                          <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isReached ? tier.textColor : 'text-gray-300'}`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Ways to earn ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-[#2534ff]" />
              <h2 className="font-bold text-gray-900">Ways to earn points</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EARN_WAYS.map((way, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[#2534ff] shrink-0 shadow-sm group-hover:border-blue-200">
                    {way.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{way.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{way.desc}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#2534ff] bg-blue-50 px-2 py-1 rounded-lg whitespace-nowrap">
                    {way.pts}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Rewards catalog ────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#2534ff]" />
                <h2 className="font-bold text-gray-900">Redeem your points</h2>
              </div>
              <span className="text-sm text-[#2534ff] font-semibold">{points.toLocaleString()} pts available</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {REWARDS.map((reward, i) => {
                const canRedeem = points >= reward.pts;
                return (
                  <div
                    key={i}
                    className={`bg-white rounded-xl border p-4 flex flex-col gap-3 transition-all ${
                      canRedeem ? 'border-gray-100 hover:shadow-md cursor-pointer' : 'border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{reward.title}</p>
                        <p className="text-xs text-[#2534ff] font-semibold mt-0.5">{reward.pts.toLocaleString()} pts</p>
                      </div>
                    </div>
                    <button
                      disabled={!canRedeem}
                      className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                        canRedeem
                          ? 'bg-[#2534ff] text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem ? 'Redeem' : `Need ${(reward.pts - points).toLocaleString()} more pts`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CTA ────────────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-[#2534ff] to-blue-500 rounded-2xl p-6 text-white text-center">
            <p className="text-xl font-extrabold mb-1">Ready to earn more?</p>
            <p className="text-blue-100 text-sm mb-5">Book your next transfer or tour to keep climbing the tiers</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/airport-transfers" className="bg-white text-[#2534ff] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2">
                <Car className="w-4 h-4" /> Book Transfer
              </Link>
              <Link href="/tours" className="bg-white/20 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Explore Tours
              </Link>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
