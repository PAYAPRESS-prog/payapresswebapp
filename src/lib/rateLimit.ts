// Simple sliding-window rate limiter using in-process memory.
// Suitable for a single-process Node.js server (Hostinger shared hosting).
// Each key (typically: action + IP) gets an independent counter.

interface Bucket { count: number; resetAt: number }
const _store = new Map<string, Bucket>();

// Purge expired entries every 5 minutes to prevent memory leak.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, b] of _store) {
    if (now > b.resetAt) _store.delete(key);
  }
}, CLEANUP_INTERVAL_MS).unref();

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * @param key      Unique identifier (e.g. `login:${ip}`)
 * @param limit    Maximum requests allowed within the window
 * @param windowMs Sliding window duration in milliseconds
 */
const MAX_KEYS = 50_000; // hard cap so forged IPs can't exhaust memory

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  // When the map is full, evict expired entries; if still full, fail
  // OPEN for this request rather than letting the map grow unbounded.
  if (_store.size >= MAX_KEYS && !_store.has(key)) {
    for (const [k, b] of _store) if (now > b.resetAt) _store.delete(k);
    if (_store.size >= MAX_KEYS) return true;
  }
  const bucket = _store.get(key);

  if (!bucket || now > bucket.resetAt) {
    _store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count++;
  return bucket.count <= limit;
}

/** Extract the client IP from proxy headers.
 *  Prefers x-real-ip (set by the hosting reverse proxy and NOT
 *  client-spoofable through it); falls back to the FIRST X-Forwarded-For
 *  hop. The result is capped to 45 chars (max IPv6 length) so a giant
 *  forged header can't be used as an unbounded rate-limit map key. */
export function getClientIp(req: Request): string {
  const real = req.headers.get('x-real-ip');
  const xff  = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = (real || xff || 'unknown').slice(0, 45);
  return ip || 'unknown';
}
