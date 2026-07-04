'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeClosedIcon } from './FxIcons';

// Password-reset landing page — opened from the email link
// (/reset-password?token=...). Reuses the auth-sheet form styling.
export function FxResetPassword() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [repeat, setRepeat]     = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== repeat) { setError('Passwords do not match.'); return; }

    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/app'), 1600);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fx-welcome">
      <div className="fx-welcome-bg" aria-hidden="true" />
      <div className="fx-reset-wrap">
        <div className="fx-sheet fx-reset-card">
          <h2 className="fx-sheet-title">
            {done ? 'Password changed ✓' : 'Choose a new password'}
          </h2>

          {done ? (
            <p className="fx-reset-done">You are now signed in. Redirecting…</p>
          ) : !token ? (
            <p className="fx-reset-done">
              This reset link is incomplete. Please open the link from your email again,
              or request a new one from the login screen.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="fx-auth-form">
              <div className="fx-auth-field">
                <input
                  id="rp-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder=" "
                  className={`fx-auth-input${password ? ' has-value' : ''}`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <label htmlFor="rp-pw" className="fx-auth-label">New Password</label>
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

              <div className="fx-auth-field">
                <input
                  id="rp-rpw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder=" "
                  className={`fx-auth-input${repeat ? ' has-value' : ''}`}
                  value={repeat}
                  onChange={e => setRepeat(e.target.value)}
                />
                <label htmlFor="rp-rpw" className="fx-auth-label">Repeat New Password</label>
              </div>

              {error && (
                <div className="fx-auth-error-wrap" role="alert">
                  <p className="fx-auth-error">{error}</p>
                </div>
              )}

              <button type="submit" className="fx-auth-submit" disabled={busy}>
                {busy ? 'Please wait…' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
