'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  MapPin,
  Clock,
  Users,
  Car,
  ChevronRight,
  Loader2,
  WifiOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { BookingStatus, VehicleType } from '@/types';
import { VEHICLE_LABELS } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
  rating: number;
  totalTrips: number;
  photoUrl: string | null;
}

interface DriverBooking {
  id: string;
  bookingRef: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleType: VehicleType;
  customerName: string;
  customerPhone: string;
  currentStatus: BookingStatus;
  specialNotes: string | null;
}

// ─── Status chip colours ──────────────────────────────────────────────────────

const STATUS_CHIP: Record<BookingStatus, string> = {
  PENDING:          'bg-yellow-100 text-yellow-800',
  DRIVER_CONFIRMED: 'bg-blue-100 text-blue-800',
  DRIVER_STANDBY:   'bg-indigo-100 text-indigo-800',
  DRIVER_PICKED_UP: 'bg-purple-100 text-purple-800',
  COMPLETED:        'bg-green-100 text-green-800',
  CANCELLED:        'bg-red-100 text-red-800',
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING:          'Pending',
  DRIVER_CONFIRMED: 'Confirmed',
  DRIVER_STANDBY:   'Standby',
  DRIVER_PICKED_UP: 'Picked Up',
  COMPLETED:        'Completed',
  CANCELLED:        'Cancelled',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DriverDashboard() {
  const router = useRouter();
  const [driver, setDriver]   = useState<DriverProfile | null>(null);
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('driver_token');

  // ── Auth + profile load ───────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/driver/login');
      return;
    }

    try {
      const res = await fetch('/api/driver/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('driver_token');
        router.replace('/driver/login');
        return;
      }

      const json = await res.json();
      if (json.success) setDriver(json.data);
      else setError(json.error ?? 'Failed to load profile');
    } catch {
      setError('Network error — check your connection');
    } finally {
      setAuthLoading(false);
    }
  }, [router]);

  // ── Bookings load ─────────────────────────────────────────────────────────
  const loadBookings = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('/api/driver/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch {
      // silent — bookings are secondary
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (driver) loadBookings();
  }, [driver, loadBookings]);

  // ── Online toggle ─────────────────────────────────────────────────────────
  const toggleOnline = async () => {
    if (!driver) return;
    setOnlineLoading(true);
    const token = getToken();
    try {
      const res = await fetch('/api/driver/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isOnline: !driver.isOnline }),
      });
      const json = await res.json();
      if (json.success) {
        setDriver(prev => prev ? { ...prev, isOnline: json.data.isOnline } : prev);
      }
    } catch {
      setError('Failed to update status');
    } finally {
      setOnlineLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('driver_token');
    localStorage.removeItem('driver_name');
    router.replace('/driver/login');
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2534ff]">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-6">
        <WifiOff className="w-10 h-10 text-gray-400" />
        <p className="text-gray-600 text-sm">{error || 'Unable to load driver profile'}</p>
        <button
          onClick={() => { setAuthLoading(true); loadProfile(); }}
          className="bg-[#2534ff] text-white text-sm font-semibold px-6 py-2.5 rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.currentStatus !== 'COMPLETED' && b.currentStatus !== 'CANCELLED');
  const doneBookings   = bookings.filter(b => b.currentStatus === 'COMPLETED');

  return (
    <main className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-[#2534ff] px-5 pt-12 pb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-medium">Welcome back</p>
            <h1 className="text-xl font-extrabold">{driver.name}</h1>
            <p className="text-blue-200 text-xs mt-0.5">{driver.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/15 active:bg-white/25 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-5">
          <div className="flex-1 bg-white/15 rounded-xl px-3 py-2.5 text-center">
            <p className="text-xl font-black">{driver.rating.toFixed(1)}</p>
            <p className="text-blue-200 text-xs">Rating</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl px-3 py-2.5 text-center">
            <p className="text-xl font-black">{driver.totalTrips}</p>
            <p className="text-blue-200 text-xs">Trips</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl px-3 py-2.5 text-center">
            <p className="text-xl font-black">{activeBookings.length}</p>
            <p className="text-blue-200 text-xs">Today</p>
          </div>
        </div>
      </div>

      {/* Online toggle */}
      <div className="mx-5 -mt-4 bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900 text-sm">
            {driver.isOnline ? 'You are Online' : 'You are Offline'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {driver.isOnline
              ? 'Customers can see you are active'
              : 'Toggle on when you start your shift'}
          </p>
        </div>
        <button
          onClick={toggleOnline}
          disabled={onlineLoading}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
            driver.isOnline ? 'bg-[#2534ff]' : 'bg-gray-200'
          } ${onlineLoading ? 'opacity-60' : ''}`}
          aria-label="Toggle online status"
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
              driver.isOnline ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Today's bookings */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Today&apos;s Trips</h2>
          <button
            onClick={loadBookings}
            className="text-xs text-[#2534ff] font-semibold"
          >
            Refresh
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No trips today</p>
            <p className="text-xs text-gray-400 mt-1">Your assigned trips will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.map(b => (
              <BookingCard key={b.id} booking={b} />
            ))}

            {doneBookings.length > 0 && (
              <>
                <div className="flex items-center gap-2 mt-5 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-semibold text-gray-500">Completed ({doneBookings.length})</p>
                </div>
                {doneBookings.map(b => (
                  <BookingCard key={b.id} booking={b} dimmed />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Booking card sub-component ───────────────────────────────────────────────

function BookingCard({ booking, dimmed = false }: { booking: DriverBooking; dimmed?: boolean }) {
  return (
    <Link
      href={`/driver/trip/${booking.id}`}
      className={`block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:bg-gray-50 transition-colors ${
        dimmed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Time + ref */}
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-[#2534ff] shrink-0" />
            <span className="text-sm font-bold text-gray-900">{booking.pickupTime}</span>
            <span className="text-xs text-gray-400 font-mono">{booking.bookingRef}</span>
          </div>

          {/* Route */}
          <div className="space-y-1">
            <div className="flex items-start gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" />
              <p className="text-xs text-gray-700 leading-tight line-clamp-1">
                {booking.pickupAddress}
              </p>
            </div>
            <div className="flex items-start gap-1.5">
              <MapPin className="w-2 h-2 text-red-500 mt-1 shrink-0" />
              <p className="text-xs text-gray-700 leading-tight line-clamp-1">
                {booking.dropoffAddress}
              </p>
            </div>
          </div>

          {/* Pax + vehicle */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              {booking.passengers} pax
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Car className="w-3 h-3" />
              {VEHICLE_LABELS[booking.vehicleType]}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              STATUS_CHIP[booking.currentStatus]
            }`}
          >
            {STATUS_LABEL[booking.currentStatus]}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </Link>
  );
}
