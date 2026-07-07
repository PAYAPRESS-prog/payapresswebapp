'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FxAuthSheet } from './FxAuthSheet';
import { MrBusbarMascot } from './FxMascot';

type Mode = 'login' | 'signup';

// Onboarding / welcome gate — first screen of the app.
// Matches the completed Figma "Start page" frame (545:616): red→orange
// gradient, centered title + subtitle, "Mr Busbar" mascot in the middle,
// frosted "Start Calculate" pill and a red "Sign Up" accent link.
export function FxWelcome({ initialSheet }: { initialSheet?: Mode }) {
  const [sheetOpen, setSheetOpen] = useState(Boolean(initialSheet));
  const [mode, setMode] = useState<Mode>(initialSheet ?? 'signup');

  const openSheet = (m: Mode) => { setMode(m); setSheetOpen(true); };

  return (
    <div className="fx-welcome">
      {/* Red → orange gradient backdrop (Figma ellipses 545:654 / 545:651) */}
      <div className="fx-welcome-bg" aria-hidden="true" />

      <div className="fx-welcome-content">
        <header className="fx-welcome-head">
          <h1 className="fx-welcome-title">Busbar Price Calculator</h1>
          <p className="fx-welcome-sub">
            Design and size copper &amp; aluminum busbars faster, easier, and
            more accurately.
          </p>
        </header>

        <MrBusbarMascot className="fx-welcome-mascot" />

        <footer className="fx-welcome-actions">
          {/* Figma flow: Start page → calculator directly (not the hub menu) */}
          <Link href="/busbar-calculator" className="fx-welcome-guest">
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
