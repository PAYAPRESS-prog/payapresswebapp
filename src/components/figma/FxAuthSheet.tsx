'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { LetterIcon, EyeIcon, EyeClosedIcon } from './FxIcons';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';

type Mode = 'login' | 'signup';

export function FxAuthSheet({
  open,
  mode,
  onClose,
  onModeChange,
  onSuccess,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onModeChange: (m: Mode) => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const formId = useId();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat]     = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [optIn, setOptIn]       = useState(true);
  // Default to "remember" so a logged-in user isn't asked to sign in again
  // on their next visit — the session cookie persists for 30 days.
  const [remember, setRemember] = useState(true);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [errorSwitch, setErrorSwitch] = useState<'login' | 'signup' | null>(null);
  const [mounted, setMounted] = useState(false);
  // 'form' = login/signup · 'forgot'/'sent' = password reset ·
  // 'otp' = signup email-verification code entry
  const [view, setView] = useState<'form' | 'forgot' | 'sent' | 'otp'>('form');
  const [otpToken, setOtpToken] = useState('');
  const [otpCode,  setOtpCode]  = useState('');

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while the sheet is open
  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => { unlockBodyScroll(); };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset to the normal form whenever the sheet is (re)opened
  useEffect(() => { if (open) setView('form'); }, [open]);

  if (!open || !mounted) return null;

  const isSignup = mode === 'signup';

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/signup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otpToken, code: otpCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      if (onSuccess) { onSuccess(); onClose(); }
      else router.push('/app');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleOtpResend() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, optIn }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.pending && data?.token) {
        setOtpToken(data.token);
        setOtpCode('');
        setError(null);
      } else {
        setError(data?.error || 'Could not resend the code.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setView('sent');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

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
        if (res.status === 409) setErrorSwitch('login');
        else if (res.status === 404) setErrorSwitch('signup');
        else setErrorSwitch(null);
        return;
      }
      // Signup now requires the emailed 6-digit code before the
      // account exists — switch to the code-entry view.
      if (data?.pending && data?.token) {
        setOtpToken(data.token);
        setOtpCode('');
        setView('otp');
        return;
      }
      // Success
      if (onSuccess) {
        onSuccess();
        onClose();
      } else {
        router.push('/app');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div
      className="fx-sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isSignup ? 'Sign up' : 'Log in'}
      onClick={onClose}
    >
      <div className="fx-sheet" onClick={e => e.stopPropagation()}>
        {view === 'otp' ? (
          <>
            <h2 className="fx-sheet-title">Check your email</h2>
            <p className="fx-auth-forgot-sub">
              We sent a 6-digit code to <strong>{email.trim()}</strong>.
              Enter it below to finish creating your account.
            </p>
            <form onSubmit={handleOtpVerify} className="fx-auth-form">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="······"
                className="fx-otp-input"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                autoFocus
              />
              {error && (
                <div className="fx-auth-error-wrap" role="alert">
                  <p className="fx-auth-error">{error}</p>
                </div>
              )}
              <button type="submit" className="fx-auth-submit" disabled={busy}>
                {busy ? 'Please wait…' : 'Verify & Create Account'}
              </button>
              <button
                type="button"
                className="fx-auth-forgot fx-auth-back"
                onClick={handleOtpResend}
                disabled={busy}
              >
                Resend code
              </button>
              <button
                type="button"
                className="fx-auth-forgot fx-auth-back"
                onClick={() => { setError(null); setView('form'); }}
              >
                ← Change email
              </button>
            </form>
          </>
        ) : view === 'forgot' ? (
          <>
            <h2 className="fx-sheet-title">Reset your password</h2>
            <p className="fx-auth-forgot-sub">
              Enter your account email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleForgot} className="fx-auth-form">
              <div className="fx-auth-field">
                <input
                  id={`${formId}-femail`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder=" "
                  className={`fx-auth-input${email ? ' has-value' : ''}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <label htmlFor={`${formId}-femail`} className="fx-auth-label">Email</label>
                <LetterIcon className="fx-auth-icon" width={22} height={22} />
              </div>

              {error && (
                <div className="fx-auth-error-wrap" role="alert">
                  <p className="fx-auth-error">{error}</p>
                </div>
              )}

              <button type="submit" className="fx-auth-submit" disabled={busy}>
                {busy ? 'Please wait…' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                className="fx-auth-forgot fx-auth-back"
                onClick={() => { setError(null); setView('form'); }}
              >
                ← Back to Log In
              </button>
            </form>
          </>
        ) : view === 'sent' ? (
          <>
            <h2 className="fx-sheet-title">Check your inbox</h2>
            <p className="fx-auth-forgot-sub">
              If an account exists for <strong>{email.trim()}</strong>, a password-reset
              link is on its way. The link expires in 30 minutes.
            </p>
            <button
              type="button"
              className="fx-auth-submit"
              onClick={() => setView('form')}
            >
              Back to Log In
            </button>
          </>
        ) : (
        <>
        <h2 className="fx-sheet-title">
          {isSignup ? 'Grow your business with Busbar calculator' : 'For more please login to your account'}
        </h2>

        {/* Tab toggle */}
        <div className="fx-auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`fx-auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => { onModeChange('login'); setError(null); setErrorSwitch(null); }}
          >
            Log In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`fx-auth-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => { onModeChange('signup'); setError(null); setErrorSwitch(null); }}
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
              <button
                type="button"
                className="fx-auth-forgot"
                onClick={() => { setError(null); setView('forgot'); }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <div className="fx-auth-error-wrap" role="alert">
              <p className="fx-auth-error">{error}</p>
              {errorSwitch && (
                <button
                  type="button"
                  className="fx-auth-error-switch"
                  onClick={() => { onModeChange(errorSwitch); setError(null); setErrorSwitch(null); }}
                >
                  {errorSwitch === 'login' ? 'Go to Log In →' : 'Go to Sign Up →'}
                </button>
              )}
            </div>
          )}

          <button type="submit" className="fx-auth-submit" disabled={busy}>
            {busy ? 'Please wait…' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        </>
        )}
      </div>
    </div>,
    document.body,
  );
}
