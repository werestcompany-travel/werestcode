import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '@/constants/theme';

async function authHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync('werest_token');
  return {
    'Content-Type': 'application/json',
    Accept:         'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = await authHeaders();
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  });
}

export const api = {
  get:    (path: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    return apiFetch(`${path}${qs}`);
  },
  post:   (path: string, body: unknown)  => apiFetch(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  (path: string, body: unknown)  => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string, body?: unknown) => apiFetch(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};
