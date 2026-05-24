// Werest Customer PWA — Service Worker v1

const CACHE_NAME   = 'werest-customer-v1';
const STATIC_CACHE = 'werest-static-v1';
const OFFLINE_URL  = '/offline';

const PRECACHE_URLS = ['/', '/booking', '/tours', '/tracking', '/attractions', '/offline'];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME && n !== STATIC_CACHE)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // External: only cache Google Fonts
  if (url.origin !== location.origin) {
    if (
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com'
    ) {
      event.respondWith(
        caches.open(STATIC_CACHE).then((cache) =>
          cache.match(request).then(
            (cached) => cached || fetch(request).then((res) => { cache.put(request, res.clone()); return res; })
          )
        )
      );
    }
    return; // all other external — passthrough
  }

  // API: POST/PATCH/DELETE — network only (never cache mutations)
  if (url.pathname.startsWith('/api/') && request.method !== 'GET') {
    return; // let browser handle
  }

  // API GET — network first, 3s timeout, cache fallback
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(
      Promise.race([
        fetch(request.clone()).then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
          }
          return res;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]).catch(() => caches.match(request).then((cached) => cached || new Response(JSON.stringify({ error: 'Offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } })))
    );
    return;
  }

  // Key pages — stale-while-revalidate
  const SWR_PATHS = ['/', '/booking', '/tours', '/tracking', '/attractions'];
  if (SWR_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'))) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          });
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Static assets — cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(async () => {
          // Navigation fallback → offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
          }
          return new Response('', { status: 503 });
        });
    })
  );
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { return; }

  const title   = data.title ?? 'Werest Travel';
  const options = {
    body:      data.body ?? 'Your booking has been updated.',
    icon:      '/icon-192.png',
    badge:     '/icon-192.png',
    tag:       data.tag ?? 'werest-booking',
    renotify:  true,
    data:      { url: data.url ?? '/tracking' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// ── Push subscription change ───────────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then((sub) =>
        fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.toJSON()),
        })
      )
      .catch(() => {})
  );
});
