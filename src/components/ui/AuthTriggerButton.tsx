'use client';

import { useAuthModal } from '@/context/AuthModalContext';

interface Props {
  step?: 'email' | 'register';
  className?: string;
  children: React.ReactNode;
}

/**
 * Drop-in client component that opens the global AuthModal when clicked.
 * Use this in server components instead of <Link href="/auth/register">.
 */
export function AuthTriggerButton({ step = 'register', className, children }: Props) {
  const { openModal } = useAuthModal();
  return (
    <button type="button" onClick={() => openModal(step)} className={className}>
      {children}
    </button>
  );
}
