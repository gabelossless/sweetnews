// Minimal, safe SPA service worker.
// Only intercepts navigation requests — lets the browser's HTTP cache handle
// all sub-resources (Vite hashed bundles, images, etc.) without interference.
const SHELL_CACHE = 'sn-shell-v4';

// ── Install: cache the app shell ─────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Use allSettled so a single 404 doesn't abort the whole install
      Promise.allSettled([
        fetch('/').then((r) => { if (r.ok) cache.put('/', r); }),
      ])
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: evict every old cache ──────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== SHELL_CACHE).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: ONLY intercept HTML navigation requests ────────────────
// Sub-resources (JS bundles, CSS, images) are NOT intercepted.
// Vite ships hashed assets with Cache-Control: immutable — the browser
// handles their caching perfectly without SW involvement.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin navigations
  if (request.method !== 'GET') return;
  if (request.mode !== 'navigate') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first; on failure serve the cached shell so the SPA still loads offline
  event.respondWith(
    fetch(request).catch(() =>
      caches.match('/').then((cached) => cached ?? Response.error())
    )
  );
});

// ── Push: show notification when app is in background ────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Sweet News', {
      body: data.body ?? '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url ?? '/' },
    })
  );
});

// ── Notification click: focus or open the app ────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.navigate(targetUrl);
        } else {
          self.clients.openWindow(targetUrl);
        }
      })
  );
});
