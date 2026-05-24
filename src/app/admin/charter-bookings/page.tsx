'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { formatCurrency, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';
import { VEHICLE_LABELS } from '@/lib/vehicles';
import { BookingStatus, VehicleType } from '@/types';
import { MapPin, Clock, Users, ChevronRight, X, Car, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Stop {
  address: string;
  lat:     number;
  lng:     number;
  note:    string;
  order:   number;
}

interface CharterBooking {
  id:            string;
  bookingRef:    string;
  charterType:   'HOURLY' | 'MULTI_STOP';
  vehicleType:   VehicleType;
  startDate:     string;
  startTime:     string;
  durationHours: number | null;
  startAddress:  string;
  stops:         Stop[];
  endAddress:    string | null;
  customerName:  string;
  customerEmail: string;
  customerPhone: string;
  passengers:    number;
  specialNotes:  string | null;
  hourlyRate:    number | null;
  distanceKm:    number;
  basePrice:     number;
  totalPrice:    number;
  paymentStatus: string;
  currentStatus: BookingStatus;
  driverName:    string | null;
  createdAt:     string;
}

/* ── Status badge ───────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

/* ── Charter type chip ──────────────────────────────────────────────────────── */

function TypeChip({ type }: { type: 'HOURLY' | 'MULTI_STOP' }) {
  return (
    <span className={cn(
      'text-[10px] font-bold px-2 py-0.5 rounded-full',
      type === 'HOURLY'
        ? 'bg-purple-100 text-purple-700'
        : 'bg-teal-100 text-teal-700',
    )}>
      {type === 'HOURLY' ? 'Hourly' : 'Multi-Stop'}
    </span>
  );
}

/* ── Detail panel ────────────────────────────────────────────────────────────── */

function DetailPanel({ booking, onClose }: { booking: CharterBooking; onClose: () => void }) {
  const stops: Stop[] = Array.isArray(booking.stops) ? booking.stops : [];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <aside className="w-[420px] bg-white border-l border-gray-100 shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs text-gray-400 font-mono">{booking.bookingRef}</p>
            <h2 className="text-base font-extrabold text-gray-900">{booking.customerName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">

          {/* Chips row */}
          <div className="flex flex-wrap gap-2">
            <TypeChip type={booking.charterType} />
            <StatusBadge status={booking.currentStatus} />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {VEHICLE_LABELS[booking.vehicleType]}
            </span>
          </div>

          {/* Schedule */}
          <Section title="Schedule">
            <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Date">
              {new Date(booking.startDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </Row>
            <Row icon={<Clock className="w-3.5 h-3.5" />} label="Time">
              {booking.startTime}
            </Row>
            {booking.charterType === 'HOURLY' && booking.durationHours != null && (
              <Row icon={<Clock className="w-3.5 h-3.5" />} label="Duration">
                {booking.durationHours} hour{booking.durationHours !== 1 ? 's' : ''}
              </Row>
            )}
            <Row icon={<Users className="w-3.5 h-3.5" />} label="Passengers">
              {booking.passengers}
            </Row>
          </Section>

          {/* Route */}
          <Section title="Route">
            <div className="space-y-2">
              {/* Start */}
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Start</p>
                  <p className="text-xs text-gray-800 font-medium">{booking.startAddress}</p>
                </div>
              </div>

              {/* Stops */}
              {stops.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 pl-1.5">
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-3 bg-gray-200" />
                    <div className="w-5 h-5 rounded-full bg-brand-100 border-2 border-brand-400 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-brand-700">{i + 1}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-800 font-medium">{s.address}</p>
                    {s.note && <p className="text-[10px] text-gray-400 italic mt-0.5">{s.note}</p>}
                  </div>
                </div>
              ))}

              {/* End */}
              {booking.endAddress && (
                <div className="flex items-start gap-2.5 pl-1.5">
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-3 bg-gray-200" />
                    <div className="w-4 h-4 rounded-full border-2 border-red-400 bg-red-100 shrink-0" />
                  </div>
                  <div className="mt-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">End</p>
                    <p className="text-xs text-gray-800 font-medium">{booking.endAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {booking.charterType === 'MULTI_STOP' && booking.distanceKm > 0 && (
              <p className="text-xs text-gray-400 mt-2">Estimated distance: {booking.distanceKm} km</p>
            )}
          </Section>

          {/* Customer */}
          <Section title="Customer">
            <Row icon={<span className="text-[10px]">👤</span>} label="Name">{booking.customerName}</Row>
            <Row icon={<span className="text-[10px]">📞</span>} label="Phone">
              <a href={`https://wa.me/${booking.customerPhone.replace(/\D/g, '')}`} className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {booking.customerPhone}
              </a>
            </Row>
            <Row icon={<span className="text-[10px]">✉️</span>} label="Email">{booking.customerEmail}</Row>
            {booking.specialNotes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 mt-1">
                <p className="font-semibold mb-0.5">Special Notes</p>
                <p>{booking.specialNotes}</p>
              </div>
            )}
          </Section>

          {/* Pricing */}
          <Section title="Pricing Breakdown">
            {booking.charterType === 'HOURLY' && booking.hourlyRate != null && booking.durationHours != null && (
              <PriceRow label={`฿${booking.hourlyRate.toLocaleString()}/hr × ${booking.durationHours} hr`} value={booking.hourlyRate * booking.durationHours} />
            )}
            {booking.charterType === 'MULTI_STOP' && (
              <>
                <PriceRow label="Base fare" value={booking.basePrice - KM_RATE_ESTIMATE(booking)} />
                <PriceRow label={`Distance (~${booking.distanceKm} km)`} value={KM_RATE_ESTIMATE(booking)} />
              </>
            )}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-extrabold text-gray-900">
              <span>Total</span>
              <span className="text-brand-700">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Payment: {booking.paymentStatus.replace(/_/g, ' ')}
            </p>
          </Section>

          {/* Driver */}
          {booking.driverName && (
            <Section title="Driver">
              <Row icon={<Car className="w-3.5 h-3.5" />} label="Assigned">{booking.driverName}</Row>
            </Section>
          )}
        </div>
      </aside>
    </div>
  );
}

function KM_RATE_ESTIMATE(booking: CharterBooking): number {
  const rates: Record<VehicleType, number> = { SEDAN: 12, SUV: 18, MINIVAN: 22, LUXURY_MPV: 35 };
  return Math.round(rates[booking.vehicleType] * booking.distanceKm);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <div className="text-gray-400 mt-0.5 w-4 shrink-0">{icon}</div>
      <span className="text-gray-400 w-20 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium flex-1">{children}</span>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-xs text-gray-600">
      <span>{label}</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );
}

/* ── Main admin page ─────────────────────────────────────────────────────────── */

const ALL_STATUSES: Array<BookingStatus | 'ALL'> = [
  'ALL', 'PENDING', 'DRIVER_CONFIRMED', 'DRIVER_STANDBY', 'DRIVER_PICKED_UP', 'COMPLETED', 'CANCELLED',
];

export default function CharterBookingsPage() {
  const [bookings, setBookings]   = useState<CharterBooking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<CharterBooking | null>(null);

  useEffect(() => {
    const url = statusFilter === 'ALL'
      ? '/api/admin/charter-bookings'
      : `/api/admin/charter-bookings?status=${statusFilter}`;

    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => setBookings(d.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.bookingRef.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.customerEmail.toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Charter Bookings"
      subtitle="Hourly and multi-stop charter requests"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ref, name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 text-xs"
          />
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors',
                statusFilter === s
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300',
              )}
            >
              {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading charter bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">No charter bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Ref</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Vehicle</th>
                  <th className="text-left px-4 py-3">Date / Time</th>
                  <th className="text-left px-4 py-3">Duration / Stops</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => {
                  const stops: Stop[] = Array.isArray(b.stops) ? b.stops : [];
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelected(b)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      {/* Ref */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-600">{b.bookingRef}</span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <TypeChip type={b.charterType} />
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900 text-xs">{b.customerName}</p>
                        <p className="text-[10px] text-gray-400">{b.customerPhone}</p>
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-700">{VEHICLE_LABELS[b.vehicleType]}</span>
                      </td>

                      {/* Date / Time */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(b.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {b.startTime}
                        </div>
                      </td>

                      {/* Duration / Stops */}
                      <td className="px-4 py-3.5">
                        {b.charterType === 'HOURLY' ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {b.durationHours ?? '—'} hr
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {stops.length} stop{stops.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-bold text-xs text-brand-700">{formatCurrency(b.totalPrice)}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={b.currentStatus} />
                      </td>

                      {/* Arrow */}
                      <td className="px-4 py-3.5">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Totals row */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          Showing {filtered.length} booking{filtered.length !== 1 ? 's' : ''}.
          Total value:{' '}
          <span className="font-bold text-gray-700">
            {formatCurrency(filtered.reduce((s, b) => s + b.totalPrice, 0))}
          </span>
        </p>
      )}

      {/* Detail panel */}
      {selected && (
        <DetailPanel booking={selected} onClose={() => setSelected(null)} />
      )}
    </AdminShell>
  );
}
