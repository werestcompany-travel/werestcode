import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { api } from '@/lib/api';
import { colors } from '@/constants/theme';

export default function LookupScreen() {
  const [ref,     setRef]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLookup() {
    if (!ref.trim()) { Alert.alert('Enter a booking reference'); return; }
    setLoading(true);
    try {
      const res  = await api.get('/api/bookings/by-ref', { ref: ref.trim().toUpperCase() });
      if (!res.ok) throw new Error('Booking not found');
      const json = await res.json() as { booking?: { id: string } };
      if (!json.booking?.id) throw new Error('Booking not found');
      router.push({ pathname: '/tracking/[bookingId]', params: { bookingId: json.booking.id } });
    } catch (err) {
      Alert.alert('Not found', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ padding: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.gray[500], fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.gray[900], marginBottom: 6 }}>Track a Booking</Text>
        <Text style={{ color: colors.gray[500], fontSize: 14, marginBottom: 28 }}>Enter your booking reference to track in real time</Text>
        <TextInput
          value={ref}
          onChangeText={setRef}
          placeholder="e.g. WR-123456"
          autoCapitalize="characters"
          style={{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, letterSpacing: 2, backgroundColor: colors.gray[50], marginBottom: 16 }}
        />
        <TouchableOpacity
          onPress={handleLookup}
          disabled={loading}
          style={{ backgroundColor: colors.brand[600], borderRadius: 12, paddingVertical: 15, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
        >
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>Track Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
