'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface PickupCountdownProps {
  pickupDate: string; // ISO date string
  pickupTime: string; // "HH:MM"
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function computeTimeLeft(pickupDate: string, pickupTime: string): TimeLeft {
  const [hours, minutes] = pickupTime.split(':').map(Number);
  const pickup = new Date(pickupDate);
  pickup.setHours(hours, minutes, 0, 0);
  const diff = pickup.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: diff };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    totalMs: diff,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function PickupCountdown({ pickupDate, pickupTime }: PickupCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    computeTimeLeft(pickupDate, pickupTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(pickupDate, pickupTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [pickupDate, pickupTime]);

  if (timeLeft.totalMs <= 0) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-sm font-semibold text-green-800">
          Trip completed — we hope you had a great time!
        </p>
      </div>
    );
  }

  const isWithin24h = timeLeft.totalMs <= 24 * 60 * 60 * 1000;

  return (
    <div
      className={`rounded-2xl border p-5 mb-6 ${
        isWithin24h
          ? 'bg-red-50 border-red-100'
          : 'bg-blue-50 border-blue-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className={`w-4 h-4 ${isWithin24h ? 'text-red-600' : 'text-[#2534ff]'}`} />
        <span className={`text-xs font-bold uppercase tracking-wide ${isWithin24h ? 'text-red-700' : 'text-[#2534ff]'}`}>
          {isWithin24h ? 'Your ride is TOMORROW!' : 'Countdown to Pickup'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {[
          { value: timeLeft.days,    label: 'Days' },
          { value: timeLeft.hours,   label: 'Hours' },
          { value: timeLeft.minutes, label: 'Minutes' },
          { value: timeLeft.seconds, label: 'Seconds' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center flex-1">
            <div
              className={`text-2xl sm:text-3xl font-black tabular-nums ${
                isWithin24h ? 'text-red-700' : 'text-[#2534ff]'
              }`}
            >
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Your pickup is in{' '}
        {timeLeft.days > 0 ? `${timeLeft.days} day${timeLeft.days !== 1 ? 's' : ''}, ` : ''}
        {timeLeft.hours > 0 ? `${timeLeft.hours} hour${timeLeft.hours !== 1 ? 's' : ''}, ` : ''}
        {timeLeft.minutes} minute{timeLeft.minutes !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
