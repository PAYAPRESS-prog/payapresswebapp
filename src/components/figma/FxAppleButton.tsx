'use client';

import { useEffect, useState } from 'react';

// "Continue with Apple" button.
//
// Two flows, one backend (/api/auth/apple):
//  - iOS shell (Capacitor): the native AuthenticationServices sheet via the
//    @capacitor-community/apple-sign-in plugin — identity token audience is
//    the app bundle id. Google OAuth is blocked inside WKWebView, so this is
//    the shell's primary SSO.
//  - Web (Safari/Chrome): Sign in with Apple JS popup — audience is the
//    Services ID from NEXT_PUBLIC_APPLE_CLIENT_ID. Renders nothing on the
//    web until that env var is configured (dormant, like FxGoogleButton).

const WEB_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
const APPLE_JS_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

type AppleIDAuth = {
  auth: {
    init: (cfg: Record<string, unknown>) => void;
    signIn: () => Promise<{
      authorization?: { id_token?: string };
      user?: { name?: { firstName?: string; lastName?: string } };
    }>;
  };
};

type CapacitorSIWA = {
  authorize: (opts: Record<string, unknown>) => Promise<{
    response?: {
      identityToken?: string;
      givenName?: string | null;
      familyName?: string | null;
    };
  }>;
};

declare global {
  interface Window {
    AppleID?: AppleIDAuth;
    Capacitor?: {
      isNativePlatform?: () => boolean;
      Plugins?: { SignInWithApple?: CapacitorSIWA };
    };
  }
}

function inIosShell(): boolean {
  try {
    if (window.Capacitor?.isNativePlatform?.()) return true;
    return localStorage.getItem('bc_ios') === '1';
  } catch { return false; }
}

function loadAppleJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.AppleID?.auth) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${APPLE_JS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('appleid js load failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = APPLE_JS_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('appleid js load failed'));
    document.head.appendChild(s);
  });
}

export function FxAppleButton({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const [busy, setBusy]   = useState(false);
  const [shell, setShell] = useState(false);

  useEffect(() => { setShell(inIosShell()); }, []);

  // Web without a Services ID configured AND not in the iOS shell → dormant.
  if (!shell && !WEB_CLIENT_ID) return null;

  async function finish(identityToken?: string, givenName?: string, familyName?: string) {
    if (!identityToken) { onError?.('Apple sign-in was cancelled.'); return; }
    const r = await fetch('/api/auth/apple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identityToken, givenName, familyName }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { onError?.(data?.error || 'Apple sign-in failed.'); return; }
    try { window.bcTrack?.('apple_auth'); } catch { /* noop */ }
    onSuccess?.();
  }

  async function handleClick() {
    setBusy(true);
    try {
      const native = window.Capacitor?.Plugins?.SignInWithApple;
      if (native && window.Capacitor?.isNativePlatform?.()) {
        // Native sheet — clientId/redirectURI are only used by the plugin's
        // web fallback; scopes ask for name+email (sent on first auth only).
        const { response } = await native.authorize({
          clientId: WEB_CLIENT_ID ?? 'com.payapress.calculator',
          redirectURI: window.location.origin,
          scopes: 'email name',
        });
        await finish(
          response?.identityToken,
          response?.givenName ?? undefined,
          response?.familyName ?? undefined,
        );
        return;
      }
      // Web popup flow.
      await loadAppleJs();
      window.AppleID!.auth.init({
        clientId: WEB_CLIENT_ID,
        scope: 'email name',
        redirectURI: `${window.location.origin}/busbar-calculator`,
        usePopup: true,
      });
      const res = await window.AppleID!.auth.signIn();
      await finish(
        res?.authorization?.id_token,
        res?.user?.name?.firstName,
        res?.user?.name?.lastName,
      );
    } catch {
      // Closing Apple's popup rejects — treat silently as a cancel.
      onError?.('Apple sign-in was cancelled.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="fx-apple-btn"
      onClick={handleClick}
      disabled={busy}
      aria-label="Continue with Apple"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.365 12.79c-.024-2.448 1.998-3.623 2.089-3.68-1.137-1.664-2.907-1.892-3.536-1.917-1.505-.152-2.938.886-3.7.886-.763 0-1.942-.864-3.193-.84-1.643.024-3.158.955-4.003 2.425-1.707 2.963-.436 7.344 1.226 9.75.814 1.178 1.784 2.5 3.057 2.452 1.226-.048 1.69-.792 3.172-.792 1.482 0 1.899.792 3.194.768 1.32-.024 2.155-1.202 2.962-2.384.932-1.368 1.316-2.693 1.34-2.762-.03-.012-2.571-.986-2.608-3.906ZM13.93 5.62c.676-.82 1.132-1.958 1.007-3.093-.973.04-2.152.648-2.85 1.466-.626.727-1.174 1.888-1.027 3.001 1.086.084 2.194-.552 2.87-1.374Z"/>
      </svg>
      {busy ? 'Please wait…' : 'Continue with Apple'}
    </button>
  );
}
