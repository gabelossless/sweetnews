const SHELL_CACHE = 'sn-shell-v3';
const ASSET_CACHE = 'sn-assets-v3';

// Only the files we can reliably name — Vite hashed bundles are handled separately
const SHELL_URLS = ['/', '/manifest.json', '/icon.svg'];

// ── Install: precache the app shell ──────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: evict stale caches ─────────────────────────────────
self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept same-origin GETs — let Firebase, Stripe, CDNs go direct
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Vite hashed bundles (/assets/*.js, /assets/*.css):
  // stale-while-revalidate — instant from cache, silently updated in background
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  // App shell + navigation: network-first, offline fallback to cached index
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && request.mode === 'navigate') {
          caches.open(SHELL_CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then((hit) =>
          hit ?? (request.mode === 'navigate' ? caches.match('/') : Response.error())
        )
      )
  );
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  });
  // Return cached immediately if available; otherwise wait for network
  return cached ?? networkPromise;
}
