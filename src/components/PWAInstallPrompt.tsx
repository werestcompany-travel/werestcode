'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa_install_dismissed_at';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if dismissed in last 7 days
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show after 30 seconds
    const timer = setTimeout(() => setShow(true), 30_000);

    // Also show when custom event is fired (e.g. from confirmation page)
    const customHandler = () => setShow(true);
    window.addEventListener('pwa-show-install', customHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-show-install', customHandler);
      clearTimeout(timer);
    };
  }, []);

  if (!deferredPrompt || !show) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShow(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setShow(false);
  }

  return (
    <div className="fixed bottom-[80px] left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[45] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.16)] border border-gray-100 p-4 flex items-center gap-3 animate-slide-up">
      <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shrink-0">
        <span className="text-white font-black text-lg">W</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-snug">Add Werest to home screen</p>
        <p className="text-xs text-gray-500 mt-0.5">Quick access to bookings &amp; tracking</p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={handleInstall}
          className="text-xs font-semibold bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
        >
          Later
        </button>
      </div>
    </div>
  );
}
