'use client';

import { useEffect, useState } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [details, setDetails] = useState('');

  useEffect(() => {
    // Collect any pre-React errors captured by the inline script
    try {
      const errs: string[] = (window as unknown as { __pp_errs?: string[] }).__pp_errs ?? [];
      const all = [error?.message, ...errs].filter(Boolean).join('\n');
      setDetails(all);
    } catch { /* ignore */ }
    console.error('[PAYAPRESS GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        margin: 0, background: '#060608', minHeight: '100svh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center', gap: '1rem',
      }}>
        <p style={{ color: '#cd7f32', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
          PAYAPRESS
        </p>
        <p style={{ color: '#f0f0f0', fontWeight: 700, fontSize: '1.1rem' }}>
          Something went wrong
        </p>
        {details && (
          <pre style={{
            color: '#ef4444', fontSize: '0.65rem', background: '#0c0c0f',
            border: '1px solid #1c1c23', borderRadius: '0.5rem',
            padding: '0.75rem 1rem', maxWidth: '90vw', overflowX: 'auto',
            textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
            {details}
          </pre>
        )}
        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(135deg,#cd7f32,#b87333)',
            color: '#fff', border: 'none', borderRadius: '0.5rem',
            padding: '0.7rem 2rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
