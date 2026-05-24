import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { api } from '@/lib/api';
import { colors } from '@/constants/theme';
import { STATUS_LABELS, type BookingStatus, type BookingDetail, type DriverLocation } from '@/lib/types';

export default function TrackingScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const mapRef = useRef<MapView>(null);

  const { data: booking } = useQuery({
    queryKey: ['booking-track', bookingId],
    queryFn:  async () => {
      const res  = await api.get(`/api/bookings/${bookingId}`);
      const json = await res.json() as { data?: BookingDetail; booking?: BookingDetail };
      return json.data ?? json.booking;
    },
    staleTime: 30_000,
  });

  const { data: location } = useQuery({
    queryKey: ['driver-location', bookingId],
    queryFn:  async () => {
      const res  = await api.get(`/api/bookings/${bookingId}/driver-location`);
      const json = await res.json() as DriverLocation;
      return json;
    },
    refetchInterval: 10_000,
    enabled: !!bookingId && booking?.currentStatus !== 'COMPLETED' && booking?.currentStatus !== 'CANCELLED',
  });

  const pickupLat  = 13.6900; // Default Bangkok area; real app would have lat/lng from booking
  const pickupLng  = 100.7501;
  const dropoffLat = 12.9236;
  const dropoffLng = 100.8824;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[100] }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', fontSize: 17, color: colors.gray[900] }}>Live Tracking</Text>
          {booking && <Text style={{ color: colors.gray[500], fontSize: 12 }}>{booking.bookingRef}</Text>}
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{ latitude: 13.0, longitude: 101.0, latitudeDelta: 8, longitudeDelta: 8 }}
      >
        <Marker coordinate={{ latitude: pickupLat, longitude: pickupLng }} title="Pickup" pinColor="green" />
        <Marker coordinate={{ latitude: dropoffLat, longitude: dropoffLng }} title="Drop-off" pinColor="red" />
        {location?.available && location.lat && location.lng && (
          <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} title="Your Driver">
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.white }}>
              <Text style={{ fontSize: 14 }}>🚗</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Status card */}
      <View style={{ backgroundColor: colors.white, padding: 16, borderTopWidth: 1, borderTopColor: colors.gray[100] }}>
        {booking ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: '700', fontSize: 15, color: colors.brand[600] }}>
                {STATUS_LABELS[booking.currentStatus as BookingStatus] ?? booking.currentStatus}
              </Text>
              <Text style={{ color: colors.gray[500], fontSize: 12, marginTop: 2 }} numberOfLines={1}>{booking.pickupAddress}</Text>
            </View>
            {location?.available && <View style={{ backgroundColor: colors.green[50], borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: colors.green[600], fontSize: 12, fontWeight: '600' }}>Driver online</Text>
            </View>}
          </View>
        ) : <ActivityIndicator color={colors.brand[500]} />}
      </View>
    </SafeAreaView>
  );
}
