'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Phone, MessageCircle, CheckCircle2, RefreshCw, Clock } from 'lucide-react';

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const STATUS_CYCLE: Record<string, string[]> = {
  // For transfers
  PENDING:          ['DRIVER_CONFIRMED', 'CANCELLED'],
  DRIVER_CONFIRMED: ['DRIVER_STANDBY', 'CANCELLED'],
  DRIVER_STANDBY:   ['DRIVER_PICKED_UP'],
  DRIVER_PICKED_UP: ['COMPLETED'],
  COMPLETED:        [],
  CANCELLED:        [],
  // For tours/attractions
  CONFIRMED:        ['COMPLETED', 'CANCELLED'],
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending', DRIVER_CONFIRMED: 'Confirmed', DRIVER_STANDBY: 'Standby',
  DRIVER_PICKED_UP: 'En Route', COMPLETED: 'Done ✓', CANCELLED: 'Cancelled',
  CONFIRMED: 'Confirmed',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800', DRIVER_CONFIRMED: 'bg-blue-100 text-blue-800',
  DRIVER_STANDBY: 'bg-indigo-100 text-indigo-800', DRIVER_PICKED_UP: 'bg-brand-100 text-brand-800',
  COMPLETED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800',
  CONFIRMED: 'bg-green-100 text-green-800',
};

interface CalendarItem {
  id: string; bookingRef: string; time: string | null;
  type: 'transfer' | 'tour' | 'attraction';
  title: string; customerName: string; customerPhone: string;
  status: string; detail: string; totalPrice: number;
  driverName?: string | null;
}

export default function AdminTodayPage() {
  const [items, setItems]     = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/admin/calendar?date=${toYMD(new Date())}`);
    const d = await r.json();
    setItems(d.items ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(item: CalendarItem, newStatus: string) {
    setUpdating(item.id);
    const endpoint = item.type === 'transfer'
      ? `/api/bookings/${item.id}/status`
      : item.type === 'tour'
      ? `/api/admin/tour-bookings/${item.id}/status`
      : `/api/admin/attraction-bookings/${item.id}`;

    const body = item.type === 'attraction'
      ? JSON.stringify({ status: newStatus })
      : JSON.stringify({ status: newStatus, updatedBy: 'admin' });

    await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    await load();
    setUpdating(null);
  }

  const total = items.reduce((s, i) => s + i.totalPrice, 0);
  const done  = items.filter(i => i.status === 'COMPLETED').length;

  const TYPE_ICON: Record<string, string> = { transfer: '🚗', tour: '🗺️', attraction: '🎟️' };

  return (
    <AdminShell title="Today">
      <div className="max-w-lg mx-auto space-y-3">

        {/* Summary */}
        <div className="bg-[#2534ff] text-white rounded-2xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold">{items.length} bookings</p>
            <p className="text-sm text-white/70">{done} completed · ฿{total.toLocaleString()} total</p>
          </div>
          <button onClick={load} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse h-28" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">🌴</p>
            <p className="font-bold text-gray-900">No bookings today</p>
            <p className="text-sm text-gray-400 mt-1">Enjoy the day off!</p>
          </div>
        ) : (
          items.map(item => {
            const phone = item.customerPhone.replace(/\D/g, '');
            const waText = encodeURIComponent(`Hi ${item.customerName.split(' ')[0]}, this is Werest Travel regarding your booking ${item.bookingRef}.`);
            const nextStatuses = STATUS_CYCLE[item.status] ?? [];

            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{TYPE_ICON[item.type]}</span>
                    <div>
                      <p className="font-extrabold text-gray-900 text-sm leading-tight">{item.customerName}</p>
                      <p className="text-[10px] font-mono text-gray-400">{item.bookingRef}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.time && (
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-700 justify-end mb-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </div>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </div>
                </div>

                {/* Route/title */}
                <p className="text-xs text-gray-600 mb-1 truncate">{item.title}</p>
                {item.driverName && <p className="text-xs text-blue-600 font-medium mb-2">Driver: {item.driverName}</p>}

                {/* Actions row */}
                <div className="flex items-center gap-2 mt-3">
                  <a href={`tel:${phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-xs py-2.5 rounded-xl transition-colors">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a href={`https://wa.me/${phone}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold text-xs py-2.5 rounded-xl transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  {nextStatuses.length > 0 && (
                    <button
                      onClick={() => updateStatus(item, nextStatuses[0])}
                      disabled={!!updating}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#2534ff] hover:bg-[#1a27e0] text-white font-semibold text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {nextStatuses[0] === 'COMPLETED' ? 'Complete' : nextStatuses[0] === 'DRIVER_CONFIRMED' ? 'Confirm' : nextStatuses[0] === 'DRIVER_STANDBY' ? 'Standby' : nextStatuses[0] === 'DRIVER_PICKED_UP' ? 'Picked Up' : 'Update'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
