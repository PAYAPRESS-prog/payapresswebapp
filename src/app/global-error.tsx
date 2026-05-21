'use client';

export default function GlobalError({ reset }: { reset: () => void }) {
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
