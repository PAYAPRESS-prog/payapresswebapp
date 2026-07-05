'use client';

import { useEffect, useRef, useState } from 'react';

// "Sign in with Google" button, rendered by Google Identity Services.
// On a successful credential, POSTs the ID token to /api/auth/google and
// calls onSuccess. Renders nothing if NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset
// (so the feature stays dormant until you configure a Google OAuth client).

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gsi load failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gsi load failed'));
    document.head.appendChild(s);
  });
}

export function FxGoogleButton({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !ref.current) return;
    let cancelled = false;

    async function handleCredential(resp: { credential?: string }) {
      if (!resp.credential) { onError?.('Google sign-in was cancelled.'); return; }
      setBusy(true);
      try {
        const r = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: resp.credential }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) { onError?.(data?.error || 'Google sign-in failed.'); return; }
        try { window.bcTrack?.('google_auth'); } catch { /* noop */ }
        onSuccess?.();
      } catch {
        onError?.('Network error. Please try again.');
      } finally {
        setBusy(false);
      }
    }

    loadGsi()
      .then(() => {
        if (cancelled || !ref.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
          ux_mode: 'popup',
          auto_select: false,
          itp_support: true,
        });
        window.google.accounts.id.renderButton(ref.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'center',
          width: 300,
        });
      })
      .catch(() => onError?.('Could not load Google sign-in.'));

    return () => { cancelled = true; };
  }, [onSuccess, onError]);

  if (!CLIENT_ID) return null;

  return (
    <div className="fx-google-wrap">
      <div className="fx-auth-or"><span>or</span></div>
      <div ref={ref} className={`fx-google-btn${busy ? ' is-busy' : ''}`} aria-busy={busy} />
    </div>
  );
}
