import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { api } from '@/lib/api';
import { colors } from '@/constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'qr' | 'card' | 'cash';

interface PaymentCreateResponse {
  payUrl?: string;
  error?:  string;
}

interface PaymentStatusResponse {
  status?: 'PAID' | 'PENDING' | 'FAILED';
  error?:  string;
}

// ─── Payment method option config ─────────────────────────────────────────────

interface MethodOption {
  id:          PaymentMethod;
  emoji:       string;
  title:       string;
  description: string;
}

const METHOD_OPTIONS: MethodOption[] = [
  { id: 'qr',   emoji: '📱', title: 'QR / PromptPay',    description: 'Scan with any Thai banking app' },
  { id: 'card', emoji: '💳', title: 'Credit / Debit Card', description: 'Visa, Mastercard, JCB' },
  { id: 'cash', emoji: '💵', title: 'Pay at Pickup',       description: 'Cash payment to driver on arrival' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    bookingId:   string;
    serviceName: string;
    date:        string;
    time:        string;
    passengers:  string;
    totalPrice:  string;
  }>();

  const [method,    setMethod]    = useState<PaymentMethod>('qr');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [polling,   setPolling]   = useState(false);
  const [timedOut,  setTimedOut]  = useState(false);

  // Refs for AppState + polling cleanup
  const pollInterval  = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollDeadline  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const appStateRef   = useRef<AppStateStatus>(AppState.currentState);
  const bookingIdRef  = useRef(params.bookingId);

  // Keep bookingId ref in sync (params are stable but this makes TS happy)
  useEffect(() => { bookingIdRef.current = params.bookingId; }, [params.bookingId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // ── Polling helpers ──────────────────────────────────────────────────────

  function stopPolling() {
    if (pollInterval.current)  clearInterval(pollInterval.current);
    if (pollDeadline.current)  clearTimeout(pollDeadline.current);
    pollInterval.current = null;
    pollDeadline.current = null;
  }

  async function checkPaymentStatus() {
    try {
      const res  = await api.get('/api/payment/status', { bookingId: bookingIdRef.current });
      const data = await res.json() as PaymentStatusResponse;
      if (data.status === 'PAID') {
        stopPolling();
        setPolling(false);
        router.replace({ pathname: '/confirmation/[bookingId]', params: { bookingId: bookingIdRef.current } });
      }
    } catch {
      // Silently ignore network errors during polling — will retry next tick
    }
  }

  function startPolling() {
    setPolling(true);
    setTimedOut(false);

    // Poll every 2 seconds
    pollInterval.current = setInterval(checkPaymentStatus, 2000);

    // Stop polling after 30 seconds and show timeout message
    pollDeadline.current = setTimeout(() => {
      stopPolling();
      setPolling(false);
      setTimedOut(true);
    }, 30_000);
  }

  // ── AppState listener: re-poll when app comes to foreground ──────────────

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      // App came back to foreground after being in background / inactive
      if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        if (polling) {
          // Already polling — no-op (interval keeps running)
          return;
        }
        // Re-start polling if we were awaiting payment
        if (!timedOut) {
          startPolling();
        }
      }
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling, timedOut]);

  // ── Pay Now handler ──────────────────────────────────────────────────────

  async function handlePayNow() {
    setError(null);
    setTimedOut(false);

    // Cash / pay-at-pickup: skip payment gateway, go straight to confirmation
    if (method === 'cash') {
      router.replace({ pathname: '/confirmation/[bookingId]', params: { bookingId: params.bookingId } });
      return;
    }

    setLoading(true);
    try {
      const res  = await api.post('/api/payment/create', { bookingId: params.bookingId, method });
      const data = await res.json() as PaymentCreateResponse;

      if (!res.ok || !data.payUrl) {
        throw new Error(data.error ?? 'Could not initiate payment. Please try again.');
      }

      // Open payment URL in browser
      await WebBrowser.openBrowserAsync(data.payUrl, {
        presentationStyle:  WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor:      colors.brand[500],
      });

      // Browser dismissed — start polling for payment confirmation
      startPolling();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const totalPrice = Number(params.totalPrice ?? 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200],
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: '800', fontSize: 18, color: colors.gray[900] }}>Payment</Text>
        </View>

        {/* Error banner */}
        {error && (
          <View style={{ backgroundColor: colors.red[50], borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#fecaca' }}>
            <Text style={{ color: colors.red[600], fontSize: 13, fontWeight: '600' }}>{error}</Text>
          </View>
        )}

        {/* Timeout banner */}
        {timedOut && (
          <View style={{ backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#fde68a' }}>
            <Text style={{ color: '#92400e', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
              Payment verification taking longer than expected.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setTimedOut(false);
                startPolling();
              }}
              style={{ backgroundColor: colors.amber[500], borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start' }}
            >
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 13 }}>Check Status</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Booking summary card */}
        <View style={{ backgroundColor: colors.brand[600], borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 6, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Booking Summary
          </Text>

          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16, marginBottom: 12 }} numberOfLines={2}>
            {params.serviceName ?? 'Your Booking'}
          </Text>

          {[
            ['📅 Date',       params.date       ?? '—'],
            ['⏰ Time',       params.time       ?? '—'],
            ['👥 Passengers', params.passengers ?? '—'],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', marginBottom: 6 }}>
              <Text style={{ width: 110, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{label}</Text>
              <Text style={{ color: colors.white, fontSize: 13, fontWeight: '500' }}>{val}</Text>
            </View>
          ))}

          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', marginTop: 12, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' }}>Total</Text>
            <Text style={{ color: colors.white, fontWeight: '900', fontSize: 24 }}>
              ฿{totalPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Payment method selection */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: colors.gray[900], marginBottom: 12 }}>
          Payment Method
        </Text>

        <View style={{ gap: 10, marginBottom: 28 }}>
          {METHOD_OPTIONS.map((opt) => {
            const selected = method === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setMethod(opt.id)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.white,
                  borderRadius:    14,
                  padding:         16,
                  borderWidth:     selected ? 2 : 1,
                  borderColor:     selected ? colors.brand[500] : colors.gray[200],
                  flexDirection:   'row',
                  alignItems:      'center',
                  gap:             14,
                }}
              >
                {/* Emoji */}
                <Text style={{ fontSize: 28 }}>{opt.emoji}</Text>

                {/* Label */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: colors.gray[900] }}>{opt.title}</Text>
                  <Text style={{ fontSize: 12, color: colors.gray[500], marginTop: 2 }}>{opt.description}</Text>
                </View>

                {/* Radio indicator */}
                <View style={{
                  width:       22, height: 22, borderRadius: 11,
                  borderWidth: selected ? 0 : 2,
                  borderColor: colors.gray[300],
                  backgroundColor: selected ? colors.brand[500] : 'transparent',
                  alignItems:  'center', justifyContent: 'center',
                }}>
                  {selected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white }} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Polling indicator */}
        {polling && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <ActivityIndicator color={colors.brand[500]} />
            <Text style={{ color: colors.gray[600], fontSize: 13 }}>Verifying your payment…</Text>
          </View>
        )}

        {/* Pay Now button */}
        <TouchableOpacity
          onPress={handlePayNow}
          disabled={loading || polling}
          activeOpacity={0.8}
          style={{
            backgroundColor: colors.brand[600],
            borderRadius:    14,
            paddingVertical: 16,
            alignItems:      'center',
            opacity:         loading || polling ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>
              {method === 'cash' ? 'Confirm Booking' : `Pay ฿${totalPrice.toLocaleString()}`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Security note */}
        <Text style={{ textAlign: 'center', color: colors.gray[400], fontSize: 12, marginTop: 14 }}>
          🔒 Secured by Werest · SSL encrypted
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
