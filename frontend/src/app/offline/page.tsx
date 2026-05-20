'use client';

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#060608',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#f0f0f0',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📡</div>

      <h1
        style={{
          fontSize: 'clamp(1.4rem, 5vw, 2rem)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          marginBottom: '0.75rem',
          background: 'linear-gradient(90deg, #b87333, #cd7f32, #e8a855, #cd7f32, #b87333)',
          backgroundSize: '250% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        You&rsquo;re Offline
      </h1>

      <p style={{ color: '#71717a', maxWidth: '28rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        No internet connection detected. Check your connection and try again — your last
        calculation results are still available if you cached them.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          background: 'linear-gradient(135deg, #cd7f32, #b87333)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.7rem 2rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
