import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { colors } from '@/constants/theme';

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const login = useAuthStore((s) => s.login);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.white, fontWeight: '900', fontSize: 36 }}>W</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.gray[900] }}>Welcome back</Text>
          <Text style={{ fontSize: 14, color: colors.gray[500], marginTop: 4 }}>Sign in to your Werest account</Text>
        </View>

        {/* Form */}
        <View style={{ gap: 12 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Email address"
            style={{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, backgroundColor: colors.gray[50] }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            accessibilityLabel="Password"
            style={{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, backgroundColor: colors.gray[50] }}
          />
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            accessibilityLabel="Sign in to your account"
            accessibilityRole="button"
            style={{ backgroundColor: colors.brand[600], borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={{ color: colors.gray[500], fontSize: 14 }}>
            Don't have an account?{' '}
            <Text style={{ color: colors.brand[600], fontWeight: '600' }}>Register</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: colors.gray[400], fontSize: 13 }}>Continue as guest</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
