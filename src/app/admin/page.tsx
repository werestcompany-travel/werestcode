'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BookingTable from '@/components/admin/BookingTable';
import StatusTimeline from '@/components/tracking/StatusTimeline';
import { StatusBadge } from '@/components/ui/Badge';
import { AdminBookingRow, BookingDetail, BookingStatus } from '@/types';
import { formatCurrency, formatDate, VEHICLE_LABELS, STATUS_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  LayoutDashboard, LogOut, RefreshCw, X,
  TrendingUp, Clock, CheckCircle2, XCircle, Ticket, Package, Tag,
} from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  revenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [detail, setDetail]     = useState<BookingDetail | null>(null);
  const [loading, setLoading]   = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const json = await res.json();
      setBookings(json.data?.bookings ?? []);
      setStats(json.data?.stats ?? null);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedBy: 'Admin' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
      await fetchBookings();
      if (detail?.id === bookingId) {
        const detailRes = await fetch(`/api/bookings/${bookingId}`);
        const detailJson = await detailRes.json();
        setDetail(detailJson.data);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleViewDetail = async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}`);
    const json = await res.json();
    setDetail(json.data);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar / Top bar */}
      <div className="bg-brand-800 text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">W</span>
            </div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-brand-300" />
              <span className="font-semibold">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/attraction-bookings"
              className="flex items-center gap-1.5 text-xs text-brand-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
              <Ticket className="w-3.5 h-3.5" /> Attraction Bookings
            </Link>
            <Link href="/admin/attractions"
              className="flex items-center gap-1.5 text-xs text-brand-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
              <Package className="w-3.5 h-3.5" /> Attractions
            </Link>
            <Link href="/admin/discount-codes"
              className="flex items-center gap-1.5 text-xs text-brand-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
              <Tag className="w-3.5 h-3.5" /> Discount Codes
            </Link>
            <button
              onClick={fetchBookings}
              className="flex items-center gap-1.5 text-xs text-brand-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-brand-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={<TrendingUp className="w-5 h-5 text-brand-600" />} label="Total Bookings" value={stats.total} />
            <StatCard icon={<Clock className="w-5 h-5 text-amber-500" />}       label="Pending"        value={stats.pending} />
            <StatCard icon={<Clock className="w-5 h-5 text-blue-500" />}        label="Active"         value={stats.active} />
            <StatCard icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} label="Completed"     value={stats.completed} />
            <StatCard
              icon={<XCircle className="w-5 h-5 text-brand-600" />}
              label="Total Revenue"
              value={formatCurrency(stats.revenue)}
              isText
            />
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">Loading bookings…</div>
        ) : (
          <BookingTable
            bookings={bookings}
            onStatusChange={handleStatusChange}
            onViewDetail={handleViewDetail}
          />
        )}
      </main>

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDetail(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <p className="font-mono font-bold text-brand-700">{detail.bookingRef}</p>
                <StatusBadge status={detail.currentStatus} />
              </div>
              <button onClick={() => setDetail(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer */}
              <Section title="Customer">
                <Info label="Name"  value={detail.customerName} />
                <Info label="Phone" value={detail.customerPhone} />
                <Info label="Email" value={detail.customerEmail} />
                {detail.specialNotes && <Info label="Notes" value={detail.specialNotes} />}
              </Section>

              {/* Trip */}
              <Section title="Trip">
                <Info label="Pickup"   value={detail.pickupAddress} />
                <Info label="Drop-off" value={detail.dropoffAddress} />
                <Info label="Date"     value={formatDate(detail.pickupDate)} />
                <Info label="Time"     value={detail.pickupTime} />
                <Info label="Distance" value={`${detail.distanceKm.toFixed(1)} km`} />
                <Info label="Vehicle"  value={VEHICLE_LABELS[detail.vehicleType]} />
                <Info label="Pax / Bags" value={`${detail.passengers} / ${detail.luggage}`} />
              </Section>

              {/* Pricing */}
              <Section title="Pricing">
                <Info label="Base fare"  value={formatCurrency(detail.basePrice)} />
                {detail.bookingAddOns.map((ba) => (
                  <Info key={ba.addOn.name} label={`${ba.addOn.icon ?? ''} ${ba.addOn.name} × ${ba.quantity}`} value={formatCurrency(ba.unitPrice * ba.quantity)} />
                ))}
                <Info label="TOTAL" value={formatCurrency(detail.totalPrice)} bold />
              </Section>

              {/* Timeline */}
              <Section title="Status Timeline">
                <StatusTimeline currentStatus={detail.currentStatus} history={detail.statusHistory} />
              </Section>

              {/* Quick status update */}
              <Section title="Update Status">
                <div className="grid grid-cols-2 gap-2">
                  {(['DRIVER_CONFIRMED', 'DRIVER_STANDBY', 'DRIVER_PICKED_UP', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(detail.id, s)}
                      className="text-xs rounded-lg border border-gray-200 py-2 px-3 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors text-gray-600 font-medium"
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, isText,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`font-extrabold ${isText ? 'text-base text-brand-700' : 'text-xl text-gray-900'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Info({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-400 w-28 shrink-0">{label}</span>
      <span className={`text-gray-800 flex-1 ${bold ? 'font-bold text-brand-700' : ''}`}>{value}</span>
    </div>
  );
}
