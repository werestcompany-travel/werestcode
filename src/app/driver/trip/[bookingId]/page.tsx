'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Users,
  Car,
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle,
  Radio,
} from 'lucide-react';
import { BookingStatus, VehicleType } from '@/types';
import { VEHICLE_LABELS } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripBooking {
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

// ─── Status flow for driver ───────────────────────────────────────────────────

const STATUS_FLOW: BookingStatus[] = [
  'DRIVER_STANDBY',
  'DRIVER_PICKED_UP',
  'COMPLETED',
];

const STATUS_ACTION_LABEL: Partial<Record<BookingStatus, string>> = {
  DRIVER_STANDBY:   'Mark as Driver Standby',
  DRIVER_PICKED_UP: 'Mark as Picked Up',
  COMPLETED:        'Mark Trip Completed',
};

const STATUS_CHIP_STYLE: Record<BookingStatus, string> = {
  PENDING:          'bg-yellow-100 text-yellow-800',
  DRIVER_CONFIRMED: 'bg-blue-100 text-blue-800',
  DRIVER_STANDBY:   'bg-indigo-100 text-indigo-800',
  DRIVER_PICKED_UP: 'bg-purple-100 text-purple-800',
  COMPLETED:        'bg-green-100 text-green-800',
  CANCELLED:        'bg-red-100 text-red-800',
};

const STATUS_CHIP_LABEL: Record<BookingStatus, string> = {
  PENDING:          'Pending',
  DRIVER_CONFIRMED: 'Confirmed',
  DRIVER_STANDBY:   'Standby',
  DRIVER_PICKED_UP: 'Picked Up',
  COMPLETED:        'Completed',
  CANCELLED:        'Cancelled',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TripDetailPage() {
  const router    = useRouter();
  const { bookingId } = useParams<{ bookingId: string }>();

  const [booking, setBooking]           = useState<TripBooking | null>(null);
  const [loading, setLoading]           = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [error, setError]               = useState('');
  const [toast, setToast]               = useState('');

  const watchIdRef   = useRef<number | null>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLatRef   = useRef<number | null>(null);
  const lastLngRef   = useRef<number | null>(null);
  const lastHeadingRef = useRef<number | null>(null);
  const lastSpeedRef   = useRef<number | null>(null);

  const getToken = () => localStorage.getItem('driver_token');

  // ── Load booking ──────────────────────────────────────────────────────────
  const loadBooking = useCallback(async () => {
    const token = getToken();
    if (!token) { router.replace('/driver/login'); return; }

    try {
      // Fetch from driver bookings and filter by ID
      const res = await fetch('/api/driver/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('driver_token');
        router.replace('/driver/login');
        return;
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const found = (json.data as TripBooking[]).find(b => b.id === bookingId);
      if (!found) {
        setError('Booking not found or not assigned to you');
      } else {
        setBooking(found);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [bookingId, router]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopLocationSharing();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Location sharing helpers ──────────────────────────────────────────────

  const sendLocation = async () => {
    if (lastLatRef.current === null || lastLngRef.current === null) return;
    const token = getToken();
    if (!token) return;

    try {
      await fetch('/api/driver/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          lat: lastLatRef.current,
          lng: lastLngRef.current,
          heading: lastHeadingRef.current,
          speed: lastSpeedRef.current,
        }),
      });
    } catch {
      // Silent — will retry on next interval
    }
  };

  const startLocationSharing = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported on this device');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        lastLatRef.current     = pos.coords.latitude;
        lastLngRef.current     = pos.coords.longitude;
        lastHeadingRef.current = pos.coords.heading;
        lastSpeedRef.current   = pos.coords.speed
          ? pos.coords.speed * 3.6 // m/s → km/h
          : null;
      },
      err => {
        console.warn('Geolocation error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000 },
    );

    // Send every 15 seconds
    intervalRef.current = setInterval(sendLocation, 15_000);
    // Send immediately
    sendLocation();

    setLocationSharing(true);
    showToast('Location sharing started');
  };

  const stopLocationSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLocationSharing(false);
  };

  const toggleLocationSharing = () => {
    if (locationSharing) {
      stopLocationSharing();
      showToast('Location sharing stopped');
    } else {
      startLocationSharing();
    }
  };

  // ── Status update ─────────────────────────────────────────────────────────

  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    if (!booking) return;
    setStatusLoading(true);
    const token = getToken();

    try {
      const res = await fetch(`/api/driver/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      setBooking(prev => prev ? { ...prev, currentStatus: newStatus } : prev);
      showToast(`Status updated to ${STATUS_CHIP_LABEL[newStatus]}`);

      if (newStatus === 'COMPLETED') {
        stopLocationSharing();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Toast helper ──────────────────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ─── Render states ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2534ff]">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-6">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-semibold text-gray-700">{error || 'Booking not found'}</p>
        <Link
          href="/driver"
          className="bg-[#2534ff] text-white text-sm font-semibold px-6 py-2.5 rounded-xl"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Determine next status action
  const currentIdx  = STATUS_FLOW.indexOf(booking.currentStatus);
  const nextStatus  = currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : null;
  const currentAction = nextStatus ? STATUS_ACTION_LABEL[nextStatus] : null;

  const isCompleted = booking.currentStatus === 'COMPLETED';
  const isCancelled = booking.currentStatus === 'CANCELLED';

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* Top bar */}
      <div className="bg-[#2534ff] px-5 pt-12 pb-5 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/driver"
            className="p-1.5 rounded-xl bg-white/20 active:bg-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <p className="text-blue-200 text-xs">Trip Detail</p>
            <p className="font-black text-lg tracking-wide">{booking.bookingRef}</p>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              STATUS_CHIP_STYLE[booking.currentStatus]
            }`}
          >
            {STATUS_CHIP_LABEL[booking.currentStatus]}
          </span>
        </div>

        {/* Schedule */}
        <div className="bg-white/15 rounded-xl px-4 py-3 flex items-center gap-3">
          <Car className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-base">{booking.pickupTime}</p>
            <p className="text-blue-200 text-xs">
              {VEHICLE_LABELS[booking.vehicleType]} · {booking.passengers} pax
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4 mt-4">
        {/* Route card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="w-0.5 h-6 bg-gray-200" />
              <MapPin className="w-3 h-3 text-red-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium">Pickup</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {booking.pickupAddress}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Drop-off</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {booking.dropoffAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium mb-1">Customer</p>
          <p className="font-bold text-gray-900">{booking.customerName}</p>
          <div className="flex items-center gap-2 mt-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{booking.passengers} passengers</span>
          </div>
          {booking.specialNotes && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <p className="text-xs font-semibold text-amber-800 mb-0.5">Special Notes</p>
              <p className="text-xs text-amber-700">{booking.specialNotes}</p>
            </div>
          )}
        </div>

        {/* Map placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center px-4">
            <Navigation className="w-8 h-8 text-[#2534ff] mb-2" />
            <p className="text-sm font-semibold text-gray-700">Navigation</p>
            <p className="text-xs text-gray-400 mt-1">Full map available in next update</p>
          </div>
        </div>

        {/* Location sharing */}
        {!isCompleted && !isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Share My Location</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {locationSharing
                    ? 'GPS is broadcasting to customer'
                    : 'Customer sees your live position'}
                </p>
              </div>
              <button
                onClick={toggleLocationSharing}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                  locationSharing ? 'bg-[#2534ff]' : 'bg-gray-200'
                }`}
                aria-label="Toggle location sharing"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    locationSharing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {locationSharing && (
              <div className="mt-3 flex items-center gap-2 text-xs text-[#2534ff] font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Broadcasting GPS every 15 seconds
              </div>
            )}
          </div>
        )}

        {/* Call customer */}
        <a
          href={`tel:${booking.customerPhone}`}
          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm"
        >
          <Phone className="w-4 h-4" />
          Call Customer
        </a>

        {/* Status update buttons */}
        {!isCompleted && !isCancelled && (
          <div className="space-y-2">
            {/* Primary: advance to next status */}
            {currentAction && nextStatus && (
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={statusLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#2534ff] hover:bg-[#1a24e0] active:bg-[#1520c0] text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-60 text-sm"
              >
                {statusLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {currentAction}
              </button>
            )}

            {/* If status hasn't started yet, show standby button */}
            {booking.currentStatus === 'DRIVER_CONFIRMED' && (
              <button
                onClick={() => handleStatusUpdate('DRIVER_STANDBY')}
                disabled={statusLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#2534ff] hover:bg-[#1a24e0] text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-60 text-sm"
              >
                {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Car className="w-4 h-4" />}
                Driver Standby — I&apos;ve Arrived
              </button>
            )}

            {booking.currentStatus === 'PENDING' && (
              <button
                onClick={() => handleStatusUpdate('DRIVER_STANDBY')}
                disabled={statusLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#2534ff] hover:bg-[#1a24e0] text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-60 text-sm"
              >
                {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Car className="w-4 h-4" />}
                Start — I&apos;m on Standby
              </button>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-2xl py-4 text-green-700 font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
            Trip Completed
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </main>
  );
}
