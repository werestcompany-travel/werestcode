import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const TOKEN_KEY = 'werest_token';

export async function loginWithCredentials(email: string, password: string) {
  const res = await api.post('/api/user/auth/token', { email, password });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Login failed. Please check your credentials.');
  }
  const data = await res.json() as { token: string; user: Record<string, unknown> };
  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  return data;
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
