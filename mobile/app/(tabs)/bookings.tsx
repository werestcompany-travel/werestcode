import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { colors } from '@/constants/theme';
import type { BookingListItem, BookingStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/types';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  PENDING:          { bg: '#fffbeb', text: '#92400e' },
  DRIVER_CONFIRMED: { bg: '#eff6ff', text: '#1d4ed8' },
  DRIVER_STANDBY:   { bg: '#eef2ff', text: '#4338ca' },
  DRIVER_PICKED_UP: { bg: '#eef0ff', text: '#2534ff' },
  COMPLETED:        { bg: '#f0fdf4', text: '#166534' },
  CANCELLED:        { bg: '#fef2f2', text: '#991b1b' },
};

function BookingCard({ item }: { item: BookingListItem }) {
  const sc = STATUS_COLORS[item.status as BookingStatus] ?? { bg: colors.gray[100], text: colors.gray[600] };
  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/confirmation/[bookingId]', params: { bookingId: item.id } })}
      style={{ backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[100] }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontWeight: '700', fontSize: 15, color: colors.gray[900] }}>{item.bookingRef}</Text>
        <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: sc.text }}>{STATUS_LABELS[item.status as BookingStatus] ?? item.status}</Text>
        </View>
      </View>
      <Text style={{ color: colors.gray[600], fontSize: 13 }} numberOfLines={1}>{item.serviceName}</Text>
      <Text style={{ color: colors.gray[400], fontSize: 12, marginTop: 4 }}>{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
      <Text style={{ color: colors.brand[600], fontWeight: '700', fontSize: 14, marginTop: 6 }}>฿{item.price.toLocaleString()}</Text>
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const user   = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn:  async () => {
      const res  = await api.get('/api/user/bookings');
      if (!res.ok) return [];
      const json = await res.json() as { bookings?: BookingListItem[] };
      return json.bookings ?? [];
    },
    enabled: !!user,
  });

  const now    = new Date();
  const items  = (data ?? []).filter((b) => {
    const d = new Date(b.date);
    return tab === 'upcoming' ? d >= now : d < now;
  });

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.gray[900], marginBottom: 8 }}>Sign in to see your bookings</Text>
        <Text style={{ color: colors.gray[500], marginBottom: 24, textAlign: 'center' }}>Track all your Werest transfers and tours in one place.</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ backgroundColor: colors.brand[600], borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 }}>
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.gray[900], marginBottom: 16 }}>My Bookings</Text>
        <View style={{ flexDirection: 'row', backgroundColor: colors.gray[100], borderRadius: 12, padding: 4 }}>
          {(['upcoming', 'past'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: tab === t ? colors.white : 'transparent', alignItems: 'center' }}>
              <Text style={{ fontWeight: '600', fontSize: 13, color: tab === t ? colors.gray[900] : colors.gray[500] }}>{t === 'upcoming' ? 'Upcoming' : 'Past'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.brand[500]} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <BookingCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand[500]} />}
          ListEmptyComponent={
            <EmptyState
              icon="🗓️"
              title={tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
              subtitle="Your confirmed transfers and tours will appear here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
