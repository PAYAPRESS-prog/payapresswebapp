'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MrBusbarMascot } from './FxMascot';
import { FxNotifySheet } from './FxNotifySheet';
import { FxAuthSheet } from './FxAuthSheet';
import { BellIcon, CalculatorIcon, HistoryIcon, UserIcon } from './FxIcons';

/* Desktop landing layer — Figma page 114:299, frame "Main" 114:300.
   Rendered ABOVE the app shell on /busbar-calculator and hidden below
   1024px (mobile stays pixel-true to the Mobile page 0:1).

   The top nav is the ONE desktop header (Figma 114:301): brand, app
   links (Calculator / History), the coming-soon items, Live COMEX,
   bell and Sign In. The app shell's own header is hidden at ≥1024px on
   this page so the header never appears twice. */

const NAV_ITEMS = ['Live Metal Prices', 'Industry News', 'Equipment Costs'];

const STEPS = [
  {
    n: '1',
    title: 'Select Material',
    body: 'Choose Copper or Aluminum based on your project requirements.',
  },
  {
    n: '2',
    title: 'Enter Electrical Parameters',
    body: "Input current, width, height, thickness and currency's.",
  },
  {
    n: '3',
    title: 'Get Instant Results',
    body: 'Receive accurate busbar dimensions, ampacity, and performance calculations instantly.',
  },
];

export function FxDesktopLanding() {
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [authOpen,   setAuthOpen]   = useState(false);
  const [authMode,   setAuthMode]   = useState<'login' | 'signup'>('login');
  const [email,      setEmail]      = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { signal: AbortSignal.timeout(4000) })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setEmail(d?.user?.email ?? null))
      .catch(() => {});
  }, []);

  function scrollToApp() {
    document.getElementById('fx-app-anchor')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Bell = account feature (explore-first policy gates at actions):
  // signed-in users get the notification sheet, others the auth sheet.
  function openBell() {
    if (email) setNotifyOpen(true);
    else { setAuthMode('signup'); setAuthOpen(true); }
  }

  function handleAuthSuccess() {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        setEmail(d?.user?.email ?? null);
        setAuthOpen(false);
        setNotifyOpen(true); // continue what the user came for
      })
      .catch(() => setAuthOpen(false));
  }

  return (
    <div className="fx-dl" aria-label="Busbar Calculator overview">
      {/* ── Top nav — Figma 114:301 + app controls ──────── */}
      <header className="fx-dl-nav">
        <span className="fx-dl-brand">Busbar Calculator</span>

        <nav className="fx-dl-links" aria-label="Sections">
          <button type="button" className="fx-dl-link fx-dl-link-app" onClick={scrollToApp}>
            <CalculatorIcon width={16} height={16} />
            Calculator
          </button>
          <Link href="/app/history" className="fx-dl-link fx-dl-link-app">
            <HistoryIcon width={16} height={16} />
            History
          </Link>
          {NAV_ITEMS.map(label => (
            <button
              key={label}
              type="button"
              className="fx-dl-link"
              title="Coming soon — get notified"
              onClick={() => setNotifyOpen(true)}
            >
              {label}
            </button>
          ))}
        </nav>

        <span className="fx-dl-live">
          <span className="fx-dl-live-dot" />
          Live COMEX
        </span>

        <button
          type="button"
          className="fx-dl-bell"
          aria-label="Email notifications"
          onClick={openBell}
        >
          <BellIcon width={20} height={20} />
        </button>

        {email ? (
          <Link href="/app/profile" className="fx-dl-signin" aria-label="Profile">
            <span className="fx-dl-avatar">{email[0].toUpperCase()}</span>
            <span className="fx-dl-signin-email">{email}</span>
          </Link>
        ) : (
          <Link href="/app/profile" className="fx-dl-signin" aria-label="Sign in">
            <UserIcon width={18} height={18} />
            <span>Sign In</span>
          </Link>
        )}
      </header>

      {/* ── Hero — Figma 572:690 ────────────────────────── */}
      <section className="fx-dl-hero">
        <div className="fx-dl-hero-copy">
          <h1 className="fx-dl-title">Busbar Calculator<span className="sr-only"> — Free Busbar Sizing &amp; Price Calculator for Copper &amp; Aluminum</span></h1>
          <p className="fx-dl-sub">
            Design and size copper &amp; aluminum busbars faster, easier, and
            more accurately.
          </p>
          <div className="fx-dl-cta-row">
            <button type="button" className="fx-dl-cta" onClick={scrollToApp}>
              Start Calculate
            </button>
            <Link href="/app" className="fx-dl-cta-ghost">
              Try App
            </Link>
          </div>
        </div>
        <MrBusbarMascot className="fx-dl-mascot" />
      </section>

      <div className="fx-dl-divider" />

      {/* ── How It Works — Figma 578:698 / 578:702 ─────── */}
      <section className="fx-dl-hiw">
        <h2 className="fx-dl-hiw-title">How It Works</h2>
        <p className="fx-dl-hiw-sub">Simple steps to smarter calculate</p>

        <div className="fx-dl-steps">
          {STEPS.map((s, i) => (
            <div className="fx-dl-step-wrap" key={s.n}>
              {i > 0 && <span className="fx-dl-step-arrow" aria-hidden="true">⟶</span>}
              <div className="fx-dl-step">
                <span className="fx-dl-step-num">{s.n}</span>
                <h3 className="fx-dl-step-title">{s.title}</h3>
                <p className="fx-dl-step-body">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FxNotifySheet open={notifyOpen} onClose={() => setNotifyOpen(false)} />
      <FxAuthSheet
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
