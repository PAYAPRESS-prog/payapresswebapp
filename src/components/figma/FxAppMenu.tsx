'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalculatorIcon,
  HistoryIcon,
  ChartUpIcon,
  MagicStickIcon,
  ScissorsIcon,
  ArrowRightIcon,
} from './FxIcons';
import { FxAuthSheet } from './FxAuthSheet';

type Action = 'route' | 'auth' | 'soon';

type Item = {
  key: string;
  label: string;
  sub: string;
  Icon: (p: { className?: string; width?: number; height?: number }) => React.ReactElement;
  action: Action;
  href?: string;
};

const ITEMS: Item[] = [
  { key: 'calc',    label: 'Busbar Calculator',  sub: 'Live copper & aluminum cost', Icon: CalculatorIcon, action: 'route', href: '/busbar-calculator' },
  { key: 'history', label: 'History',            sub: 'Your saved calculations',     Icon: HistoryIcon,    action: 'auth',  href: '/app/history' },
  { key: 'waste',   label: 'Waste Calculator',   sub: 'Kerf & punch-out loss',       Icon: ScissorsIcon,   action: 'auth',  href: '/app/waste' },
  { key: 'trends',  label: 'Current Trends',     sub: 'Market price movements',      Icon: ChartUpIcon,    action: 'soon' },
  { key: 'future',  label: 'Future Projections', sub: 'AI-assisted price forecast',  Icon: MagicStickIcon, action: 'soon' },
];

export function FxAppMenu() {
  const router = useRouter();

  // undefined = still checking, null = logged out, object = logged in
  const [user, setUser] = useState<{ id: number; email: string } | null | undefined>(undefined);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [soon, setSoon] = useState<Item | null>(null);
  const pendingHref = useRef<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => setUser(d?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  // Prefetch the real destinations so navigation feels instant
  useEffect(() => {
    router.prefetch('/busbar-calculator');
    router.prefetch('/app/history');
    router.prefetch('/app/waste');
  }, [router]);

  // Close the coming-soon modal on Escape
  useEffect(() => {
    if (!soon) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSoon(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [soon]);

  function handleItem(item: Item) {
    if (item.action === 'route' && item.href) {
      router.push(item.href);
      return;
    }
    if (item.action === 'soon') {
      setSoon(item);
      return;
    }
    if (item.action === 'auth' && item.href) {
      if (user) {
        router.push(item.href);
      } else if (user === null) {
        // Logged out → gate behind login/sign-up, then continue to the page
        pendingHref.current = item.href;
        setAuthMode('login');
        setAuthOpen(true);
      }
      // user === undefined → auth state still loading, ignore the tap
    }
  }

  function handleAuthSuccess() {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const u = d?.user ?? null;
        setUser(u);
        if (u && pendingHref.current) {
          const href = pendingHref.current;
          pendingHref.current = null;
          setAuthOpen(false);
          router.push(href);
        }
      })
      .catch(() => {});
  }

  return (
    <div className="fx-menu">
      <div className="fx-menu-inner">
        <nav className="fx-menu-list" aria-label="Sections">
          {ITEMS.map((item, i) => {
            const Icon = item.Icon;
            return (
              <button
                key={item.key}
                type="button"
                className="fx-menu-row"
                style={{ animationDelay: `${0.05 + i * 0.07}s` }}
                onClick={() => handleItem(item)}
              >
                <span className="fx-menu-row-ic">
                  <Icon className="fx-menu-row-icon" width={26} height={26} />
                </span>
                <span className="fx-menu-row-text">
                  <span className="fx-menu-row-label">{item.label}</span>
                  <span className="fx-menu-row-sub">{item.sub}</span>
                </span>
                {item.action === 'soon' ? (
                  <span className="fx-menu-row-badge">Soon</span>
                ) : (
                  <ArrowRightIcon className="fx-menu-row-chevron" width={22} height={22} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Coming-soon glass modal ─────────────────────── */}
      {soon && (() => {
        const SoonIcon = soon.Icon;
        return (
          <div
            className="fx-soon-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={soon.label}
            onClick={e => { if (e.target === e.currentTarget) setSoon(null); }}
          >
            <div className="fx-soon-card">
              <span className="fx-soon-icon">
                <SoonIcon width={34} height={34} />
              </span>
              <span className="fx-soon-tag">Coming soon</span>
              <h3 className="fx-soon-title">{soon.label}</h3>
              <p className="fx-soon-sub">
                We&apos;re crafting this section to give you the best experience.
                It&apos;ll land here very soon.
              </p>
              <button type="button" className="fx-soon-btn" onClick={() => setSoon(null)}>
                Got it
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Auth gate (History when logged out) ─────────── */}
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
