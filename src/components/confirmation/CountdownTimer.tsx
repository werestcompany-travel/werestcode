'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  pickupDate: string;
  pickupTime: string;
}

function parseTripDate(date: string, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

export default function CountdownTimer({ pickupDate, pickupTime }: Props) {
  const tripDate = parseTripDate(pickupDate, pickupTime);
  const [diff, setDiff] = useState(tripDate.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setDiff(tripDate.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [tripDate]);

  if (diff <= 0) {
    return (
      <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm">
        <Clock className="w-4 h-4" /> Trip time has arrived!
      </div>
    );
  }

  const totalSec = Math.floor(diff / 1000);
  const days  = Math.floor(totalSec / 86400);
  const hrs   = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  const units = days > 0
    ? [{ label: 'days', value: days }, { label: 'hrs', value: hrs }, { label: 'min', value: mins }]
    : [{ label: 'hrs', value: hrs }, { label: 'min', value: mins }, { label: 'sec', value: secs }];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-3">Trip starts in</p>
      <div className="flex items-center justify-center gap-3">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-3">
            <div className="text-center">
              <div className="bg-[#2534ff] text-white font-black text-2xl sm:text-3xl rounded-xl px-4 py-3 min-w-[64px] tabular-nums leading-none">
                {pad(u.value)}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 font-semibold uppercase tracking-wider">{u.label}</p>
            </div>
            {i < units.length - 1 && (
              <span className="text-2xl font-black text-gray-300 mb-5">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
