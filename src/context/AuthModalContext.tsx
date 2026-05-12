'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  loyaltyPoints?: number;
  tierLevel?: string;
}

interface AuthModalContextValue {
  openModal: (step?: 'email' | 'register') => void;
  closeModal: () => void;
  user:    AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

/* ── Context ────────────────────────────────────────────────────────────────── */

const AuthModalContext = createContext<AuthModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
  user:    null,
  setUser: () => {},
});

/* ── Provider ───────────────────────────────────────────────────────────────── */

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [open,        setOpen]        = useState(false);
  const [initialStep, setInitialStep] = useState<'email' | 'register'>('email');
  const [user,        setUserState]   = useState<AuthUser | null>(null);

  /* Load current user once on mount */
  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.json())
      .then(d => setUserState(d.user ?? null))
      .catch(() => {});
  }, []);

  const openModal = useCallback((step: 'email' | 'register' = 'email') => {
    setInitialStep(step);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  /* Listen for openAuthModal custom event (dispatched by WishlistContext when not logged in) */
  useEffect(() => {
    const handler = () => openModal('email');
    document.addEventListener('openAuthModal', handler);
    return () => document.removeEventListener('openAuthModal', handler);
  }, [openModal]);

  const setUser = useCallback((u: AuthUser | null) => setUserState(u), []);

  return (
    <AuthModalContext.Provider value={{ openModal, closeModal, user, setUser }}>
      {children}
      <AuthModal
        open={open}
        onClose={closeModal}
        initialStep={initialStep}
        onSuccess={(u) => { setUserState(u); closeModal(); router.refresh(); }}
      />
    </AuthModalContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */

export function useAuthModal() {
  return useContext(AuthModalContext);
}
