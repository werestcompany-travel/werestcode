'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import StatusTimeline from '@/components/tracking/StatusTimeline';
import { StatusBadge } from '@/components/ui/Badge';
import { AdminBookingRow, BookingDetail, BookingStatus } from '@/types';
import { formatCurrency, formatDate, VEHICLE_LABELS, STATUS_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  X, Search, RefreshCw, Eye, TrendingUp,
  Clock, CheckCircle2, XCircle, Car,
} from 'lucide-react';

const STATUS_CHIP: Record<string, string> = {
  PENDING:          'bg-amber-100 text-amber-700',
  DRIVER_CONFIRMED: 'bg-blue-100  text-blue-700',
  DRIVER_STANDBY:   'bg-indigo-100 text-indigo-700',
  DRIVER_PICKED_UP: 'bg-violet-100 text-violet-700',
  COMPLETED:        'bg-green-100 text-green-700',
  CANCELLED:        'bg-red-100   text-red-700',
};

export default function TransfersPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [stats,    setStats]    = useState<any>(null);
  const [detail,   setDetail]   = useState<BookingDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const json = await res.json();
      setBookings(json.data?.bookings ?? []);
      setStats(json.data?.stats ?? null);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedBy: 'Admin' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Updated to ${STATUS_LABELS[status]}`);
      await load();
      if (detail?.id === bookingId) {
        const dr = await fetch(`/api/bookings/${bookingId}`);
        setDetail((await dr.json()).data);
      }
    } catch (err: any) { toast.error(err.message ?? 'Update failed'); }
  };

  const openDetail = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`);
    setDetail((await res.json()).data);
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.customerName.toLowerCase().includes(q) ||
      b.bookingRef.toLowerCase().includes(q) || b.pickupAddress.toLowerCase().includes(q);
    const matchFilter = filter === 'ALL' || b.currentStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <AdminShell title="Private Transfers" subtitle="Manage all private transfer bookings">

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { icon: <TrendingUp className="w-4 h-4 text-brand-600" />,    bg: 'bg-brand-50',   label: 'Total',     value: stats.total },
            { icon: <Clock className="w-4 h-4 text-amber-500" />,         bg: 'bg-amber-50',   label: 'Pending',   value: stats.pending },
            { icon: <Car className="w-4 h-4 text-blue-500" />,            bg: 'bg-blue-50',    label: 'Active',    value: stats.active },
            { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,  bg: 'bg-green-50',   label: 'Completed', value: stats.completed },
            { icon: <XCircle className="w-4 h-4 text-brand-600" />,       bg: 'bg-brand-50',   label: 'Revenue',   value: formatCurrency(stats.revenue), isText: true },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-gray-400">{s.label}</p>
                <p className={`font-extrabold ${s.isText ? 'text-sm text-brand-700' : 'text-lg text-gray-900'}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ref, pickup…"
              className="bg-transparent text-xs text-gray-700 outline-none flex-1 placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['ALL','PENDING','DRIVER_CONFIRMED','DRIVER_PICKED_UP','COMPLETED','CANCELLED'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  filter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {s === 'ALL' ? 'All' : s === 'DRIVER_CONFIRMED' ? 'Confirmed' : s === 'DRIVER_PICKED_UP' ? 'En Route' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button onClick={load} className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Ref</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Route</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Vehicle</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading bookings…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No bookings found</td></tr>
              ) : filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-brand-700 text-[11px]">{b.bookingRef}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-900">{b.customerName}</p>
                    <p className="text-gray-400 text-[10px]">{b.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell max-w-[180px]">
                    <p className="truncate text-gray-700">{b.pickupAddress}</p>
                    <p className="truncate text-gray-400 text-[10px]">→ {b.dropoffAddress}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-gray-600">{formatDate(b.pickupDate)}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-600 text-[10px] font-semibold">
                      {VEHICLE_LABELS[b.vehicleType]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_CHIP[b.currentStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[b.currentStatus] ?? b.currentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => openDetail(b.id)}
                      className="p-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-600 text-gray-400 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-50 text-[10px] text-gray-400">
          Showing {filtered.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="w-full max-w-[420px] bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <p className="font-mono font-bold text-brand-700 text-sm">{detail.bookingRef}</p>
                <StatusBadge status={detail.currentStatus} />
              </div>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <DrawerSection title="Customer">
                <DrawerRow label="Name"  value={detail.customerName} />
                <DrawerRow label="Phone" value={detail.customerPhone} />
                <DrawerRow label="Email" value={detail.customerEmail} />
                {detail.specialNotes && <DrawerRow label="Notes" value={detail.specialNotes} />}
              </DrawerSection>
              <DrawerSection title="Trip">
                <DrawerRow label="Pickup"    value={detail.pickupAddress} />
                <DrawerRow label="Drop-off"  value={detail.dropoffAddress} />
                <DrawerRow label="Date"      value={formatDate(detail.pickupDate)} />
                <DrawerRow label="Time"      value={detail.pickupTime} />
                <DrawerRow label="Distance"  value={`${detail.distanceKm.toFixed(1)} km`} />
                <DrawerRow label="Vehicle"   value={VEHICLE_LABELS[detail.vehicleType]} />
                <DrawerRow label="Pax/Bags"  value={`${detail.passengers} / ${detail.luggage}`} />
              </DrawerSection>
              <DrawerSection title="Pricing">
                <DrawerRow label="Base fare"  value={formatCurrency(detail.basePrice)} />
                {detail.bookingAddOns.map((ba) => (
                  <DrawerRow key={ba.addOn.name} label={`${ba.addOn.icon ?? ''} ${ba.addOn.name} ×${ba.quantity}`} value={formatCurrency(ba.unitPrice * ba.quantity)} />
                ))}
                <DrawerRow label="TOTAL" value={formatCurrency(detail.totalPrice)} bold />
              </DrawerSection>
              <DrawerSection title="Status Timeline">
                <StatusTimeline currentStatus={detail.currentStatus} history={detail.statusHistory} />
              </DrawerSection>
              <DrawerSection title="Update Status">
                <div className="grid grid-cols-2 gap-2">
                  {(['DRIVER_CONFIRMED','DRIVER_STANDBY','DRIVER_PICKED_UP','COMPLETED','CANCELLED'] as BookingStatus[]).map((s) => (
                    <button key={s} onClick={() => handleStatusChange(detail.id, s)}
                      className="text-[11px] rounded-xl border border-gray-200 py-2 px-3 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors text-gray-600 font-semibold">
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </DrawerSection>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{title}</p>
      <div className="space-y-2 bg-gray-50 rounded-xl p-3">{children}</div>
    </div>
  );
}
function DrawerRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-gray-400 w-24 shrink-0">{label}</span>
      <span className={`text-gray-800 flex-1 ${bold ? 'font-bold text-brand-700' : ''}`}>{value}</span>
    </div>
  );
}
