'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, Check, Loader2, MapPin, X } from 'lucide-react';

interface SaveRouteButtonProps {
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  vehicleType?: string;
}

type State = 'idle' | 'open' | 'loading' | 'saved' | 'unauthed' | 'error';

export default function SaveRouteButton({
  pickupAddress,
  dropoffAddress,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  vehicleType,
}: SaveRouteButtonProps) {
  const [state, setState] = useState<State>('idle');
  const [label, setLabel] = useState(
    `${pickupAddress.split(',')[0]} → ${dropoffAddress.split(',')[0]}`,
  );
  const [errorMsg, setErrorMsg] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (state !== 'open') return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setState('idle');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [state]);

  async function handleButtonClick() {
    if (state === 'saved') return;
    setState('open');
  }

  async function handleSave() {
    if (!label.trim()) return;
    setState('loading');
    try {
      const res = await fetch('/api/user/saved-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          pickupAddress,
          pickupLat,
          pickupLng,
          dropoffAddress,
          dropoffLat,
          dropoffLng,
          vehicleType,
        }),
      });

      if (res.status === 401) {
        setState('unauthed');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? 'Failed to save route');
        setState('error');
        return;
      }

      setState('saved');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
    }
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger button */}
      <button
        onClick={handleButtonClick}
        disabled={state === 'loading' || state === 'saved'}
        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border ${
          state === 'saved'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-white border-gray-200 text-gray-600 hover:border-[#2534ff] hover:text-[#2534ff]'
        }`}
      >
        {state === 'loading' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : state === 'saved' ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Heart className="w-3.5 h-3.5" />
        )}
        {state === 'saved' ? 'Route saved!' : 'Save this route'}
      </button>

      {/* Popover */}
      {(state === 'open' || state === 'error' || state === 'unauthed') && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
              <p className="text-sm font-semibold text-gray-900">Save this route</p>
            </div>
            <button onClick={() => setState('idle')} className="text-gray-400 hover:text-gray-600 p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          {state === 'unauthed' ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-600 mb-3">Log in to save routes to your account</p>
              <a
                href="/auth/login"
                className="inline-flex items-center justify-center w-full bg-[#2534ff] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log in
              </a>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-2">Give this route a label</p>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                placeholder="e.g. Home → Suvarnabhumi Airport"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] mb-3"
                autoFocus
              />
              {state === 'error' && (
                <p className="text-xs text-red-600 mb-2">{errorMsg}</p>
              )}
              <button
                onClick={handleSave}
                disabled={!label.trim()}
                className="w-full bg-[#2534ff] text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save route
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
