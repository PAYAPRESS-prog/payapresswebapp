'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FxAuthSheet } from './FxAuthSheet';

type Mode = 'login' | 'signup';

// Onboarding / welcome gate — first screen of the app.
// Matches the Figma "Welcome" frame: mesh-gradient background, large title,
// subtitle, a glassy "Use as guest" pill, and a "Register now! Sign Up" link
// that opens the auth bottom-sheet (Log In / Sign Up tabs).
export function FxWelcome({ initialSheet }: { initialSheet?: Mode }) {
  const [sheetOpen, setSheetOpen] = useState(Boolean(initialSheet));
  const [mode, setMode] = useState<Mode>(initialSheet ?? 'signup');

  const openSheet = (m: Mode) => { setMode(m); setSheetOpen(true); };

  return (
    <div className="fx-welcome">
      {/* Decorative mesh-gradient backdrop (blurred copper / red / steel) */}
      <div className="fx-welcome-bg" aria-hidden="true" />

      <div className="fx-welcome-content">
        <header className="fx-welcome-head">
          <h1 className="fx-welcome-title">BusBar price Calculator</h1>
          <p className="fx-welcome-sub">
            Design and size copper &amp; aluminum busbars faster, easier, and
            more accurately.
          </p>
        </header>

        <footer className="fx-welcome-actions">
          <Link href="/busbar-calculator" className="fx-welcome-guest">
            Use as guest
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
