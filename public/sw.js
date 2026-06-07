// Minimal, safe SPA service worker.
// Only intercepts navigation requests — lets the browser's HTTP cache handle
// all sub-resources (Vite hashed bundles, images, etc.) without interference.
const SHELL_CACHE = 'sn-shell-v4';
const IMAGE_CACHE = 'sn-images-v1';

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
        Promise.all(names.filter((n) => n !== SHELL_CACHE && n !== IMAGE_CACHE).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: Intercept HTML navigation requests & Product Images ─────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Intercept Image Requests (Local and OpenFoodFacts thumbnails)
  const isImage = request.destination === 'image' || 
                  url.pathname.includes('/images/') || 
                  url.hostname.includes('openfoodfacts.org');

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Serve from cache, but update it in the background
            fetch(request).then((networkResponse) => {
              if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
                cache.put(request, networkResponse);
              }
            }).catch(() => {});
            return cachedResponse;
          }
          // Fetch from network, cache it, and return
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => Response.error());
        })
      )
    );
    return;
  }

  // 2. Only handle same-origin HTML navigations (App Shell)
  if (request.mode !== 'navigate') return;
  if (url.origin !== self.location.origin) return;

  // Network-first; on failure serve the cached shell so the PWA loads offline
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
