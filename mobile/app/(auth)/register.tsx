import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { colors } from '@/constants/theme';
import * as SecureStore from 'expo-secure-store';

export default function RegisterScreen() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const { setToken, setUser }   = useAuthStore();

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Name, email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const res  = await api.post('/api/user/register', { name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim() || undefined });
      const data = await res.json() as { error?: string; token?: string; user?: unknown };
      if (!res.ok) throw new Error(data.error ?? 'Registration failed');
      if (data.token) {
        await SecureStore.setItemAsync('werest_token', data.token);
        setToken(data.token);
      }
      if (data.user) setUser(data.user as Parameters<typeof setUser>[0]);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Registration failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.gray[900], marginBottom: 6 }}>Create account</Text>
        <Text style={{ color: colors.gray[500], marginBottom: 28, fontSize: 14 }}>Join Werest for rewards and faster booking</Text>

        <View style={{ gap: 12 }}>
          {[
            { value: name,     onChange: setName,     placeholder: 'Full name',         label: 'Full name',         keyboard: 'default' as const,       secure: false },
            { value: email,    onChange: setEmail,    placeholder: 'Email address',      label: 'Email address',     keyboard: 'email-address' as const, secure: false },
            { value: phone,    onChange: setPhone,    placeholder: 'Phone (optional)',   label: 'Phone number',      keyboard: 'phone-pad' as const,     secure: false },
            { value: password, onChange: setPassword, placeholder: 'Password',           label: 'Password',          keyboard: 'default' as const,       secure: true  },
          ].map((f) => (
            <TextInput
              key={f.placeholder}
              value={f.value}
              onChangeText={f.onChange}
              placeholder={f.placeholder}
              keyboardType={f.keyboard}
              autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'words'}
              secureTextEntry={f.secure}
              accessibilityLabel={f.label}
              style={{ borderWidth: 1, borderColor: colors.gray[200], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, backgroundColor: colors.gray[50] }}
            />
          ))}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            accessibilityLabel="Create your Werest account"
            accessibilityRole="button"
            style={{ backgroundColor: colors.brand[600], borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>Create Account</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.gray[500], fontSize: 14 }}>Already have an account? <Text style={{ color: colors.brand[600], fontWeight: '600' }}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
