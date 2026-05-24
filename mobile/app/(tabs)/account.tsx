import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { colors } from '@/constants/theme';

const TIER_COLORS: Record<string, string> = { EXPLORER: '#6b7280', ADVENTURER: '#16a34a', NAVIGATOR: '#2534ff', VOYAGER: '#d97706' };
const TIER_EMOJI:  Record<string, string> = { EXPLORER: '🌱', ADVENTURER: '🧭', NAVIGATOR: '⭐', VOYAGER: '👑' };

export default function AccountScreen() {
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.gray[900], marginBottom: 8 }}>Sign in to your account</Text>
        <Text style={{ color: colors.gray[500], marginBottom: 28, textAlign: 'center' }}>Access your bookings, loyalty points, and profile.</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ backgroundColor: colors.brand[600], borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14, marginBottom: 12 }}>
          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={{ color: colors.brand[600], fontWeight: '600', fontSize: 14 }}>Create account</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const tierColor = TIER_COLORS[user.tierLevel] ?? colors.gray[500];
  const tierEmoji = TIER_EMOJI[user.tierLevel] ?? '🌱';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profile card */}
        <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.gray[100] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.brand[500], alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.white, fontWeight: '900', fontSize: 24 }}>{user.name[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', fontSize: 18, color: colors.gray[900] }}>{user.name}</Text>
              <Text style={{ color: colors.gray[500], fontSize: 13, marginTop: 2 }}>{user.email}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Text>{tierEmoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: tierColor }}>{user.tierLevel}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Loyalty */}
        <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.gray[100] }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: colors.gray[900], marginBottom: 12 }}>Loyalty Points</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: colors.brand[600] }}>{user.loyaltyPoints.toLocaleString()}</Text>
            <Text style={{ color: colors.gray[400], fontSize: 13 }}>points</Text>
          </View>
          <Text style={{ color: colors.gray[500], fontSize: 12, marginTop: 4 }}>1 point = ฿1 discount on future bookings</Text>
        </View>

        {/* Actions */}
        <View style={{ backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.gray[100], overflow: 'hidden', marginBottom: 16 }}>
          {[
            { label: 'My Bookings', emoji: '📋', onPress: () => router.push('/(tabs)/bookings') },
            { label: 'Track a Booking', emoji: '📍', onPress: () => router.push('/tracking/lookup') },
          ].map((item, i) => (
            <TouchableOpacity key={item.label} onPress={item.onPress} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i === 0 ? 1 : 0, borderBottomColor: colors.gray[100] }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>{item.emoji}</Text>
              <Text style={{ flex: 1, fontSize: 15, color: colors.gray[900] }}>{item.label}</Text>
              <Text style={{ color: colors.gray[400] }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={async () => { await logout(); router.replace('/(auth)/login'); }}
          style={{ backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.gray[100] }}
        >
          <Text style={{ color: colors.red[600], fontWeight: '700', fontSize: 15 }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
