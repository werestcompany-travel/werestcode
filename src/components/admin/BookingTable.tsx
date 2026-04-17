'use client';

import { useState } from 'react';
import { AdminBookingRow, BookingStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, VEHICLE_LABELS, STATUS_LABELS } from '@/lib/utils';
import { Eye, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingTableProps {
  bookings: AdminBookingRow[];
  onStatusChange: (bookingId: string, status: BookingStatus, note?: string) => void;
  onViewDetail: (bookingId: string) => void;
}

const STATUSES: BookingStatus[] = [
  'PENDING', 'DRIVER_CONFIRMED', 'DRIVER_STANDBY', 'DRIVER_PICKED_UP', 'COMPLETED', 'CANCELLED',
];

export default function BookingTable({ bookings, onStatusChange, onViewDetail }: BookingTableProps) {
  const [search, setSearch]       = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.bookingRef.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.pickupAddress.toLowerCase().includes(q);
    const matchDate   = !dateFilter || b.pickupDate.startsWith(dateFilter);
    const matchStatus = statusFilter === 'ALL' || b.currentStatus === statusFilter;
    return matchSearch && matchDate && matchStatus;
  });

  const handleStatus = async (id: string, status: BookingStatus) => {
    setUpdatingId(id);
    await onStatusChange(id, status);
    setUpdatingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, ref, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 text-xs"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-base text-xs w-auto"
        />
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'ALL')}
            className="input-base pr-8 text-xs appearance-none"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>

      {/* Table (desktop) */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-100 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Ref', 'Customer', 'Route', 'Date / Time', 'Vehicle', 'Total', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-brand-700">{b.bookingRef}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{b.customerName}</p>
                  <p className="text-xs text-gray-400">{b.customerPhone}</p>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="text-xs text-gray-700 truncate">{b.pickupAddress}</p>
                  <p className="text-xs text-gray-400 truncate">→ {b.dropoffAddress}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-xs text-gray-700">{formatDate(b.pickupDate)}</p>
                  <p className="text-xs text-gray-400">{b.pickupTime}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-700">{VEHICLE_LABELS[b.vehicleType]}</td>
                <td className="px-4 py-3 font-bold text-brand-700 whitespace-nowrap">{formatCurrency(b.totalPrice)}</td>
                <td className="px-4 py-3">
                  <StatusDropdown
                    bookingId={b.id}
                    current={b.currentStatus}
                    loading={updatingId === b.id}
                    onChange={handleStatus}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewDetail(b.id)}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No bookings found</div>
        )}
      </div>

      {/* Cards (mobile) */}
      <div className="lg:hidden space-y-3">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-brand-700">{b.bookingRef}</span>
              <StatusBadge status={b.currentStatus} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{b.customerName}</p>
              <p className="text-xs text-gray-400">{b.customerPhone}</p>
            </div>
            <p className="text-xs text-gray-600 truncate">{b.pickupAddress} → {b.dropoffAddress}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{formatDate(b.pickupDate)} · {b.pickupTime}</span>
              <span className="font-bold text-brand-700">{formatCurrency(b.totalPrice)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <StatusDropdown
                  bookingId={b.id}
                  current={b.currentStatus}
                  loading={updatingId === b.id}
                  onChange={handleStatus}
                />
              </div>
              <button
                onClick={() => onViewDetail(b.id)}
                className="flex items-center gap-1 text-xs text-brand-600 font-medium"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No bookings found</p>
        )}
      </div>
    </div>
  );
}

function StatusDropdown({
  bookingId, current, loading, onChange,
}: {
  bookingId: string;
  current: BookingStatus;
  loading: boolean;
  onChange: (id: string, s: BookingStatus) => void;
}) {
  const STATUSES: BookingStatus[] = [
    'PENDING', 'DRIVER_CONFIRMED', 'DRIVER_STANDBY', 'DRIVER_PICKED_UP', 'COMPLETED', 'CANCELLED',
  ];

  return (
    <div className="relative">
      <select
        value={current}
        disabled={loading}
        onChange={(e) => onChange(bookingId, e.target.value as BookingStatus)}
        className={cn(
          'text-xs rounded-lg border py-1.5 pl-2.5 pr-6 appearance-none cursor-pointer w-full',
          'focus:outline-none focus:ring-1 focus:ring-brand-500',
          loading && 'opacity-50 cursor-wait',
          'bg-white border-gray-200',
        )}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
    </div>
  );
}
