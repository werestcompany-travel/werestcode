'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusTimeline from '@/components/tracking/StatusTimeline';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { BookingDetail } from '@/types';
import { formatCurrency, formatDate, VEHICLE_LABELS } from '@/lib/utils';
import { Search, MapPin, Calendar, Clock, Users, Phone } from 'lucide-react';

export default function TrackingPage() { return <Suspense><TrackingPageInner /></Suspense>; }
function TrackingPageInner() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') ?? '';

  const [ref, setRef] = useState(initialRef);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ref.trim()) { setError('Please enter your booking reference'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/track?ref=${encodeURIComponent(ref.trim().toUpperCase())}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Booking not found');
      setBooking(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking not found');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if ref pre-filled
  useState(() => {
    if (initialRef) handleSearch();
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Track Your Booking</h1>
            <p className="text-gray-500 mt-2 text-sm">Enter your booking reference to see real-time status</p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. WR-240501-1234"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                className="input-base pl-10 font-mono tracking-wider uppercase"
              />
            </div>
            <Button type="submit" loading={loading}>Track</Button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          {booking && (
            <div className="space-y-5 animate-fade-in">
              {/* Header */}
              <div className="bg-brand-700 text-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-brand-200 text-xs font-medium">Booking Reference</p>
                  <StatusBadge status={booking.currentStatus} className="bg-white/20 text-white" />
                </div>
                <p className="text-2xl font-black tracking-wider">{booking.bookingRef}</p>
                <p className="text-brand-200 text-xs mt-1">{booking.customerName}</p>
              </div>

              {/* Trip info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Pickup</p>
                    <p className="font-medium text-gray-800">{booking.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-100" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Drop-off</p>
                    <p className="font-medium text-gray-800">{booking.dropoffAddress}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <InfoPill icon={<Calendar className="w-3 h-3" />} label={formatDate(booking.pickupDate)} />
                  <InfoPill icon={<Clock className="w-3 h-3" />}    label={booking.pickupTime} />
                  <InfoPill icon={<Users className="w-3 h-3" />}    label={`${booking.passengers} pax`} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">{VEHICLE_LABELS[booking.vehicleType]}</span>
                  <span className="font-bold text-brand-700">{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <h2 className="font-bold text-gray-900 mb-5">Status Timeline</h2>
                <StatusTimeline
                  currentStatus={booking.currentStatus}
                  history={booking.statusHistory}
                />
              </div>

              {/* Help */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-brand-600 shrink-0" />
                <p className="text-gray-600">
                  Need help? Call us:{' '}
                  <a
                    href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE}`}
                    className="font-semibold text-brand-700"
                  >
                    {process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '+66 XX XXX XXXX'}
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1.5 text-xs text-gray-600">
      {icon} {label}
    </div>
  );
}
