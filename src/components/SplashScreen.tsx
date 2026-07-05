'use client';

import { useEffect, useState } from 'react';

type Phase = 'showing' | 'leaving' | 'hidden';

/**
 * App-open splash — matches the Figma Start-page look: red→orange
 * gradient with Mr Busbar front and center.
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
      <div className="pp-splash-mascot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mr-busbar.png" alt="" width={254} height={730} />
      </div>

      <h1 className="pp-splash-title">
        Busbar <span className="pp-splash-accent">Calculator</span>
      </h1>

      <div className="pp-splash-bar" aria-hidden="true" />
    </div>
  );
}
