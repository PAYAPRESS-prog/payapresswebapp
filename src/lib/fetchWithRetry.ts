type NextFetchInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

export async function fetchWithRetry(
  url: string,
  init: NextFetchInit = {},
  maxAttempts = 3,
): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500) throw new Error(`HTTP ${res.status}`);
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    if (i < maxAttempts - 1) await new Promise(r => setTimeout(r, 400 * 2 ** i));
  }
  throw lastErr;
}
