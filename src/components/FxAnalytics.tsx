'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// First-party, cookieless analytics client.
//
// Identity (first-party only, never sent to any third party):
//   bc_vid — random UUID in localStorage (returning visitors / uniques)
//   bc_sid — random UUID in sessionStorage with a 30-min idle timeout
//            (sessions, bounce rate, session duration)
//
// Fires a pageview on load and every SPA route change, and exposes a
// global `window.bcTrack(event, meta?)` for custom conversion events.

const VKEY = 'bc_vid';
const SKEY = 'bc_sid';
const STKEY = 'bc_sid_ts';
const SESSION_IDLE = 30 * 60 * 1000;

function uuid(): string {
  try { if (crypto?.randomUUID) return crypto.randomUUID(); } catch { /* noop */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getVisitorId(): string {
  try {
    let v = localStorage.getItem(VKEY);
    if (!v) { v = uuid(); localStorage.setItem(VKEY, v); }
    return v;
  } catch { return uuid(); }
}

function getSessionId(): string {
  try {
    const now = Date.now();
    const ts = Number(sessionStorage.getItem(STKEY) || 0);
    let s = sessionStorage.getItem(SKEY);
    if (!s || now - ts > SESSION_IDLE) { s = uuid(); sessionStorage.setItem(SKEY, s); }
    sessionStorage.setItem(STKEY, String(now));
    return s;
  } catch { return uuid(); }
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify({
    vid: getVisitorId(),
    sid: getSessionId(),
    lang: navigator.language,
    sw: window.innerWidth,
    ...payload,
  });
  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/analytics/collect', blob)) return;
  } catch { /* fall through */ }
  fetch('/api/analytics/collect', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body, keepalive: true,
  }).catch(() => {});
}

declare global {
  interface Window {
    bcTrack?: (event: string, meta?: string) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

// The native shells append ?src=… on first load (Windows: windows-app,
// Android TWA: android-app). Persist the flag so the whole session (and
// future visits) know they're in the app: hides the PWA install prompt,
// counted in analytics.
function detectDesktopShell() {
  try {
    const src = new URLSearchParams(location.search).get('src');
    if (src === 'windows-app') {
      if (localStorage.getItem('bc_desktop') !== '1') {
        localStorage.setItem('bc_desktop', '1');
      }
      window.bcTrack?.('desktop_launch');
    } else if (src === 'android-app') {
      if (localStorage.getItem('bc_android') !== '1') {
        localStorage.setItem('bc_android', '1');
      }
      window.bcTrack?.('android_launch');
    } else if (src === 'ios-app') {
      if (localStorage.getItem('bc_ios') !== '1') {
        localStorage.setItem('bc_ios', '1');
      }
      window.bcTrack?.('ios_launch');
    }
  } catch { /* private mode */ }
}

export function FxAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    detectDesktopShell();
    if (typeof window === 'undefined') return;

    // Expose the custom-event tracker for the whole app — fires to BOTH
    // our first-party analytics and Google Analytics (if gtag is present).
    window.bcTrack = (event: string, meta?: string) => {
      send({ event, path: pathname || location.pathname, meta });
      try { window.gtag?.('event', event, meta ? { label: meta } : undefined); } catch { /* noop */ }
    };

    const url = new URL(window.location.href);
    const enteredAt = Date.now();

    // Pageview with full first-load context.
    send({
      event: 'pageview',
      path: pathname || location.pathname,
      ref: document.referrer || '',
      us: url.searchParams.get('utm_source') || undefined,
      um: url.searchParams.get('utm_medium') || undefined,
      uc: url.searchParams.get('utm_campaign') || undefined,
    });

    // Engagement time: report how long the page was open when it's hidden.
    let reported = false;
    const reportEngagement = () => {
      if (reported) return;
      reported = true;
      send({ event: 'engagement', path: pathname || location.pathname, dur: Date.now() - enteredAt });
    };
    const onHide = () => { if (document.visibilityState === 'hidden') reportEngagement(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', reportEngagement);

    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', reportEngagement);
    };
  }, [pathname]);

  return null;
}
