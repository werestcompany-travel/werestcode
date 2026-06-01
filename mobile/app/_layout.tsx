import { Stack, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { getStoredToken } from '@/lib/auth';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import * as Notifications from 'expo-notifications';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const { setToken, setUser, setReady } = useAuthStore();
  const prevTokenRef = useRef<string | null | undefined>(undefined);

  // Navigate to login when auth state changes to unauthenticated
  useEffect(() => {
    const unsub = useAuthStore.subscribe((state) => {
      if (prevTokenRef.current !== undefined && prevTokenRef.current !== null && state.token === null && state.isReady) {
        router.replace('/(auth)/login');
      }
      prevTokenRef.current = state.token;
    });
    return unsub;
  }, []);

  useEffect(() => {
    // Rehydrate auth on boot
    getStoredToken().then(async (token) => {
      if (token) {
        setToken(token);
        try {
          const res = await api.get('/api/user/me');
          if (res.ok) {
            const data = await res.json() as { user: Parameters<typeof setUser>[0] };
            setUser(data.user);
            // Register for push notifications after successful auth
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
              const pushToken = await Notifications.getExpoPushTokenAsync();
              api.post('/api/push/expo-token', { token: pushToken.data, platform: Platform.OS });
            }
          }
        } catch { /* ignore */ }
      }
      setReady();
    });
  }, [setToken, setUser, setReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
