'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BellIcon, CalculatorIcon, HistoryIcon, UserIcon } from './FxIcons';
import { FxNotifySheet } from './FxNotifySheet';
import { FxAuthSheet } from './FxAuthSheet';

export function FxHeader() {
  const path = usePathname();
  const [email,       setEmail]       = useState<string | null>(null);
  const [notifyOpen,  setNotifyOpen]  = useState(false);
  const [authOpen,    setAuthOpen]    = useState(false);
  const [authMode,    setAuthMode]    = useState<'login' | 'signup'>('login');

  // Bell = an account feature: signing up is required exactly here (the
  // explore-first policy gates at actions, never at app entry).
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

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => setEmail(d?.user?.email ?? null))
      .catch(() => {});
  }, []);

  const isCalc    = path === '/busbar-calculator' || path === '/';
  const isHistory = path?.startsWith('/app/history');
  const isProfile = path?.startsWith('/app/profile');

  return (
    <>
      <header className="fx-header">
        <div className="fx-header-row">
          {/* Mobile: Bell icon — opens notification sheet */}
          <button
            type="button"
            className="fx-icon-btn fx-header-mobile-only fx-header-bell"
            aria-label="Email notifications"
            onClick={openBell}
          >
            <BellIcon width={24} height={24} />
          </button>

          {/* Mobile title (centered) */}
          <span className="fx-header-title fx-header-mobile-only">Busbar Calculator</span>

          {/* Logo — desktop only */}
          <Link href="/busbar-calculator" className="fx-header-brand" aria-label="Busbar Calculator">
            <span className="fx-header-logo-mark">CH</span>
            <span className="fx-header-title">Busbar Calculator</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="fx-header-nav" aria-label="Main">
            <Link href="/busbar-calculator"
              className={`fx-header-nav-link${isCalc ? ' active' : ''}`}>
              <CalculatorIcon width={16} height={16} />
              Calculator
            </Link>
            <Link href="/app/history"
              className={`fx-header-nav-link${isHistory ? ' active' : ''}`}>
              <HistoryIcon width={16} height={16} />
              History
            </Link>
          </nav>

          {/* Desktop: bell + user badge */}
          <div className="fx-header-actions">
            <button
              type="button"
              className="fx-header-bell-btn"
              aria-label="Email notifications"
              onClick={openBell}
            >
              <BellIcon width={20} height={20} />
            </button>

            <div className="fx-header-user">
              {email ? (
                <Link href="/app/profile" className={`fx-header-user-btn${isProfile ? ' active' : ''}`}
                  aria-label="Profile">
                  <span className="fx-header-avatar">
                    {email[0].toUpperCase()}
                  </span>
                  <span className="fx-header-user-email">{email}</span>
                </Link>
              ) : (
                <Link href="/app/profile" className="fx-header-user-btn" aria-label="Sign in">
                  <UserIcon width={18} height={18} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile: hamburger — opens the app menu hub */}
          <Link href="/app" className="fx-icon-btn fx-header-mobile-only" aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </Link>
        </div>
      </header>

      <FxNotifySheet open={notifyOpen} onClose={() => setNotifyOpen(false)} />
      <FxAuthSheet
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
