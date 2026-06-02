'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LetterIcon, EyeIcon, EyeClosedIcon } from './FxIcons';

type Mode = 'login' | 'signup';

export function FxAuthSheet({
  open,
  mode,
  onClose,
  onModeChange,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onModeChange: (m: Mode) => void;
}) {
  const router = useRouter();
  const formId = useId();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat]     = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [optIn, setOptIn]       = useState(true);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Lock body scroll while the sheet is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSignup = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (isSignup && password !== repeat) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignup
        ? { email, password, optIn }
        : { email, password, remember };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      // Success → enter the calculator
      router.push('/busbar-calculator');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fx-sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isSignup ? 'Sign up' : 'Log in'}
      onClick={onClose}
    >
      <div className="fx-sheet" onClick={e => e.stopPropagation()}>
        <h2 className="fx-sheet-title">For more please login to your account</h2>

        {/* Tab toggle */}
        <div className="fx-auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`fx-auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => { onModeChange('login'); setError(null); }}
          >
            Log In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`fx-auth-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => { onModeChange('signup'); setError(null); }}
          >
            Sign Up
          </button>
        </div>

        <div className="fx-sheet-divider" />

        <form onSubmit={handleSubmit} className="fx-auth-form">
          {/* Email */}
          <div className="fx-auth-field">
            <input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder=" "
              className={`fx-auth-input${email ? ' has-value' : ''}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label htmlFor={`${formId}-email`} className="fx-auth-label">Email</label>
            <LetterIcon className="fx-auth-icon" width={22} height={22} />
          </div>

          {/* Password */}
          <div className="fx-auth-field">
            <input
              id={`${formId}-pw`}
              type={showPw ? 'text' : 'password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder=" "
              className={`fx-auth-input${password ? ' has-value' : ''}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <label htmlFor={`${formId}-pw`} className="fx-auth-label">Password</label>
            <button
              type="button"
              className="fx-auth-icon-btn"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw(v => !v)}
            >
              {showPw
                ? <EyeIcon className="fx-auth-icon" width={22} height={22} />
                : <EyeClosedIcon className="fx-auth-icon" width={22} height={22} />}
            </button>
          </div>

          {/* Repeat password — signup only */}
          {isSignup && (
            <div className="fx-auth-field">
              <input
                id={`${formId}-rpw`}
                type={showRepeat ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder=" "
                className={`fx-auth-input${repeat ? ' has-value' : ''}`}
                value={repeat}
                onChange={e => setRepeat(e.target.value)}
              />
              <label htmlFor={`${formId}-rpw`} className="fx-auth-label">Repeat Password</label>
              <button
                type="button"
                className="fx-auth-icon-btn"
                aria-label={showRepeat ? 'Hide password' : 'Show password'}
                onClick={() => setShowRepeat(v => !v)}
              >
                {showRepeat
                  ? <EyeIcon className="fx-auth-icon" width={22} height={22} />
                  : <EyeClosedIcon className="fx-auth-icon" width={22} height={22} />}
              </button>
            </div>
          )}

          {/* Row: opt-in (signup) OR remember + forgot (login) */}
          {isSignup ? (
            <label className="fx-auth-check">
              <input
                type="checkbox"
                checked={optIn}
                onChange={e => setOptIn(e.target.checked)}
              />
              <span className="fx-auth-checkbox" aria-hidden="true" />
              <span>Email news and other stuff to me</span>
            </label>
          ) : (
            <div className="fx-auth-row">
              <label className="fx-auth-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span className="fx-auth-checkbox" aria-hidden="true" />
                <span>Remember me</span>
              </label>
              <button type="button" className="fx-auth-forgot">Forgot Password?</button>
            </div>
          )}

          {error && <p className="fx-auth-error" role="alert">{error}</p>}

          <button type="submit" className="fx-auth-submit" disabled={busy}>
            {busy ? 'Please wait…' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
