'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusTimeline from '@/components/tracking/StatusTimeline';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { BookingDetail, BookingStatus, BookingStatusHistory } from '@/types';
import { formatCurrency, formatDate, VEHICLE_LABELS } from '@/lib/utils';
import { Search, MapPin, Calendar, Clock, Users, Phone, Wifi, WifiOff, Navigation } from 'lucide-react';

// ─── Driver location types ────────────────────────────────────────────────────

interface DriverLocationData {
  available: boolean;
  lat?: number;
  lng?: number;
  heading?: number | null;
  speed?: number | null;
  updatedAt?: string;
}

// ─── Statuses where driver map should show ────────────────────────────────────

const DRIVER_ACTIVE_STATUSES: BookingStatus[] = ['DRIVER_STANDBY', 'DRIVER_PICKED_UP'];

// ─── Declare Google Maps types on window ──────────────────────────────────────

declare global {
  interface Window {
    google: typeof google;
    initDriverMap: () => void;
  }
}

// ─── Driver Map sub-component ─────────────────────────────────────────────────

function DriverMap({
  booking,
  mapsReady,
}: {
  booking: BookingDetail;
  mapsReady: boolean;
}) {
  const mapRef       = useRef<HTMLDivElement>(null);
  const gMapRef      = useRef<google.maps.Map | null>(null);
  const driverMarker = useRef<google.maps.Marker | null>(null);
  const pickupMarker = useRef<google.maps.Marker | null>(null);
  const dropoffMarker = useRef<google.maps.Marker | null>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const [driverLoc, setDriverLoc] = useState<DriverLocationData | null>(null);
  const [locError, setLocError]   = useState(false);

  // ── Fetch latest driver location ──────────────────────────────────────────
  const fetchDriverLocation = useCallback(async () => {
    try {
      const res  = await fetch(`/api/bookings/${booking.id}/driver-location`);
      const json = await res.json();
      if (json.success) {
        setDriverLoc(json.data);
        setLocError(false);
      }
    } catch {
      setLocError(true);
    }
  }, [booking.id]);

  // Poll every 10s
  useEffect(() => {
    fetchDriverLocation();
    pollRef.current = setInterval(fetchDriverLocation, 10_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchDriverLocation]);

  // ── Initialise map once Maps SDK is ready ─────────────────────────────────
  useEffect(() => {
    if (!mapsReady || !mapRef.current || !window.google) return;

    const center = { lat: booking.pickupLat, lng: booking.pickupLng };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });
    gMapRef.current = map;

    // Pickup marker — green
    pickupMarker.current = new window.google.maps.Marker({
      position: { lat: booking.pickupLat, lng: booking.pickupLng },
      map,
      title: 'Pickup: ' + booking.pickupAddress,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    });

    // Dropoff marker — red
    dropoffMarker.current = new window.google.maps.Marker({
      position: { lat: booking.dropoffLat, lng: booking.dropoffLng },
      map,
      title: 'Dropoff: ' + booking.dropoffAddress,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    });

    // Fit bounds to show both
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: booking.pickupLat, lng: booking.pickupLng });
    bounds.extend({ lat: booking.dropoffLat, lng: booking.dropoffLng });
    map.fitBounds(bounds, 60);
  }, [mapsReady, booking]);

  // ── Update driver marker when location changes ────────────────────────────
  useEffect(() => {
    if (!gMapRef.current || !mapsReady || !window.google) return;
    if (!driverLoc?.available || !driverLoc.lat || !driverLoc.lng) return;

    const pos = { lat: driverLoc.lat, lng: driverLoc.lng };

    if (driverMarker.current) {
      driverMarker.current.setPosition(pos);
    } else {
      driverMarker.current = new window.google.maps.Marker({
        position: pos,
        map: gMapRef.current,
        title: 'Your Driver',
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#2534ff',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          rotation: driverLoc.heading ?? 0,
        },
        zIndex: 100,
      });
    }

    // Update rotation if heading available
    if (driverMarker.current && driverLoc.heading !== null && driverLoc.heading !== undefined) {
      const icon = driverMarker.current.getIcon() as google.maps.Symbol;
      driverMarker.current.setIcon({ ...icon, rotation: driverLoc.heading });
    }
  }, [driverLoc, mapsReady]);

  const statusText =
    booking.currentStatus === 'DRIVER_STANDBY'
      ? 'Driver is on the way'
      : 'Driver has your passenger';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* Status banner */}
      <div className="flex items-center gap-3 px-5 py-3 bg-brand-50 border-b border-brand-100">
        <Navigation className="w-4 h-4 text-brand-600 shrink-0" />
        <p className="text-sm font-semibold text-brand-800">{statusText}</p>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* Map */}
      <div ref={mapRef} className="h-64 w-full bg-gray-100" />

      {/* Driver location status */}
      <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
        {locError ? (
          'Unable to fetch driver location — retrying…'
        ) : driverLoc?.available && driverLoc.updatedAt ? (
          <>
            Driver position updated{' '}
            {Math.round(
              (Date.now() - new Date(driverLoc.updatedAt).getTime()) / 1000,
            )}
            s ago
          </>
        ) : (
          'Driver location will appear once they begin the trip'
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() { return <Suspense><TrackingPageInner /></Suspense>; }

function TrackingPageInner() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') ?? '';

  const [ref,        setRef]        = useState(initialRef);
  const [booking,    setBooking]    = useState<BookingDetail | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [live,       setLive]       = useState(false);   // SSE connected?
  const [mapsReady,  setMapsReady]  = useState(false);

  const esRef = useRef<EventSource | null>(null);

  // ── SSE subscription ────────────────────────────────────────────────────
  const subscribeToUpdates = (bookingId: string) => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    const es = new EventSource(`/api/bookings/${bookingId}/stream`);
    esRef.current = es;

    es.addEventListener('status', (e) => {
      const payload = JSON.parse(e.data) as {
        status: BookingStatus;
        history: BookingStatusHistory[];
      };
      setBooking(prev =>
        prev
          ? { ...prev, currentStatus: payload.status, statusHistory: payload.history }
          : prev,
      );
      setLive(true);
    });

    es.addEventListener('close', () => {
      es.close();
      esRef.current = null;
      setLive(false);
    });

    es.onerror = () => {
      setLive(false);
      // EventSource auto-reconnects — just reflect the offline state briefly
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { esRef.current?.close(); };
  }, []);

  // ── Fetch booking once ──────────────────────────────────────────────────
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ref.trim()) { setError('Please enter your booking reference'); return; }
    setError('');
    setLoading(true);

    // Close any existing SSE stream
    esRef.current?.close();
    esRef.current = null;
    setLive(false);

    try {
      const res  = await fetch(`/api/bookings/track?ref=${encodeURIComponent(ref.trim().toUpperCase())}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Booking not found');
      setBooking(json.data);
      // Open live SSE connection for the found booking
      subscribeToUpdates(json.data.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking not found');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if ref pre-filled
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialRef) handleSearch(); }, []);

  const showDriverMap =
    booking !== null && DRIVER_ACTIVE_STATUSES.includes(booking.currentStatus);

  return (
    <>
      {/* Google Maps JS API — loaded lazily only when a booking is found */}
      {booking && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
          strategy="afterInteractive"
          onLoad={() => setMapsReady(true)}
        />
      )}
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Track Your Booking</h1>
            <p className="text-gray-500 mt-2 text-sm">Enter your booking reference to see real-time status</p>
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-left text-xs text-blue-700 space-y-1">
              <p className="font-semibold">📧 Where is my booking reference?</p>
              <p>Your reference number (e.g. <span className="font-mono font-bold">WR-240501-1234</span>) was included in your booking confirmation email. Check your inbox — it was sent immediately after you completed your booking.</p>
            </div>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. WR-240501-1234"
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
                className="input-base pl-10 font-mono tracking-wider uppercase"
              />
            </div>
            <Button type="submit" loading={loading}>Track</Button>
          </form>

          {error && (
            <div className="space-y-3 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {error}
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-800 mb-1">Can&apos;t find your booking?</p>
                <p className="mb-3">Double-check the reference in your confirmation email, or contact our team — we&apos;ll look it up for you.</p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}?text=Hi%20Werest%2C%20I%20need%20help%20finding%20my%20booking`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#22c55e] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.126 1.533 5.861L.057 23.945 6.313 22.5A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 01-5.031-1.388l-.36-.214-3.733.978.996-3.648-.235-.374A9.773 9.773 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          )}

          {booking && (
            <div className="space-y-5 animate-fade-in">
              {/* Header */}
              <div className="bg-brand-700 text-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-brand-200 text-xs font-medium">Booking Reference</p>
                  <div className="flex items-center gap-2">
                    {/* Live indicator */}
                    <span
                      title={live ? 'Live updates active' : 'Connecting…'}
                      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        live ? 'bg-green-500/25 text-green-300' : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {live
                        ? <><Wifi className="w-3 h-3" /> Live</>
                        : <><WifiOff className="w-3 h-3" /> Connecting…</>
                      }
                    </span>
                    <StatusBadge status={booking.currentStatus} className="bg-white/20 text-white" />
                  </div>
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

              {/* Live driver map — visible when driver is en-route or has picked up */}
              {showDriverMap && (
                <DriverMap booking={booking} mapsReady={mapsReady} />
              )}

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
