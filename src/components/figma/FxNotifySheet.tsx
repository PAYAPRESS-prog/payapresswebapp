'use client';

import { useEffect, useRef, useState } from 'react';
import { BellIcon, CheckCircleIcon, LetterIcon } from './FxIcons';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function FxNotifySheet({ open, onClose }: Props) {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errMsg,  setErrMsg]  = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* Pre-fill with logged-in user email */
  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setErrMsg('');
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user?.email) setEmail(d.user.email); })
      .catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 320);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading' || status === 'done') return;
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setStatus('done');
      } else {
        const d = await res.json();
        setErrMsg(d.error === 'invalid_email' ? 'Please enter a valid email address.' : 'Something went wrong. Try again.');
        setStatus('error');
      }
    } catch {
      setErrMsg('Connection error. Please try again.');
      setStatus('error');
    }
  }

  if (!open) return null;

  return (
    <div
      className="fx-notify-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Email Notifications"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fx-notify-sheet">
        {/* Handle */}
        <div className="fx-notify-handle" />

        {/* Header */}
        <div className="fx-notify-header">
          <div className="fx-notify-bell-wrap">
            <BellIcon width={28} height={28} />
            <span className="fx-notify-bell-ring" />
          </div>
          <button type="button" className="fx-notify-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {status === 'done' ? (
          /* ── Success state ── */
          <div className="fx-notify-success">
            <span className="fx-notify-success-icon">
              <CheckCircleIcon width={48} height={48} />
            </span>
            <h3 className="fx-notify-success-title">You&apos;re subscribed!</h3>
            <p className="fx-notify-success-sub">
              Daily reports will be sent to<br />
              <strong>{email}</strong>
            </p>
            <button type="button" className="fx-notify-done-btn" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          /* ── Subscribe form ── */
          <form className="fx-notify-body" onSubmit={handleSubmit} noValidate>
            <div className="fx-notify-title-row">
              <h2 className="fx-notify-title">Daily Email Reports</h2>
              <span className="fx-notify-badge">Free</span>
            </div>

            <p className="fx-notify-desc">
              By entering your email, you&apos;ll receive a daily report
              containing all your saved calculations along with their
              current prices — straight to your inbox, every morning.
            </p>

            <ul className="fx-notify-features">
              <li><span className="fx-notify-check">✓</span> All saved busbars in one email</li>
              <li><span className="fx-notify-check">✓</span> Live copper &amp; aluminum prices</li>
              <li><span className="fx-notify-check">✓</span> Daily delivery, unsubscribe anytime</li>
            </ul>

            {/* Email input */}
            <div className={`fx-notify-field${status === 'error' ? ' has-error' : ''}`}>
              <span className="fx-notify-field-icon">
                <LetterIcon width={18} height={18} />
              </span>
              <input
                ref={inputRef}
                type="email"
                autoComplete="email"
                inputMode="email"
                className="fx-notify-input"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setStatus('idle'); setErrMsg(''); }}
                disabled={status === 'loading'}
                required
              />
            </div>
            {errMsg && <p className="fx-notify-err">{errMsg}</p>}

            <button
              type="submit"
              className="fx-notify-submit"
              disabled={status === 'loading' || !email.trim()}
            >
              {status === 'loading' ? (
                <span className="fx-notify-spinner" />
              ) : (
                <>
                  <BellIcon width={18} height={18} />
                  Subscribe for Free
                </>
              )}
            </button>

            <p className="fx-notify-privacy">
              No spam. One email per day. Unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
