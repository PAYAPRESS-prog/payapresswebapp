/* PAYAPRESS Service Worker — v39 */

const CACHE_VERSION = 'v39';
const SHELL_CACHE   = `payapress-shell-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `payapress-dynamic-${CACHE_VERSION}`;

/* Only precache static assets with content-hashed filenames.
   HTML navigation pages are NEVER precached — they change on every deploy
   and caching them causes stale CSS hash references → unstyled page. */
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/favicon.svg',
];

// Synthetic offline JSON response for API calls that fail when offline.
// Built fresh per request — cloning a shared Response throws once its
// body stream is locked, which would break ALL api fallbacks after the first.
function offlineApiResponse() {
  return new Response(
    JSON.stringify({ offline: true, error: 'No internet connection.' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

// ── Install: precache only static assets ─────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: purge ALL old caches immediately ────────────────────────────────
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

  // API routes → network-only (live copper price, FX rates — never cache)
  // Return a proper JSON 503 offline response instead of Response.error()
  // so the client can handle it gracefully rather than seeing a network error.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => offlineApiResponse())
    );
    return;
  }

  // _next/static/ → cache-first (content-hashed, safe to cache indefinitely)
  if (url.pathname.startsWith('/_next/static/')) {
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

  // Static files (icons, fonts, images) → cache-first
  if (
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

  // Navigation (HTML pages) → network-ONLY, fallback to /offline if network fails
  // IMPORTANT: Never cache HTML pages — they contain hashed CSS/JS URLs that
  // become stale on redeploy, causing the unstyled white-page bug.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline').then(r => r || Response.error())
      )
    );
    return;
  }

  // Default → network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then(r => r || Response.error()))
  );
});
