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
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = _store.get(key);

  if (!bucket || now > bucket.resetAt) {
    _store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count++;
  return bucket.count <= limit;
}

/** Extract the real client IP from Next.js request headers. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}
