'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import {
  Search, RefreshCw, Eye, TrendingUp, Download,
  X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface TourBookingRow {
  id: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tourTitle: string;
  optionLabel: string | null;
  bookingDate: string;
  adultQty: number;
  childQty: number;
  totalPrice: number;
  status: string;
  paymentStatus: string | null;
  createdAt: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const STATUS_CHIP: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  PENDING:   'bg-amber-100 text-amber-700',
};

const PAYMENT_CHIP: Record<string, string> = {
  PAID:             'bg-green-100 text-green-700',
  AWAITING_PAYMENT: 'bg-amber-100 text-amber-700',
  UNPAID:           'bg-gray-100 text-gray-600',
  FAILED:           'bg-red-100 text-red-700',
  REFUNDED:         'bg-purple-100 text-purple-700',
};

const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING'];
const PAGE_SIZE = 20;

function formatCurrency(v: number) {
  return '฿' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function TourBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<TourBookingRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [page,     setPage]     = useState(1);

  const [detail,   setDetail]   = useState<TourBookingRow | null>(null);
  const [changing, setChanging] = useState(false);

  const totalRevenue = bookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((s, b) => s + b.totalPrice, 0);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tour-bookings');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const json = await res.json();
      setBookings(json.bookings ?? []);
    } catch {
      toast.error('Failed to load tour bookings');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  /* ── Filter / paginate ─────────────────────────────────────────────────── */

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || b.bookingRef.toLowerCase().includes(q)
      || b.customerName.toLowerCase().includes(q)
      || b.customerEmail.toLowerCase().includes(q);
    const matchStatus = filter === 'ALL' || b.status === filter;
    const bd = b.bookingDate.slice(0, 10);
    const matchFrom = !dateFrom || bd >= dateFrom;
    const matchTo   = !dateTo   || bd <= dateTo;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, filter, dateFrom, dateTo]);

  /* ── Status change ─────────────────────────────────────────────────────── */

  const handleStatusChange = async (id: string, status: string) => {
    setChanging(true);
    try {
      const res = await fetch(`/api/admin/tour-bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Status updated to ${status}`);
      await load();
      if (detail?.id === id) {
        setDetail((prev) => prev ? { ...prev, status } : prev);
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setChanging(false);
    }
  };

  /* ── CSV export ────────────────────────────────────────────────────────── */

  const exportCsv = () => {
    const headers = [
      'Booking Ref', 'Customer Name', 'Email', 'Phone',
      'Tour Title', 'Option', 'Booking Date', 'Adults', 'Children',
      'Total Price (THB)', 'Status', 'Payment Status', 'Created At',
    ];
    const rows = filtered.map((b) => [
      b.bookingRef, b.customerName, b.customerEmail, b.customerPhone,
      b.tourTitle, b.optionLabel ?? '',
      formatDate(b.bookingDate), b.adultQty, b.childQty,
      b.totalPrice, b.status, b.paymentStatus ?? '',
      formatDate(b.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `tour-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <AdminShell title="Tour Bookings" subtitle="Manage all tour booking records">

      {/* Revenue summary card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Total Revenue</p>
            <p className="font-extrabold text-sm text-brand-700">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-gray-600">#</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Total Bookings</p>
            <p className="font-extrabold text-lg text-gray-900">{bookings.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-green-600">✓</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Confirmed</p>
            <p className="font-extrabold text-lg text-gray-900">
              {bookings.filter((b) => b.status === 'CONFIRMED').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-blue-600">✔</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Completed</p>
            <p className="font-extrabold text-lg text-gray-900">
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50">

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref, customer, email…"
              className="bg-transparent text-xs text-gray-700 outline-none flex-1 placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status filter chips */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  filter === s
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <span className="text-xs text-gray-400">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Counter badge */}
        <div className="px-5 py-2 border-b border-gray-50 flex items-center gap-2">
          <span className="text-[11px] text-gray-500">
            Showing <strong>{filtered.length}</strong> of <strong>{bookings.length}</strong> tour bookings
          </span>
          {filtered.length !== bookings.length && (
            <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Filtered
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Booking Ref</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Email / Phone</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Tour</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">Guests</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Payment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    Loading tour bookings…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    No tour bookings found
                  </td>
                </tr>
              ) : paged.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-brand-700 text-[11px]">
                    {b.bookingRef}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-900">{b.customerName}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-gray-700 truncate max-w-[160px]">{b.customerEmail}</p>
                    <p className="text-gray-400 text-[10px]">{b.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell max-w-[200px]">
                    <p className="truncate text-gray-700 font-medium">{b.tourTitle}</p>
                    {b.optionLabel && (
                      <p className="text-gray-400 text-[10px] truncate">{b.optionLabel}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-gray-600">
                    {formatDate(b.bookingDate)}
                  </td>
                  <td className="px-4 py-3.5 hidden xl:table-cell text-gray-600">
                    {b.adultQty}A{b.childQty > 0 ? ` + ${b.childQty}C` : ''}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-gray-900">
                    {formatCurrency(b.totalPrice)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_CHIP[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {b.paymentStatus ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PAYMENT_CHIP[b.paymentStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                        {b.paymentStatus.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setDetail(b)}
                      className="p-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-600 text-gray-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === pg
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="w-full max-w-[420px] bg-white shadow-2xl overflow-y-auto">

            {/* Drawer header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <p className="font-mono font-bold text-brand-700 text-sm">{detail.bookingRef}</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_CHIP[detail.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {detail.status.charAt(0) + detail.status.slice(1).toLowerCase()}
                </span>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="p-5 space-y-5">

              <DrawerSection title="Customer">
                <DrawerRow label="Name"  value={detail.customerName} />
                <DrawerRow label="Email" value={detail.customerEmail} />
                <DrawerRow label="Phone" value={detail.customerPhone} />
              </DrawerSection>

              <DrawerSection title="Tour Details">
                <DrawerRow label="Tour"    value={detail.tourTitle} />
                {detail.optionLabel && <DrawerRow label="Option" value={detail.optionLabel} />}
                <DrawerRow label="Date"    value={formatDate(detail.bookingDate)} />
                <DrawerRow label="Adults"  value={String(detail.adultQty)} />
                {detail.childQty > 0 && <DrawerRow label="Children" value={String(detail.childQty)} />}
              </DrawerSection>

              <DrawerSection title="Pricing">
                <DrawerRow label="Total" value={formatCurrency(detail.totalPrice)} bold />
                {detail.paymentStatus && (
                  <DrawerRow label="Payment" value={detail.paymentStatus.replace(/_/g, ' ')} />
                )}
              </DrawerSection>

              <DrawerSection title="Change Status">
                <div className="grid grid-cols-2 gap-2">
                  {(['CONFIRMED', 'COMPLETED', 'CANCELLED', 'PENDING'] as const).map((s) => (
                    <button
                      key={s}
                      disabled={changing || detail.status === s}
                      onClick={() => handleStatusChange(detail.id, s)}
                      className={`text-[11px] rounded-xl border py-2 px-3 font-semibold transition-colors ${
                        detail.status === s
                          ? 'border-brand-300 bg-brand-50 text-brand-700 cursor-default'
                          : 'border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50'
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
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
