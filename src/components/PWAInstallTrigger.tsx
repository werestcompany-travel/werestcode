'use client';
import { useEffect } from 'react';

export default function PWAInstallTrigger({ bookingId }: { bookingId: string }) {
  useEffect(() => {
    const key = `pwa_prompted_${bookingId}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      // Small delay so confirmation page content renders first
      setTimeout(() => window.dispatchEvent(new Event('pwa-show-install')), 3000);
    }
  }, [bookingId]);
  return null;
}
