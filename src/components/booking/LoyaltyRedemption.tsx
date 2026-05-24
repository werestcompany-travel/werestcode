'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type TierLevel = 'EXPLORER' | 'ADVENTURER' | 'NAVIGATOR' | 'VOYAGER';

interface UserLoyalty {
  loyaltyPoints: number;
  tierLevel: TierLevel;
}

interface LoyaltyRedemptionProps {
  orderTotal:  number;
  onApplied:   (discount: number, points: number) => void;
  onRemoved:   () => void;
}

// ─── Tier display config ──────────────────────────────────────────────────────

const TIER_CONFIG: Record<TierLevel, { label: string; color: string; bg: string; multiplier: number }> = {
  EXPLORER:   { label: 'Explorer',   color: 'text-gray-600',   bg: 'bg-gray-100',   multiplier: 1   },
  ADVENTURER: { label: 'Adventurer', color: 'text-blue-700',   bg: 'bg-blue-100',   multiplier: 1.2 },
  NAVIGATOR:  { label: 'Navigator',  color: 'text-purple-700', bg: 'bg-purple-100', multiplier: 1.5 },
  VOYAGER:    { label: 'Voyager',    color: 'text-amber-700',  bg: 'bg-amber-100',  multiplier: 2   },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoyaltyRedemption({ orderTotal, onApplied, onRemoved }: LoyaltyRedemptionProps) {
  const [userData,    setUserData]    = useState<UserLoyalty | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [pointsInput, setPointsInput] = useState<number>(0);
  const [applying,    setApplying]    = useState(false);
  const [error,       setError]       = useState('');
  const [applied,     setApplied]     = useState(false);
  const [appliedPts,  setAppliedPts]  = useState(0);

  // Fetch the current user's loyalty data on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) { setLoadingUser(false); return; }
        const json = await res.json();
        if (json.user?.loyaltyPoints !== undefined) {
          setUserData({ loyaltyPoints: json.user.loyaltyPoints, tierLevel: json.user.tierLevel });
        }
      } catch {
        // Not logged in — silently hide the component
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // Derived limits
  const maxByPercent = Math.floor(orderTotal * 0.2);
  const maxRedeemable = userData ? Math.min(userData.loyaltyPoints, maxByPercent) : 0;
  const minRedeemable = 100;

  // Clamp the slider value when orderTotal changes
  useEffect(() => {
    if (pointsInput > maxRedeemable) setPointsInput(maxRedeemable);
  }, [orderTotal, maxRedeemable, pointsInput]);

  const newTotal = Math.max(0, orderTotal - pointsInput);

  const handleApply = useCallback(async () => {
    if (!userData || pointsInput < minRedeemable) return;
    setError('');
    setApplying(true);
    try {
      const res = await fetch('/api/user/loyalty/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsToRedeem: pointsInput, orderTotal }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Could not apply points.');
        return;
      }
      setApplied(true);
      setAppliedPts(pointsInput);
      onApplied(json.discountAmount, pointsInput);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setApplying(false);
    }
  }, [userData, pointsInput, orderTotal, onApplied]);

  const handleRemove = () => {
    setApplied(false);
    setAppliedPts(0);
    setPointsInput(0);
    setError('');
    onRemoved();
  };

  // Don't render while loading, or if user is not logged in / has no points
  if (loadingUser) return null;
  if (!userData)   return null;
  if (userData.loyaltyPoints === 0) return null;

  const tier = TIER_CONFIG[userData.tierLevel] ?? TIER_CONFIG.EXPLORER;
  const canApply = pointsInput >= minRedeemable && pointsInput <= maxRedeemable;

  // ── Applied state ────────────────────────────────────────────────────────────
  if (applied) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">💎</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {appliedPts.toLocaleString()} pts applied&nbsp;
                <span className="font-bold text-green-700">−{formatCurrency(appliedPts)}</span>
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Remaining: {(userData.loyaltyPoints - appliedPts).toLocaleString()} pts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-amber-500 hover:text-amber-700 transition-colors ml-2 shrink-0"
            aria-label="Remove loyalty discount"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Input state ──────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-3">

      {/* Header row: icon + tier badge + balance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💎</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 leading-tight">
              Loyalty Points
            </p>
            <p className="text-xs text-amber-600">
              {userData.loyaltyPoints.toLocaleString()} pts available (worth {formatCurrency(userData.loyaltyPoints)})
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tier.bg} ${tier.color} shrink-0 uppercase tracking-wide`}>
          {tier.label}
        </span>
      </div>

      {/* Slider */}
      {maxRedeemable >= minRedeemable ? (
        <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-amber-700">
              <span>How many points to redeem?</span>
              <span className="font-bold">{pointsInput.toLocaleString()} pts</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxRedeemable}
              step={100}
              value={pointsInput}
              onChange={(e) => { setError(''); setPointsInput(Number(e.target.value)); }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-amber-500">
              <span>0 pts</span>
              <span>{maxRedeemable.toLocaleString()} pts max (20% of order)</span>
            </div>
          </div>

          {/* Number input alternative */}
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={maxRedeemable}
              step={100}
              value={pointsInput || ''}
              placeholder={`Min ${minRedeemable}`}
              onChange={(e) => {
                setError('');
                const v = Math.min(Math.max(0, parseInt(e.target.value) || 0), maxRedeemable);
                setPointsInput(v);
              }}
              className="flex-1 px-3 py-2 text-sm border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={!canApply || applying}
              className="shrink-0 px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
            </button>
          </div>

          {/* Real-time preview */}
          {pointsInput >= minRedeemable && (
            <div className="bg-white border border-amber-100 rounded-lg px-3 py-2 text-xs text-gray-700">
              Redeeming{' '}
              <span className="font-semibold text-amber-700">{pointsInput.toLocaleString()} pts</span>
              {' '}= <span className="font-semibold text-green-600">−{formatCurrency(pointsInput)}</span>
              {' '}off → New total:{' '}
              <span className="font-bold text-gray-900">{formatCurrency(newTotal)}</span>
            </div>
          )}

          {error && <p className="text-xs text-red-600 pl-0.5">{error}</p>}

          <p className="text-[10px] text-amber-500 leading-snug">
            Min {minRedeemable} pts · Max 20% of order ({formatCurrency(maxByPercent)}) ·
            Earn {tier.multiplier}× points on this booking
          </p>
        </>
      ) : (
        <p className="text-xs text-amber-700">
          You need at least {minRedeemable} points to redeem, or the order minimum (฿{(minRedeemable / 0.2).toFixed(0)}) isn&apos;t met yet.
        </p>
      )}
    </div>
  );
}
