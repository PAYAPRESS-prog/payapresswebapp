'use client';
import { useEffect, useState } from 'react';

type Phase = 'hidden' | 'showing' | 'fading';

export default function SplashScreen() {
  // Start 'showing' on both server and client — same initial state = no hydration mismatch.
  // useEffect then immediately hides for returning visitors, or fades out for first-timers.
  const [phase, setPhase] = useState<Phase>('showing');

  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem('payapress_splash'); } catch { /* private browsing */ }

    if (seen) {
      setPhase('hidden');
      return;
    }

    try { sessionStorage.setItem('payapress_splash', '1'); } catch { /* ignore */ }
    const t1 = setTimeout(() => setPhase('fading'),  1600);
    const t2 = setTimeout(() => setPhase('hidden'),  2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     '#060608',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        transition:     'opacity 0.6s ease',
        opacity:         phase === 'fading' ? 0 : 1,
        pointerEvents:  'none',
      }}
    >
      <div style={{ animation: 'pp_splash_in 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
          <defs>
            <linearGradient id="pp_g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#e8953a" />
              <stop offset="100%" stopColor="#a85c18" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#pp_g)" />
          <rect x="12" y="27" width="40" height="10" rx="2.5" fill="white" opacity="0.95" />
          <rect x="18" y="19" width="36" height="9"  rx="2.5" fill="white" opacity="0.55"
                transform="skewX(-9) translate(-2,0)" />
          <rect x="14" y="38" width="32" height="7"  rx="2"   fill="white" opacity="0.3"
                transform="skewX(6) translate(1,0)" />
        </svg>
      </div>

      <p style={{
        color:         '#cd7f32',
        fontSize:      '1.35rem',
        fontWeight:    700,
        letterSpacing: '0.22em',
        marginTop:     '1.4rem',
        fontFamily:    'system-ui, sans-serif',
        animation:     'pp_splash_in 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        PAYAPRESS
      </p>

      <p style={{
        color:         'rgba(255,255,255,0.28)',
        fontSize:      '0.65rem',
        letterSpacing: '0.18em',
        marginTop:     '0.4rem',
        fontFamily:    'system-ui, sans-serif',
        animation:     'pp_splash_in 0.5s 0.2s ease both',
      }}>
        BUSBAR CALCULATOR
      </p>
    </div>
  );
}
