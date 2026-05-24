import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { colors } from '@/constants/theme';
import { STATUS_LABELS, type BookingStatus, type BookingDetail } from '@/lib/types';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

async function registerExpoPushToken() {
  if (!Device.isDevice) return;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    const finalStatus = existing === 'granted' ? 'granted' : (await Notifications.requestPermissionsAsync()).status;
    if (finalStatus !== 'granted') return;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await api.post('/api/push/expo-token', { token, platform: Device.osName?.toLowerCase() ?? 'unknown' });
  } catch { /* ignore */ }
}

export default function ConfirmationScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn:  async () => {
      const res = await api.get(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error('Not found');
      const json = await res.json() as { data?: BookingDetail; booking?: BookingDetail };
      return json.data ?? json.booking;
    },
  });

  useEffect(() => { registerExpoPushToken(); }, []);

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.brand[500]} /></SafeAreaView>;
  if (!booking) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}><Text>Booking not found</Text></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Success header */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 36 }}>✅</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '900', color: colors.gray[900] }}>Booking Confirmed!</Text>
        </View>

        {/* Booking ref card */}
        <View style={{ backgroundColor: colors.brand[700], borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>Booking Reference</Text>
          <Text style={{ color: colors.white, fontWeight: '900', fontSize: 32, letterSpacing: 2 }}>{booking.bookingRef}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 }}>Save this ID to track your booking</Text>
        </View>

        {/* Status */}
        <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.gray[900], marginBottom: 8 }}>Status</Text>
          <Text style={{ color: colors.brand[600], fontWeight: '600' }}>{STATUS_LABELS[booking.currentStatus as BookingStatus] ?? booking.currentStatus}</Text>
        </View>

        {/* Route */}
        <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.gray[900], marginBottom: 12 }}>Trip Details</Text>
          {[
            ['📍 Pickup',   booking.pickupAddress],
            ['🏁 Drop-off', booking.dropoffAddress],
            ['📅 Date',     booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
            ['⏰ Time',     booking.pickupTime ?? '—'],
            ['👥 Pax',      String(booking.passengers)],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ width: 90, color: colors.gray[500], fontSize: 13 }}>{label}</Text>
              <Text style={{ flex: 1, color: colors.gray[900], fontSize: 13, fontWeight: '500' }} numberOfLines={2}>{val}</Text>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.gray[100], paddingTop: 12, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', fontSize: 15 }}>Total</Text>
              <Text style={{ fontWeight: '900', fontSize: 16, color: colors.brand[700] }}>฿{booking.totalPrice.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/tracking/[bookingId]', params: { bookingId: booking.id } })}
            style={{ backgroundColor: colors.brand[600], borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
          >
            <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>Track My Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Share.share({ message: `My Werest booking ${booking.bookingRef} — Track at https://werest.com/tracking?ref=${booking.bookingRef}` })}
            style={{ backgroundColor: colors.white, borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: colors.gray[200] }}
          >
            <Text style={{ color: colors.gray[700], fontWeight: '700', fontSize: 15 }}>Share Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ color: colors.gray[400], fontSize: 14 }}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
