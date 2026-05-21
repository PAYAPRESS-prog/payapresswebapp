/* PAYAPRESS Service Worker — v2 */

const CACHE_VERSION = 'v3';
const SHELL_CACHE   = `payapress-shell-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `payapress-dynamic-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/whitepaper',
  '/roadmap',
  '/manifest.json',
  '/favicon.svg',
];

// ── Install: precache app shell ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: purge old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: strategy by route type ───────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET or cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API routes → network-first (live copper price, FX rates)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then(r => r || Response.error()))
    );
    return;
  }

  // Static assets → cache-first (JS chunks, fonts, icons)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached ||
        fetch(request).then(res => {
          if (res.ok) caches.open(SHELL_CACHE).then(c => c.put(request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Navigation → network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline').then(r => r || caches.match('/'))
      )
    );
    return;
  }

  // Default → stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const fresh = fetch(request).then(res => {
        if (res.ok) caches.open(DYNAMIC_CACHE).then(c => c.put(request, res.clone()));
        return res;
      });
      return cached || fresh;
    })
  );
});
