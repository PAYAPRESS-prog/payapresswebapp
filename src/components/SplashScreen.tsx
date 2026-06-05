'use client';

import { useEffect, useState } from 'react';

type Phase = 'showing' | 'leaving' | 'hidden';

/**
 * App-open splash — Instagram-style.
 *
 * Shows on every cold page load (each real "app open"). Because the root
 * layout persists across client-side navigation, the splash mounts only once
 * per document load — internal route changes never re-trigger it. Starts in the
 * same 'showing' state on both server and client so there is no hydration
 * mismatch (this previously caused React #418). The overlay uses
 * pointer-events:none so it can NEVER block interaction with the app
 * underneath — even while fading out the page below is fully usable.
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('showing');

  useEffect(() => {
    // Hold ~1.5s, then play the exit motion (~0.55s) and unmount.
    const t1 = setTimeout(() => setPhase('leaving'), 1500);
    const t2 = setTimeout(() => setPhase('hidden'),  2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={`pp-splash${phase === 'leaving' ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="pp-splash-glow" />

      <div className="pp-splash-logo">
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <defs>
            <linearGradient id="pp_splash_g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#f7b34a" />
              <stop offset="55%"  stopColor="#e8953a" />
              <stop offset="100%" stopColor="#a85c18" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#pp_splash_g)" />
          {/* stacked busbar plates */}
          <rect className="pp-bar pp-bar-1" x="12" y="18" width="40" height="8" rx="2.5" fill="#fff" opacity="0.55" />
          <rect className="pp-bar pp-bar-2" x="12" y="28" width="40" height="8" rx="2.5" fill="#fff" opacity="0.95" />
          <rect className="pp-bar pp-bar-3" x="12" y="38" width="40" height="8" rx="2.5" fill="#fff" opacity="0.35" />
        </svg>
      </div>

      <h1 className="pp-splash-title">
        Busbar <span className="pp-splash-accent">Calculator</span>
      </h1>
      <p className="pp-splash-sub">PAYAPRESS</p>

      <div className="pp-splash-bar" aria-hidden="true" />
    </div>
  );
}
