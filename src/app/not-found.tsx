import Link from 'next/link';

export default function NotFound() {
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
          <linearGradient id="nfg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8953a"/>
            <stop offset="100%" stopColor="#a85c18"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#nfg)"/>
        <rect x="12" y="18" width="40" height="8" rx="2.5" fill="white" opacity="0.55"/>
        <rect x="12" y="28" width="40" height="8" rx="2.5" fill="white" opacity="0.95"/>
        <rect x="12" y="38" width="40" height="8" rx="2.5" fill="white" opacity="0.35"/>
      </svg>

      <p style={{ color: '#f0f0f0', fontWeight: 700, fontSize: '1.5rem', margin: 0 }}>
        404
      </p>

      <p style={{ color: '#a1a1aa', fontSize: '0.9rem', maxWidth: '22rem', lineHeight: 1.6, margin: 0 }}>
        This page doesn&apos;t exist. Head back to the calculator.
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg,#cd7f32,#b87333)',
          color: '#fff',
          borderRadius: '0.5rem',
          padding: '0.7rem 2rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          textDecoration: 'none',
          marginTop: '0.5rem',
        }}
      >
        Go to Calculator
      </Link>
    </div>
  );
}
