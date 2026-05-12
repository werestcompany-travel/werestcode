'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { formatCurrency } from '@/lib/utils';
import {
  Car, Ticket, MapPin, TrendingUp, Clock,
  CheckCircle2, AlertCircle, ArrowRight, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface TransferStats { total: number; pending: number; active: number; completed: number; revenue: number }
interface AttractionStats { total: number; pending: number; confirmed: number; revenue: number }
interface TourStats { listed: number; active: number; bookings: number }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Booking = any;

function getLast7Days(): { label: string; dateStr: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label:   d.toLocaleDateString('en', { weekday: 'short' }),
      dateStr: d.toISOString().split('T')[0],
    };
  });
}

function revenueForDay(bookings: Booking[], dateStr: string): number {
  return bookings
    .filter(b => b.currentStatus !== 'CANCELLED')
    .filter(b => (b.pickupDate ?? b.createdAt ?? '').startsWith(dateStr))
    .reduce((s: number, b: Booking) => s + (b.totalPrice ?? 0), 0);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [transferStats,   setTransferStats]   = useState<TransferStats | null>(null);
  const [attractionStats, setAttractionStats] = useState<AttractionStats | null>(null);
  const [tourStats,       setTourStats]       = useState<TourStats | null>(null);
  const [allTransfers,      setAllTransfers]      = useState<Booking[]>([]);
  const [recentTransfers,   setRecentTransfers]   = useState<Booking[]>([]);
  const [recentAttractions, setRecentAttractions] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, aRes, tourRes] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/admin/attraction-bookings'),
        fetch('/api/admin/tours'),
      ]);
      if (tRes.status === 401 || aRes.status === 401 || tourRes.status === 401) { router.push('/admin/login'); return; }
      const tJson    = await tRes.json();
      const aJson    = await aRes.json();
      const tourJson = await tourRes.json();
      const allB  = tJson.data?.bookings ?? [];
      setTransferStats(tJson.data?.stats ?? null);
      setAllTransfers(allB);
      setRecentTransfers(allB.slice(0, 5));
      setAttractionStats(aJson.stats ?? null);
      setRecentAttractions((aJson.bookings ?? []).slice(0, 5));
      const tours: Booking[] = tourJson.tours ?? [];
      setTourStats({
        listed:   tours.length,
        active:   tours.filter((t: Booking) => t.isActive).length,
        bookings: tourJson.totalBookings ?? 0,
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = (transferStats?.revenue ?? 0) + (attractionStats?.revenue ?? 0);
  const totalBookings = (transferStats?.total ?? 0) + (attractionStats?.total ?? 0);

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back! Here's what's happening today.">

      {/* ── Top stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          color="bg-brand-600"
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          label="Total Bookings"
          value={loading ? '—' : String(totalBookings)}
        />
        <StatCard
          color="bg-emerald-500"
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          label="Total Revenue"
          value={loading ? '—' : formatCurrency(totalRevenue)}
        />
        <StatCard
          color="bg-amber-500"
          icon={<Clock className="w-5 h-5 text-white" />}
          label="Pending Transfers"
          value={loading ? '—' : String(transferStats?.pending ?? 0)}
        />
        <StatCard
          color="bg-violet-500"
          icon={<AlertCircle className="w-5 h-5 text-white" />}
          label="Pending Tickets"
          value={loading ? '—' : String(attractionStats?.pending ?? 0)}
        />
      </div>

      {/* ── Section cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <SectionCard
          icon={<Car className="w-5 h-5 text-brand-600" />}
          iconBg="bg-brand-50"
          title="Private Transfers"
          stats={[
            { label: 'Total',     value: transferStats?.total     ?? 0 },
            { label: 'Active',    value: transferStats?.active    ?? 0 },
            { label: 'Completed', value: transferStats?.completed ?? 0 },
          ]}
          revenue={transferStats?.revenue}
          href="/admin/transfers"
          loading={loading}
        />
        <SectionCard
          icon={<MapPin className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          title="Tours"
          stats={[
            { label: 'Listed',   value: tourStats?.listed   ?? 0 },
            { label: 'Active',   value: tourStats?.active   ?? 0 },
            { label: 'Bookings', value: tourStats?.bookings ?? 0 },
          ]}
          href="/admin/tours"
          loading={loading}
        />
        <SectionCard
          icon={<Ticket className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50"
          title="Attraction Tickets"
          stats={[
            { label: 'Total',     value: attractionStats?.total     ?? 0 },
            { label: 'Confirmed', value: attractionStats?.confirmed ?? 0 },
            { label: 'Pending',   value: attractionStats?.pending   ?? 0 },
          ]}
          revenue={attractionStats?.revenue}
          href="/admin/attraction-tickets"
          loading={loading}
        />
      </div>

      {/* ── Revenue chart + Today's pickups ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

        {/* 7-day revenue bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Revenue — Last 7 Days</p>
          {loading ? (
            <div className="h-28 flex items-end gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t animate-pulse" style={{ height: `${40 + i * 10}%` }} />
              ))}
            </div>
          ) : (
            <RevenueChart bookings={allTransfers} />
          )}
        </div>

        {/* Today's pickups */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-900">Today&apos;s Pickups</p>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              {loading ? '—' : allTransfers.filter(b =>
                (b.pickupDate ?? '').startsWith(new Date().toISOString().split('T')[0]) &&
                b.currentStatus !== 'CANCELLED'
              ).length}
            </span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[180px] overflow-y-auto">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-6">Loading…</p>
            ) : (() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const todayPickups = allTransfers.filter(b =>
                (b.pickupDate ?? '').startsWith(todayStr) && b.currentStatus !== 'CANCELLED'
              );
              return todayPickups.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No pickups today</p>
              ) : todayPickups.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 truncate">{b.customerName}</p>
                    <p className="text-[10px] text-gray-400">{b.pickupTime ?? '—'}</p>
                  </div>
                  <StatusPill status={b.currentStatus} />
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* ── Recent bookings ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent transfers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-gray-900">Recent Transfers</h2>
            </div>
            <Link href="/admin/transfers" className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:text-brand-800">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading…</p>
            ) : recentTransfers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No bookings yet</p>
            ) : recentTransfers.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{b.customerName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{b.pickupAddress} → {b.dropoffAddress}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-bold text-gray-900">{formatCurrency(b.totalPrice)}</p>
                  <StatusPill status={b.currentStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent attraction bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-violet-600" />
              <h2 className="text-sm font-bold text-gray-900">Recent Ticket Bookings</h2>
            </div>
            <Link href="/admin/attraction-tickets" className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:text-brand-800">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading…</p>
            ) : recentAttractions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No bookings yet</p>
            ) : recentAttractions.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{b.customerName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{b.attractionName}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-bold text-gray-900">{formatCurrency(b.totalPrice)}</p>
                  <AttractionStatusPill status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Refresh */}
      <div className="mt-5 flex justify-end">
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh data
        </button>
      </div>
    </AdminShell>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function RevenueChart({ bookings }: { bookings: Booking[] }) {
  const days = getLast7Days();
  const values = days.map(d => revenueForDay(bookings, d.dateStr));
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-1.5 h-28">
      {days.map((d, i) => {
        const pct = (values[i] / max) * 100;
        const isToday = i === 6;
        return (
          <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative flex-1 w-full flex items-end">
              <div
                className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-brand-600' : 'bg-brand-100 group-hover:bg-brand-300'}`}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
              {values[i] > 0 && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {formatCurrency(values[i])}
                </div>
              )}
            </div>
            <span className={`text-[9px] font-semibold ${isToday ? 'text-brand-600' : 'text-gray-400'}`}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ color, icon, label, value }: { color: string; icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SectionCard({
  icon, iconBg, title, stats, revenue, href, loading,
}: {
  icon: React.ReactNode; iconBg: string; title: string;
  stats: { label: string; value: number }[];
  revenue?: number; href: string; loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
          <p className="text-sm font-bold text-gray-900">{title}</p>
        </div>
        <Link href={href} className="text-[11px] text-brand-600 font-semibold hover:text-brand-800 flex items-center gap-0.5">
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-base font-extrabold text-gray-900">{loading ? '—' : s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {revenue !== undefined && (
        <div className="border-t border-gray-50 pt-3">
          <p className="text-[10px] text-gray-400">Total Revenue</p>
          <p className="text-sm font-extrabold text-brand-700">{loading ? '—' : formatCurrency(revenue)}</p>
        </div>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:           'bg-amber-100 text-amber-700',
  DRIVER_CONFIRMED:  'bg-blue-100 text-blue-700',
  DRIVER_STANDBY:    'bg-indigo-100 text-indigo-700',
  DRIVER_PICKED_UP:  'bg-violet-100 text-violet-700',
  COMPLETED:         'bg-green-100 text-green-700',
  CANCELLED:         'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending', DRIVER_CONFIRMED: 'Confirmed', DRIVER_STANDBY: 'Standby',
  DRIVER_PICKED_UP: 'En Route', COMPLETED: 'Done', CANCELLED: 'Cancelled',
};
function StatusPill({ status }: { status: string }) {
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

const ATTR_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700', USED: 'bg-gray-100 text-gray-500',
};
function AttractionStatusPill({ status }: { status: string }) {
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ATTR_COLORS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}
