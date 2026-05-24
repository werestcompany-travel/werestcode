'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

export default function PushNotificationBell() {
  const [supported,   setSupported]   = useState(false);
  const [permission,  setPermission]  = useState<NotificationPermission>('default');
  const [subscribed,  setSubscribed]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [vapidKey,    setVapidKey]    = useState('');

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    setSupported(true);
    setPermission(Notification.permission);

    // Load VAPID key
    fetch('/api/push/vapid-public-key')
      .then((r) => r.json())
      .then(({ key }: { key: string }) => { if (key) setVapidKey(key); })
      .catch(() => {});

    // Check existing subscription
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (sub) setSubscribed(true); })
      .catch(() => {});
  }, []);

  if (!supported || !vapidKey) return null;

  async function subscribe() {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error('[PushBell] subscribe error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
        <BellOff className="w-4 h-4" />
        <span>Notifications blocked in browser settings</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        {subscribed ? <BellRing className="w-5 h-5 text-brand-600" /> : <Bell className="w-5 h-5 text-gray-400" />}
        <div>
          <p className="text-sm font-semibold text-gray-900">Booking Notifications</p>
          <p className="text-xs text-gray-500">
            {subscribed ? 'Push notifications enabled' : 'Get notified when your driver is confirmed'}
          </p>
        </div>
      </div>
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          subscribed
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {loading ? '…' : subscribed ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
}
