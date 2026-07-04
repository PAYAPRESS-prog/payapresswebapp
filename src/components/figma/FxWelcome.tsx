'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FxAuthSheet } from './FxAuthSheet';

type Mode = 'login' | 'signup';

/* "Mr Busbar" mascot — a twisted copper busbar with glasses.
   The real illustration lives at /mr-busbar.png (exported from the Figma
   "mr busbar 1" node); this inline SVG is the automatic fallback when the
   export hasn't been added to public/ yet, so the layout never breaks. */
function MrBusbarSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 262 450" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="mrb_face" x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0%"  stopColor="#f2a95c" />
          <stop offset="55%" stopColor="#e08a35" />
          <stop offset="100%" stopColor="#c96f22" />
        </linearGradient>
        <linearGradient id="mrb_side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#a85818" />
          <stop offset="100%" stopColor="#8f4a12" />
        </linearGradient>
        <linearGradient id="mrb_twist" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"  stopColor="#e8953a" />
          <stop offset="50%" stopColor="#c96f22" />
          <stop offset="100%" stopColor="#e8953a" />
        </linearGradient>
      </defs>

      {/* question mark */}
      <text x="148" y="34" fontSize="30" fontWeight="600" fill="#4a2f14"
            fontFamily="Georgia, serif" transform="rotate(12 148 34)">?</text>

      {/* thin arms */}
      <path d="M96 200 C70 260 64 320 84 372" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M166 200 C196 258 202 316 180 370" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* top flat panel */}
      <path d="M98 46 L162 40 L166 196 L96 200 Z" fill="url(#mrb_face)" />
      <path d="M162 40 L172 46 L176 192 L166 196 Z" fill="url(#mrb_side)" />

      {/* ribbon twist */}
      <path d="M96 200 C96 258 168 300 168 356 L140 358 C140 312 96 262 96 200 Z" fill="url(#mrb_twist)" />
      <path d="M166 196 C166 252 100 300 100 354 L124 356 C124 314 166 258 166 196 Z"
            fill="#b45f1a" opacity="0.85" />

      {/* bottom flat panel */}
      <path d="M100 354 L168 356 L164 440 L102 442 Z" fill="url(#mrb_face)" />
      <path d="M168 356 L176 362 L172 436 L164 440 Z" fill="url(#mrb_side)" />

      {/* face — glasses, eyes, brows, smile */}
      <circle cx="116" cy="106" r="14" stroke="#2e2013" strokeWidth="3" fill="rgba(255,255,255,0.14)" />
      <circle cx="150" cy="104" r="14" stroke="#2e2013" strokeWidth="3" fill="rgba(255,255,255,0.14)" />
      <path d="M130 105 L136 104" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" />
      <path d="M102 104 L96 102" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" />
      <path d="M164 102 L170 100" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" />
      <circle cx="118" cy="108" r="3.4" fill="#2e2013" />
      <circle cx="151" cy="106" r="3.4" fill="#2e2013" />
      <path d="M106 86 Q116 80 126 84"  stroke="#2e2013" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M140 84 Q150 78 160 82"  stroke="#2e2013" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M120 140 Q132 148 146 138" stroke="#2e2013" strokeWidth="3.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Onboarding / welcome gate — first screen of the app.
// Matches the completed Figma "Start page" frame (545:616): red→orange
// gradient, centered title + subtitle, "Mr Busbar" mascot in the middle,
// frosted "Start Calculate" pill and a red "Sign Up" accent link.
export function FxWelcome({ initialSheet }: { initialSheet?: Mode }) {
  const [sheetOpen, setSheetOpen] = useState(Boolean(initialSheet));
  const [mode, setMode] = useState<Mode>(initialSheet ?? 'signup');
  const [mascotImgOk, setMascotImgOk] = useState(true);

  const openSheet = (m: Mode) => { setMode(m); setSheetOpen(true); };

  return (
    <div className="fx-welcome">
      {/* Red → orange gradient backdrop (Figma ellipses 545:654 / 545:651) */}
      <div className="fx-welcome-bg" aria-hidden="true" />

      <div className="fx-welcome-content">
        <header className="fx-welcome-head">
          <h1 className="fx-welcome-title">BusBar price Calculator</h1>
          <p className="fx-welcome-sub">
            Design and size copper &amp; aluminum busbars faster, easier, and
            more accurately.
          </p>
        </header>

        <div className="fx-welcome-mascot" aria-hidden="true">
          {mascotImgOk ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/mr-busbar.png"
              alt=""
              width={262}
              height={450}
              onError={() => setMascotImgOk(false)}
            />
          ) : (
            <MrBusbarSvg width="100%" height="100%" />
          )}
        </div>

        <footer className="fx-welcome-actions">
          <Link href="/app" className="fx-welcome-guest">
            Start Calculate
          </Link>

          <p className="fx-welcome-register">
            Register now!{' '}
            <button
              type="button"
              className="fx-welcome-signup"
              onClick={() => openSheet('signup')}
            >
              Sign Up
            </button>
          </p>
        </footer>
      </div>

      <FxAuthSheet
        open={sheetOpen}
        mode={mode}
        onClose={() => setSheetOpen(false)}
        onModeChange={setMode}
      />
    </div>
  );
}
