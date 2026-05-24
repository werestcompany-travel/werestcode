import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { colors } from '@/constants/theme';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? colors.brand[600] : colors.gray[400], fontWeight: focused ? '700' : '400', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: { borderTopColor: colors.gray[100], height: 65, paddingBottom: 8 } }}>
      <Tabs.Screen name="index"    options={{ tabBarIcon: ({ focused }) => <TabIcon label="Search"   emoji="🔍" focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Bookings" emoji="📋" focused={focused} /> }} />
      <Tabs.Screen name="account"  options={{ tabBarIcon: ({ focused }) => <TabIcon label="Account"  emoji="👤" focused={focused} /> }} />
    </Tabs>
  );
}
