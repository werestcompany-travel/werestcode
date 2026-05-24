import { create } from 'zustand';
import { clearToken, loginWithCredentials } from '@/lib/auth';
import type { User } from '@/lib/types';

interface AuthState {
  token:    string | null;
  user:     User | null;
  isReady:  boolean;
  login:    (email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
  setToken: (token: string | null) => void;
  setUser:  (user: User | null) => void;
  setReady: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:    null,
  user:     null,
  isReady:  false,
  login:    async (email, password) => {
    const { token, user } = await loginWithCredentials(email, password);
    set({ token, user: user as unknown as User });
  },
  logout:   async () => {
    await clearToken();
    set({ token: null, user: null });
  },
  setToken: (token) => set({ token }),
  setUser:  (user)  => set({ user }),
  setReady: ()      => set({ isReady: true }),
}));
