'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MrBusbarMascot } from './FxMascot';
import { FxNotifySheet } from './FxNotifySheet';

/* Desktop landing layer — Figma page 114:299, frame "Main" 114:300.
   Rendered ABOVE the app shell on /busbar-calculator and hidden below
   1024px (mobile stays pixel-true to the Mobile page 0:1).
   Sections: top nav (114:301), hero (572:690), How It Works (578:698 +
   578:702). "Start Calculate" scrolls down to the calculator app. */

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

  function scrollToApp() {
    document.getElementById('fx-app-anchor')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="fx-dl" aria-label="Busbar Calculator overview">
      {/* ── Top nav — Figma 114:301 ─────────────────────── */}
      <header className="fx-dl-nav">
        <span className="fx-dl-brand">Busbar Calculator</span>
        <nav className="fx-dl-links" aria-label="Sections">
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
    </div>
  );
}
