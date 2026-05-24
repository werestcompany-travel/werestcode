import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
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
