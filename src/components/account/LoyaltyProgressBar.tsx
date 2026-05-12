'use client';

import React from 'react';

interface LoyaltyProgressBarProps {
  points: number;
  tier: string;
}

const TIERS = [
  {
    key: 'EXPLORER',
    label: 'Explorer',
    icon: '🌱',
    min: 0,
    benefits: ['Basic customer support', 'Access to all tours'],
  },
  {
    key: 'ADVENTURER',
    label: 'Adventurer',
    icon: '🏔️',
    min: 500,
    benefits: ['Priority support', '5% discount on bookings'],
  },
  {
    key: 'NAVIGATOR',
    label: 'Navigator',
    icon: '🧭',
    min: 1500,
    benefits: ['Dedicated coordinator', '10% discount on bookings'],
  },
  {
    key: 'VOYAGER',
    label: 'Voyager',
    icon: '⛵',
    min: 5000,
    benefits: ['VIP concierge', '15% discount', 'Free airport pickup'],
  },
];

export default function LoyaltyProgressBar({ points, tier }: LoyaltyProgressBarProps) {
  const currentIdx = TIERS.findIndex(t => t.key === tier);
  const current = TIERS[currentIdx] ?? TIERS[0];
  const next = TIERS[currentIdx + 1];

  const progressPct = next
    ? Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100))
    : 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">Loyalty Status</h2>
        <span className="text-xs font-bold bg-[#2534ff]/10 text-[#2534ff] px-3 py-1 rounded-full">
          {points.toLocaleString()} pts
        </span>
      </div>

      {/* Current tier badge */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#2534ff]/10 flex items-center justify-center text-2xl">
          {current.icon}
        </div>
        <div>
          <p className="font-extrabold text-gray-900 text-lg">{current.label}</p>
          <p className="text-xs text-gray-400">Current tier</p>
        </div>
      </div>

      {/* Progress bar */}
      {next ? (
        <>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-semibold text-gray-700">{current.icon} {current.label}</span>
            <span className="font-semibold text-gray-700">{next.icon} {next.label}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2534ff] to-blue-400 transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">You are here ({points.toLocaleString()} pts)</span>
            <span className="font-semibold text-[#2534ff]">
              {(next.min - points).toLocaleString()} pts to {next.label}
            </span>
          </div>

          {/* Next tier benefits */}
          <div className="mt-4 bg-blue-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-700 mb-1.5">
              Benefits unlocked at {next.label}:
            </p>
            <p className="text-xs text-gray-600">
              {next.benefits.join(' · ')}
            </p>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs font-semibold text-amber-700 text-center">
          You have reached the highest tier! Enjoy your VIP benefits. ⛵
        </div>
      )}
    </div>
  );
}
