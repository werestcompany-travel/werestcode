'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Clock, Ruler } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface RouteMapProps {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  onRouteCalculated?: (distanceKm: number, durationMin: number) => void;
}

interface RouteState {
  distanceKm: number;
  durationMin: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export default function RouteMap({
  pickupLat, pickupLng, pickupAddress,
  dropoffLat, dropoffLng, dropoffAddress,
  onRouteCalculated,
}: RouteMapProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<google.maps.Map | null>(null);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const [route, setRoute] = useState<RouteState>({ distanceKm: 0, durationMin: 0, status: 'idle' });

  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    if (mapObj.current) return; // already initialised

    mapObj.current = new google.maps.Map(mapRef.current, {
      zoom: 10,
      center: { lat: pickupLat, lng: pickupLng },
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    rendererRef.current = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: { strokeColor: '#0d9488', strokeWeight: 4 },
    });
    rendererRef.current.setMap(mapObj.current);
  }, [pickupLat, pickupLng]);

  useEffect(() => {
    if (!window.google || !mapObj.current || !rendererRef.current) return;

    setRoute({ distanceKm: 0, durationMin: 0, status: 'loading' });

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin:      { lat: pickupLat,  lng: pickupLng  },
        destination: { lat: dropoffLat, lng: dropoffLng },
        travelMode:  google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(Date.now() + 60 * 60 * 1000),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          rendererRef.current!.setDirections(result);
          const leg = result.routes[0].legs[0];
          const distanceKm = (leg.distance?.value ?? 0) / 1000;
          const durationMin = Math.ceil(
            ((leg.duration_in_traffic?.value ?? leg.duration?.value ?? 0) / 60),
          );
          setRoute({ distanceKm, durationMin, status: 'success' });
          onRouteCalculated?.(distanceKm, durationMin);
        } else {
          setRoute({ distanceKm: 0, durationMin: 0, status: 'error', error: 'Could not calculate route' });
        }
      },
    );
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, onRouteCalculated]);

  return (
    <div className="flex flex-col gap-4">
      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-card" style={{ height: 320 }}>
        {route.status === 'loading' && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Route stats */}
      {route.status === 'success' && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <StatCard
            icon={<Ruler className="w-4 h-4 text-brand-600" />}
            label="Distance"
            value={`${route.distanceKm.toFixed(1)} km`}
          />
          <StatCard
            icon={<Clock className="w-4 h-4 text-brand-600" />}
            label="Est. travel time"
            value={formatDuration(route.durationMin)}
            sub="with traffic"
          />
        </div>
      )}

      {/* Route summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2.5">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pickup</p>
            <p className="text-gray-700 font-medium leading-snug">{pickupAddress}</p>
          </div>
        </div>
        <div className="ml-2 border-l-2 border-dashed border-gray-200 pl-4 py-0.5">
          <p className="text-xs text-gray-400">Private Transfer Route</p>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0 w-4 h-4 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-100" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Drop-off</p>
            <p className="text-gray-700 font-medium leading-snug">{dropoffAddress}</p>
          </div>
        </div>
      </div>

      {route.status === 'error' && (
        <p className="text-red-500 text-sm">{route.error}</p>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-brand-50 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-900 text-base">{value}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
