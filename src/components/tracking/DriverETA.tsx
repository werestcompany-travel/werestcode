'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ETAData {
  etaMinutes: number | null;
  etaText?:   string;
  driverLat?: number;
  driverLng?: number;
  updatedAt?: string;
}

interface DriverETAProps {
  bookingId:      string;
  pickupAddress:  string;
}

const POLL_INTERVAL_MS = 30_000;

export default function DriverETA({ bookingId, pickupAddress }: DriverETAProps) {
  const [eta,       setEta]       = useState<ETAData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchETA = useCallback(async () => {
    try {
      const res  = await fetch(`/api/bookings/${bookingId}/eta`);
      const json = await res.json() as { success: boolean } & ETAData;
      if (json.success) {
        setEta({ etaMinutes: json.etaMinutes, etaText: json.etaText, updatedAt: json.updatedAt });
        setLastFetch(new Date());
      }
    } catch {
      // Silently retain last known state on network error
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchETA();
    pollRef.current = setInterval(fetchETA, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchETA]);

  // Skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
        <div className="h-8 w-56 bg-gray-100 rounded mb-2" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
    );
  }

  const { etaMinutes, etaText, updatedAt } = eta ?? {};

  // Driver location unavailable
  if (etaMinutes === null || etaMinutes === undefined) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <span className="text-base">🚗</span>
          Driver location unavailable
        </p>
        {pickupAddress && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            Pickup: {pickupAddress}
          </p>
        )}
      </div>
    );
  }

  const isNearby   = etaMinutes <= 10;
  const isArriving = etaMinutes <= 3;

  // Compute seconds-ago for last-updated label
  const secsAgo = lastFetch
    ? Math.max(0, Math.round((Date.now() - lastFetch.getTime()) / 1000))
    : updatedAt
    ? Math.round((Date.now() - new Date(updatedAt).getTime()) / 1000)
    : null;

  const updatedLabel =
    secsAgo === null
      ? ''
      : secsAgo < 10
      ? 'just now'
      : `${secsAgo}s ago`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* Header strip */}
      <div
        className={`px-5 py-3 flex items-center gap-3 ${
          isArriving
            ? 'bg-green-50 border-b border-green-100'
            : isNearby
            ? 'bg-brand-50 border-b border-brand-100'
            : 'bg-gray-50 border-b border-gray-100'
        }`}
      >
        <span className="text-lg">🚗</span>
        <p
          className={`text-sm font-semibold ${
            isArriving ? 'text-green-800' : isNearby ? 'text-brand-800' : 'text-gray-700'
          }`}
        >
          {isArriving
            ? 'Your driver is arriving now!'
            : 'Your driver is on the way'}
        </p>
        {/* Live pulse badge */}
        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* ETA display */}
      <div className="px-5 py-5">
        <p className="text-4xl font-black text-gray-900 tabular-nums leading-none">
          {etaText ?? `${etaMinutes} min`}
          <span className="text-sm font-medium text-gray-400 ml-2">away</span>
        </p>

        {/* Progress bar — only show when ≤ 10 minutes */}
        {isNearby && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-1000"
                style={{
                  width: `${Math.max(5, Math.round(((10 - etaMinutes) / 10) * 100))}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {etaMinutes <= 1 ? 'Arriving any moment' : `${etaMinutes} minutes until pickup`}
            </p>
          </div>
        )}

        {/* Updated timestamp */}
        {updatedLabel && (
          <p className="text-xs text-gray-400 mt-3">
            Live location updated {updatedLabel}
          </p>
        )}
      </div>
    </div>
  );
}
