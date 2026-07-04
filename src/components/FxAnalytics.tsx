'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Cookieless pageview beacon. Fires on first load and on every client-side
// route change. Uses sendBeacon so the ping survives navigation, falling
// back to fetch(keepalive). Never blocks rendering; failures are ignored.
export function FxAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify({
      path: pathname || window.location.pathname,
      ref: document.referrer || '',
    });
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon && navigator.sendBeacon('/api/analytics/collect', blob)) return;
    } catch { /* fall through */ }
    fetch('/api/analytics/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
