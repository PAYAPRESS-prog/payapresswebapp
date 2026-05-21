'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PAYAPRESS]', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100svh',
      background: '#060608',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      gap: '1.25rem',
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="56" height="56">
        <defs>
          <linearGradient id="eg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8953a"/>
            <stop offset="100%" stopColor="#a85c18"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#eg)"/>
        <rect x="12" y="27" width="40" height="10" rx="2.5" fill="white" opacity="0.95"/>
      </svg>

      <p style={{ color: '#cd7f32', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
        PAYAPRESS
      </p>

      <p style={{ color: '#f0f0f0', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.4, margin: 0 }}>
        Something went wrong
      </p>

      <p style={{ color: '#71717a', fontSize: '0.85rem', maxWidth: '28rem', lineHeight: 1.6 }}>
        The app encountered an unexpected error. Tap the button below to try again.
        If the problem persists, do a hard refresh (pull down to refresh on iOS).
      </p>

      <button
        onClick={reset}
        style={{
          background: 'linear-gradient(135deg,#cd7f32,#b87333)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.7rem 2rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '0.5rem',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
