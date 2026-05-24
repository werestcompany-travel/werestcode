'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Car, MapPin, Ticket,
  Phone, MessageCircle, ExternalLink, Calendar,
} from 'lucide-react';

// Format date as YYYY-MM-DD in local time
function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:          'bg-amber-100 text-amber-800',
  DRIVER_CONFIRMED: 'bg-blue-100 text-blue-800',
  DRIVER_STANDBY:   'bg-indigo-100 text-indigo-800',
  DRIVER_PICKED_UP: 'bg-violet-100 text-violet-800',
  COMPLETED:        'bg-green-100 text-green-800',
  CANCELLED:        'bg-red-100 text-red-800',
  CONFIRMED:        'bg-green-100 text-green-800',
};

const TYPE_CONFIG = {
  transfer:   {
    icon:  Car,
    color: 'bg-blue-500',
    light: 'bg-blue-50 border-blue-100',
    label: 'Transfer',
    href:  (id: string) => `/admin/transfers?id=${id}`,
  },
  tour:       {
    icon:  MapPin,
    color: 'bg-emerald-500',
    light: 'bg-emerald-50 border-emerald-100',
    label: 'Tour',
    href:  (id: string) => `/admin/tour-bookings?id=${id}`,
  },
  attraction: {
    icon:  Ticket,
    color: 'bg-violet-500',
    light: 'bg-violet-50 border-violet-100',
    label: 'Ticket',
    href:  (id: string) => `/admin/attraction-bookings?id=${id}`,
  },
};

interface CalendarItem {
  id: string;
  bookingRef: string;
  time: string | null;
  type: 'transfer' | 'tour' | 'attraction';
  title: string;
  customerName: string;
  customerPhone: string;
  status: string;
  detail: string;
  totalPrice: number;
  driverName?: string | null;
  pax?: number;
}

export default function AdminCalendarPage() {
  const [date,    setDate]    = useState(new Date());
  const [items,   setItems]   = useState<CalendarItem[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (d: Date) => {
    setLoading(true);
    try {
      const r    = await fetch(`/api/admin/calendar?date=${toYMD(d)}`);
      const data = await r.json();
      setItems(data.items ?? []);
      setRevenue(data.totalRevenue ?? 0);
    } catch {
      setItems([]);
      setRevenue(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(date); }, [date, load]);

  function changeDay(delta: number) {
    setDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  }

  const transfers   = items.filter(i => i.type === 'transfer').length;
  const tours       = items.filter(i => i.type === 'tour').length;
  const attractions = items.filter(i => i.type === 'attraction').length;
  const isToday     = toYMD(date) === toYMD(new Date());

  return (
    <AdminShell title="Booking Calendar">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Date navigator */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3">
          <button
            onClick={() => changeDay(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{formatDisplayDate(date)}</p>
            {isToday && (
              <span className="text-xs text-[#2534ff] font-semibold">Today</span>
            )}
          </div>
          <button
            onClick={() => changeDay(1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Jump to today */}
        {!isToday && (
          <div className="text-center">
            <button
              onClick={() => setDate(new Date())}
              className="text-xs text-[#2534ff] font-semibold hover:underline flex items-center gap-1 mx-auto"
            >
              <Calendar className="w-3 h-3" /> Jump to today
            </button>
          </div>
        )}

        {/* Summary bar */}
        {!loading && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Transfers',   count: transfers,                       color: 'text-blue-600' },
              { label: 'Tours',       count: tours,                           color: 'text-emerald-600' },
              { label: 'Attractions', count: attractions,                     color: 'text-violet-600' },
              { label: 'Revenue',     count: `฿${revenue.toLocaleString()}`,  color: 'text-gray-900' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className={`text-lg font-extrabold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Booking list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-48" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🌴</div>
            <p className="text-lg font-bold text-gray-900 mb-1">No bookings for this day</p>
            <p className="text-sm text-gray-400">Enjoy the day off!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const cfg    = TYPE_CONFIG[item.type];
              const Icon   = cfg.icon;
              const waLink = `https://wa.me/${item.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hi ${item.customerName.split(' ')[0]}, this is Werest Travel regarding your booking ${item.bookingRef}.`,
              )}`;
              const callLink = `tel:${item.customerPhone}`;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 flex gap-4 hover:shadow-sm transition-shadow ${cfg.light}`}
                >
                  {/* Time + icon */}
                  <div className="flex flex-col items-center gap-2 shrink-0 w-14">
                    <span className="text-xs font-bold text-gray-500 text-center leading-tight">
                      {item.time ?? 'All Day'}
                    </span>
                    <div className={`w-9 h-9 rounded-xl ${cfg.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-gray-400">{item.bookingRef}</span>
                        <p className="text-sm font-bold text-gray-900 truncate">{item.customerName}</p>
                        <p className="text-xs text-gray-600 truncate">{item.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">฿{item.totalPrice.toLocaleString()}</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[item.status] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{item.detail}</span>
                      {item.driverName && (
                        <span className="text-xs text-blue-600 font-medium">🚗 {item.driverName}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <a
                      href={callLink}
                      className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Call customer"
                    >
                      <Phone className="w-3.5 h-3.5 text-gray-600" />
                    </a>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      title="WhatsApp customer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                    </a>
                    <Link
                      href={cfg.href(item.id)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View booking"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
