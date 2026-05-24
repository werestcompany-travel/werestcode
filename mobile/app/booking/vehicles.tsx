import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { colors } from '@/constants/theme';
import { VEHICLE_LABELS, type VehicleType, type PricingResult } from '@/lib/types';

const VEHICLE_EMOJI: Record<VehicleType, string> = { SEDAN: '🚗', SUV: '🚙', MINIVAN: '🚐', LUXURY_MPV: '✨' };
const VEHICLE_CAPACITY: Record<VehicleType, string> = { SEDAN: 'Up to 2 pax', SUV: 'Up to 4 pax', MINIVAN: 'Up to 10 pax', LUXURY_MPV: 'Up to 6 pax' };

export default function VehiclesScreen() {
  const params = useLocalSearchParams<{ pickup: string; dropoff: string; passengers: string; date: string }>();

  const { data: pricing, isLoading, error } = useQuery({
    queryKey: ['pricing', params.pickup, params.dropoff],
    queryFn:  async () => {
      const res  = await api.post('/api/pricing', { pickupAddress: params.pickup, dropoffAddress: params.dropoff, passengers: Number(params.passengers ?? 1) });
      if (!res.ok) throw new Error('Could not load pricing');
      const json = await res.json() as { pricing?: PricingResult[] };
      return json.pricing ?? [];
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', fontSize: 18, color: colors.gray[900] }}>Choose Vehicle</Text>
          <Text style={{ color: colors.gray[500], fontSize: 12 }} numberOfLines={1}>{params.pickup} → {params.dropoff}</Text>
        </View>
      </View>

      {isLoading && <ActivityIndicator style={{ marginTop: 60 }} color={colors.brand[500]} />}
      {error && <Text style={{ color: colors.red[500], textAlign: 'center', marginTop: 40 }}>Could not load pricing. Please try again.</Text>}

      <FlatList
        data={pricing}
        keyExtractor={(i) => i.vehicleType}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/booking/details',
              params: { ...params, vehicleType: item.vehicleType, basePrice: String(item.basePrice), totalPrice: String(item.totalPrice), distanceKm: String(item.distanceKm), durationMin: String(item.durationMin) },
            })}
            style={{ backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[100] }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 32 }}>{VEHICLE_EMOJI[item.vehicleType as VehicleType] ?? '🚗'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: colors.gray[900] }}>{VEHICLE_LABELS[item.vehicleType as VehicleType]}</Text>
                <Text style={{ color: colors.gray[500], fontSize: 13 }}>{VEHICLE_CAPACITY[item.vehicleType as VehicleType]} · {item.distanceKm.toFixed(0)} km · ~{Math.round(item.durationMin / 60)}h {item.durationMin % 60}m</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: '800', fontSize: 18, color: colors.brand[600] }}>฿{item.totalPrice.toLocaleString()}</Text>
                <Text style={{ color: colors.gray[400], fontSize: 11 }}>fixed price</Text>
              </View>
            </View>
            <View style={{ backgroundColor: colors.brand[600], borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
              <Text style={{ color: colors.white, fontWeight: '700' }}>Select</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
