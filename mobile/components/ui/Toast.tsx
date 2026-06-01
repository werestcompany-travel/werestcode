import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

interface ToastState { message: string; type: 'success' | 'error' }

export function useToast() {
  const [toast, setToast] = React.useState<ToastState | null>(null);
  const show = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

interface ToastProps { toast: ToastState | null }

export function Toast({ toast }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2600),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast, opacity]);

  if (!toast) return null;

  return (
    <Animated.View style={[styles.container, toast.type === 'error' ? styles.error : styles.success, { opacity }]}>
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 999,
  },
  success: { backgroundColor: '#16a34a' },
  error:   { backgroundColor: '#dc2626' },
  text:    { color: '#ffffff', fontWeight: '600', fontSize: 14, textAlign: 'center' },
});
