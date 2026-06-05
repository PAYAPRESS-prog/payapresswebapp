'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon, LetterIcon, LockIcon, PhoneIcon, BuildingsIcon,
  EditIcon, LogoutIcon, CheckCircleIcon, CloseCircleIcon,
  EyeIcon, EyeClosedIcon, MagicStickIcon,
} from './FxIcons';
import { FxHeader } from './FxHeader';
import { FxBottomNav } from './FxBottomNav';
import { FxAuthSheet } from './FxAuthSheet';

interface Profile {
  id: number;
  email: string;
  first_name: string;
  last_name:  string;
  company:    string;
  phone:      string;
}

type EditMode = 'none' | 'info' | 'password';

export function FxProfilePage({ embedded }: { embedded?: boolean } = {}) {
  const router = useRouter();
  const [authed, setAuthed]     = useState<boolean | null>(null);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<string | null>(null);

  // Personal info edit state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [company,   setCompany]   = useState('');
  const [phone,     setPhone]     = useState('');

  // Password change state
  const [currPw,    setCurrPw]    = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurr,  setShowCurr]  = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [pwError,   setPwError]   = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const loadProfile = useCallback(() => {
    fetch('/api/profile')
      .then(r => {
        if (r.status === 401) { setAuthed(false); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setAuthed(true);
        setProfile(data);
      })
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  function startEditInfo() {
    if (!profile) return;
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setCompany(profile.company);
    setPhone(profile.phone);
    setEditMode('info');
  }

  function cancelEditInfo() {
    setEditMode('none');
  }

  async function saveInfo() {
    setSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, company, phone }),
    });
    setSaving(false);
    if (res.ok) {
      setProfile(p => p ? { ...p, first_name: firstName, last_name: lastName, company, phone } : p);
      setEditMode('none');
      showToast('Profile saved');
    } else {
      showToast('Failed to save');
    }
  }

  function startEditPassword() {
    setCurrPw(''); setNewPw(''); setConfirmPw('');
    setPwError(null);
    setEditMode('password');
  }

  function cancelEditPassword() {
    setEditMode('none');
  }

  async function savePassword() {
    if (!newPw || newPw !== confirmPw) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPw.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/profile/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currPw, new_password: newPw }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setEditMode('none');
      showToast('Password changed');
    } else {
      setPwError(data?.error ?? 'Failed to change password.');
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  // ── Auth gate ──────────────────────────────────────────────────
  if (authed === null) {
    return (
      <div className={embedded ? 'fx-embed-wrap' : 'fx-app'}>
        {!embedded && <FxHeader />}
        <main className="fx-content fx-content-single">
          <div className="fx-profile-loading">Loading…</div>
        </main>
        {!embedded && <FxBottomNav active="profile" />}
      </div>
    );
  }

  if (authed === false) {
    return (
      <div className={embedded ? 'fx-embed-wrap' : 'fx-app'}>
        {!embedded && <FxHeader />}
        <main className="fx-content fx-content-single">
          <div className="fx-profile-auth-gate">
            <div className="fx-profile-auth-icon">
              <UserIcon width={48} height={48} />
            </div>
            <h2 className="fx-profile-auth-title">Your Profile</h2>
            <p className="fx-profile-auth-sub">Sign in to view and manage your account.</p>
            <FxAuthSheet
              open={true}
              mode="login"
              onClose={() => {}}
              onModeChange={() => {}}
              onSuccess={() => { loadProfile(); }}
            />
          </div>
        </main>
        {!embedded && <FxBottomNav active="profile" />}
      </div>
    );
  }

  // ── Logged-in profile UI ───────────────────────────────────────
  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email?.split('@')[0] || 'User';

  return (
    <div className={embedded ? 'fx-embed-wrap' : 'fx-app'}>
      {!embedded && <FxHeader />}
      <main className="fx-content fx-content-single">
        <div className="page-container fx-profile-page">

          {/* Avatar + name */}
          <div className="fx-profile-hero">
            <div className="fx-profile-avatar">
              <UserIcon width={36} height={36} />
            </div>
            <div className="fx-profile-hero-name">{displayName}</div>
            <div className="fx-profile-hero-email">{profile?.email}</div>
          </div>

          {/* ── Account section ── */}
          <section className="fx-profile-section">
            <div className="fx-profile-section-head">
              <span className="fx-profile-section-title">Account</span>
            </div>

            {/* Email row — read-only */}
            <div className="fx-profile-card">
              <div className="fx-profile-row">
                <LetterIcon className="fx-profile-row-icon" width={20} height={20} />
                <div className="fx-profile-row-body">
                  <span className="fx-profile-row-label">Email</span>
                  <span className="fx-profile-row-value">{profile?.email}</span>
                </div>
              </div>

              <div className="fx-profile-divider" />

              {/* Password row */}
              <div className="fx-profile-row">
                <LockIcon className="fx-profile-row-icon" width={20} height={20} />
                <div className="fx-profile-row-body">
                  <span className="fx-profile-row-label">Password</span>
                  <span className="fx-profile-row-value">••••••••</span>
                </div>
                {editMode !== 'password' && (
                  <button
                    type="button"
                    className="fx-profile-edit-btn"
                    onClick={startEditPassword}
                    aria-label="Change password"
                  >
                    <EditIcon width={18} height={18} />
                  </button>
                )}
              </div>

              {/* Change-password panel */}
              {editMode === 'password' && (
                <div className="fx-profile-pw-panel">
                  <div className="fx-profile-pw-field">
                    <input
                      type={showCurr ? 'text' : 'password'}
                      placeholder="Current password"
                      className="fx-profile-input"
                      value={currPw}
                      onChange={e => setCurrPw(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button type="button" className="fx-profile-eye" onClick={() => setShowCurr(v => !v)}>
                      {showCurr ? <EyeIcon width={18} height={18} /> : <EyeClosedIcon width={18} height={18} />}
                    </button>
                  </div>
                  <div className="fx-profile-pw-field">
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="New password"
                      className="fx-profile-input"
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button type="button" className="fx-profile-eye" onClick={() => setShowNew(v => !v)}>
                      {showNew ? <EyeIcon width={18} height={18} /> : <EyeClosedIcon width={18} height={18} />}
                    </button>
                  </div>
                  <div className="fx-profile-pw-field">
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="fx-profile-input"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  {pwError && <p className="fx-profile-pw-error">{pwError}</p>}
                  <div className="fx-profile-pw-actions">
                    <button type="button" className="fx-profile-action-btn cancel" onClick={cancelEditPassword} disabled={saving}>
                      <CloseCircleIcon width={18} height={18} /> Cancel
                    </button>
                    <button type="button" className="fx-profile-action-btn save" onClick={savePassword} disabled={saving}>
                      <CheckCircleIcon width={18} height={18} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Personal info section ── */}
          <section className="fx-profile-section">
            <div className="fx-profile-section-head">
              <span className="fx-profile-section-title">Personal Info</span>
              {editMode !== 'info' && (
                <button type="button" className="fx-profile-edit-btn" onClick={startEditInfo} aria-label="Edit personal info">
                  <EditIcon width={18} height={18} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="fx-profile-card">
              {editMode === 'info' ? (
                <>
                  <div className="fx-profile-field-row">
                    <UserIcon className="fx-profile-row-icon" width={20} height={20} />
                    <input
                      className="fx-profile-input"
                      placeholder="First name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="fx-profile-divider" />
                  <div className="fx-profile-field-row">
                    <UserIcon className="fx-profile-row-icon" width={20} height={20} />
                    <input
                      className="fx-profile-input"
                      placeholder="Last name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="fx-profile-divider" />
                  <div className="fx-profile-field-row">
                    <BuildingsIcon className="fx-profile-row-icon" width={20} height={20} />
                    <input
                      className="fx-profile-input"
                      placeholder="Company name"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      maxLength={150}
                    />
                  </div>
                  <div className="fx-profile-divider" />
                  <div className="fx-profile-field-row">
                    <PhoneIcon className="fx-profile-row-icon" width={20} height={20} />
                    <input
                      className="fx-profile-input"
                      placeholder="Phone number"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      maxLength={30}
                    />
                  </div>
                  <div className="fx-profile-pw-actions" style={{ padding: '12px 16px 8px' }}>
                    <button type="button" className="fx-profile-action-btn cancel" onClick={cancelEditInfo} disabled={saving}>
                      <CloseCircleIcon width={18} height={18} /> Cancel
                    </button>
                    <button type="button" className="fx-profile-action-btn save" onClick={saveInfo} disabled={saving}>
                      <CheckCircleIcon width={18} height={18} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ProfileInfoRow
                    icon={<UserIcon className="fx-profile-row-icon" width={20} height={20} />}
                    label="First Name"
                    value={profile?.first_name}
                  />
                  <div className="fx-profile-divider" />
                  <ProfileInfoRow
                    icon={<UserIcon className="fx-profile-row-icon" width={20} height={20} />}
                    label="Last Name"
                    value={profile?.last_name}
                  />
                  <div className="fx-profile-divider" />
                  <ProfileInfoRow
                    icon={<BuildingsIcon className="fx-profile-row-icon" width={20} height={20} />}
                    label="Company"
                    value={profile?.company}
                  />
                  <div className="fx-profile-divider" />
                  <ProfileInfoRow
                    icon={<PhoneIcon className="fx-profile-row-icon" width={20} height={20} />}
                    label="Phone"
                    value={profile?.phone}
                  />
                </>
              )}
            </div>
          </section>

          {/* ── Replay onboarding tour ── */}
          <button
            type="button"
            className="fx-profile-tour-btn"
            onClick={() => window.dispatchEvent(new Event('pp:tour:start'))}
          >
            <MagicStickIcon width={20} height={20} />
            Show app tour
          </button>

          {/* ── Logout ── */}
          <button type="button" className="fx-profile-logout-btn" onClick={handleLogout}>
            <LogoutIcon width={20} height={20} />
            Log Out
          </button>
        </div>
      </main>

      {toast && <div className="fx-save-toast" role="status">{toast}</div>}

      {/* Legal footer */}
      <div className="fx-profile-legal">
        <a href="/terms" className="fx-profile-legal-link">Terms of Use</a>
        <span className="fx-profile-legal-sep">·</span>
        <a href="/privacy" className="fx-profile-legal-link">Privacy Policy</a>
        <span className="fx-profile-legal-sep">·</span>
        <span className="fx-profile-legal-copy">© 2025 PAYAP MACHINERY</span>
      </div>

      {!embedded && <FxBottomNav active="profile" />}
    </div>
  );
}

function ProfileInfoRow({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="fx-profile-row">
      {icon}
      <div className="fx-profile-row-body">
        <span className="fx-profile-row-label">{label}</span>
        <span className={`fx-profile-row-value${!value ? ' empty' : ''}`}>
          {value || '—'}
        </span>
      </div>
    </div>
  );
}
