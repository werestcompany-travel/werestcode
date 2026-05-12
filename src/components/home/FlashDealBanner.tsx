'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Flame } from 'lucide-react';

interface ActiveDeal {
  code: string;
  type: string;
  value: number;
  expiresAt: string;
  description?: string | null;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

const DISMISS_KEY = 'werest_flash_deal_dismissed';

export default function FlashDealBanner() {
  const [deals, setDeals]     = useState<ActiveDeal[]>([]);
  const [idx, setIdx]         = useState(0);
  const [dismissed, setDismissed] = useState(true); // start hidden, reveal after check
  const [countdown, setCountdown] = useState('');

  /* Fetch active deals */
  useEffect(() => {
    const session = sessionStorage.getItem(DISMISS_KEY);
    if (session) { setDismissed(true); return; }
    setDismissed(false);

    fetch('/api/discount-codes/active')
      .then((r) => r.json())
      .then((d) => setDeals(d.codes ?? []))
      .catch(() => {});
  }, []);

  /* Cycle through deals every 5 s */
  useEffect(() => {
    if (deals.length < 2) return;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % deals.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [deals.length]);

  /* Countdown timer */
  useEffect(() => {
    if (!deals[idx]) return;
    const tick = () => {
      const remaining = new Date(deals[idx].expiresAt).getTime() - Date.now();
      setCountdown(formatCountdown(remaining));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deals, idx]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }, []);

  if (dismissed || deals.length === 0) return null;

  const deal = deals[idx];
  const discountLabel =
    deal.type === 'PERCENTAGE'
      ? `${deal.value}% off`
      : `฿${deal.value.toLocaleString()} off`;

  return (
    <div className="relative z-50 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium">
        <Flame className="w-4 h-4 shrink-0 text-white/90" />
        <span>
          Flash Deal: Use code{' '}
          <strong className="font-black tracking-wide bg-white/20 px-1.5 py-0.5 rounded">
            {deal.code}
          </strong>{' '}
          for <strong>{discountLabel}</strong>
          {deal.description ? ` — ${deal.description}` : ''} — ends in{' '}
          <strong className="font-mono">{countdown}</strong>
        </span>

        {/* Dot indicators for multiple deals */}
        {deals.length > 1 && (
          <div className="hidden sm:flex items-center gap-1">
            {deals.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === idx ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Deal ${i + 1}`}
              />
            ))}
          </div>
        )}

        <button
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
