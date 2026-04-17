'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Ruler, Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface MiniRouteMapProps {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  onRouteInfo?: (distanceKm: number, durationMin: number) => void;
}

export default function MiniRouteMap({
  pickupLat, pickupLng, pickupAddress,
  dropoffLat, dropoffLng, dropoffAddress,
  onRouteInfo,
}: MiniRouteMapProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<google.maps.Map | null>(null);
  const renderer  = useRef<google.maps.DirectionsRenderer | null>(null);

  const [distanceKm,  setDistanceKm]  = useState(0);
  const [durationMin, setDurationMin] = useState(0);
  const [status, setStatus]           = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    if (mapObj.current) return;

    mapObj.current = new google.maps.Map(mapRef.current, {
      zoom: 10,
      center: { lat: pickupLat, lng: pickupLng },
      disableDefaultUI: false,
      gestureHandling: 'cooperative',
      zoomControl: true,
      scrollwheel: true,
      styles: [
        { featureType: 'poi',     elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    renderer.current = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: { strokeColor: '#2534ff', strokeWeight: 3 },
    });
    renderer.current.setMap(mapObj.current);

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin:      { lat: pickupLat,  lng: pickupLng  },
        destination: { lat: dropoffLat, lng: dropoffLng },
        travelMode:  google.maps.TravelMode.DRIVING,
      },
      (result, s) => {
        if (s === google.maps.DirectionsStatus.OK && result) {
          renderer.current!.setDirections(result);
          const leg = result.routes[0].legs[0];
          const km  = (leg.distance?.value ?? 0) / 1000;
          const min = Math.ceil((leg.duration?.value ?? 0) / 60);
          setDistanceKm(km);
          setDurationMin(min);
          setStatus('done');
          onRouteInfo?.(km, min);
        } else {
          setStatus('error');
        }
      },
    );
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, onRouteInfo]);

  return (
    <div className="space-y-3">
      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-100" style={{ height: 260 }}>
        {status === 'loading' && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Stats row */}
      {status === 'done' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-brand-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-brand-600 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500">Distance</p>
              <p className="text-sm font-bold text-gray-900">{distanceKm.toFixed(1)} km</p>
            </div>
          </div>
          <div className="bg-brand-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500">Est. drive time</p>
              <p className="text-sm font-bold text-gray-900">{formatDuration(durationMin)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Route labels */}
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" />
          <p className="text-gray-600 leading-snug line-clamp-2">{pickupAddress}</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-3.5 h-3.5 flex items-center justify-center mt-0.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-100" />
          </div>
          <p className="text-gray-600 leading-snug line-clamp-2">{dropoffAddress}</p>
        </div>
      </div>
    </div>
  );
}
