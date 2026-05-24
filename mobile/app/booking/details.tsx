import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { api } from '@/lib/api';
import { colors } from '@/constants/theme';

export default function BookingDetailsScreen() {
  const params = useLocalSearchParams<{ pickup: string; dropoff: string; date: string; passengers: string; vehicleType: string; totalPrice: string; durationMin: string }>();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [notes,    setNotes]    = useState('');
  const [discount, setDiscount] = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleBook() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Missing info', 'Name, email and phone are required.'); return;
    }
    setLoading(true);
    try {
      const res  = await api.post('/api/bookings', {
        pickupAddress:  params.pickup,
        dropoffAddress: params.dropoff,
        pickupDate:     params.date,
        pickupTime:     '09:00',
        passengers:     Number(params.passengers ?? 1),
        luggage:        1,
        vehicleType:    params.vehicleType,
        customerName:   name.trim(),
        customerEmail:  email.trim().toLowerCase(),
        customerPhone:  phone.trim(),
        specialRequests: notes.trim() || undefined,
        discountCode:   discount.trim() || undefined,
      });
      const data = await res.json() as { booking?: { id: string } };
      if (!res.ok || !data.booking?.id) throw new Error('Booking failed');
      router.replace({ pathname: '/confirmation/[bookingId]', params: { bookingId: data.booking.id } });
    } catch (err) {
      Alert.alert('Booking failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: '800', fontSize: 18, color: colors.gray[900] }}>Booking Details</Text>
        </View>

        {/* Route summary */}
        <View style={{ backgroundColor: colors.brand[600], borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 4 }}>Route</Text>
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{params.pickup}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginVertical: 2 }}>↓</Text>
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{params.dropoff}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{params.date} · {params.passengers} pax · {params.vehicleType}</Text>
            <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>฿{Number(params.totalPrice).toLocaleString()}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: colors.gray[900], marginBottom: 4 }}>Your Details</Text>
          {([
            { val: name,     set: setName,     ph: 'Full name *',      kb: 'default' as const },
            { val: email,    set: setEmail,    ph: 'Email address *',  kb: 'email-address' as const },
            { val: phone,    set: setPhone,    ph: 'Phone / WhatsApp *', kb: 'phone-pad' as const },
          ]).map((f) => (
            <TextInput key={f.ph} value={f.val} onChangeText={f.set} placeholder={f.ph} keyboardType={f.kb} autoCapitalize={f.kb === 'email-address' ? 'none' : 'words'}
              style={{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: colors.gray[50] }} />
          ))}
          <TextInput value={notes} onChangeText={setNotes} placeholder="Flight number, special requests…" multiline numberOfLines={2}
            style={{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: colors.gray[50], minHeight: 60 }} />
        </View>

        {/* Discount */}
        <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.gray[900], marginBottom: 8 }}>Discount Code</Text>
          <TextInput value={discount} onChangeText={setDiscount} placeholder="Enter code (optional)" autoCapitalize="characters"
            style={{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: colors.gray[50] }} />
        </View>

        <TouchableOpacity onPress={handleBook} disabled={loading} style={{ backgroundColor: colors.brand[600], borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: loading ? 0.7 : 1 }}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>Confirm Booking</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
