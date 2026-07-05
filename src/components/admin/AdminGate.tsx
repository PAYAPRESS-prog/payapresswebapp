'use client';

import { useEffect, useRef, useState } from 'react';

// Looks exactly like a 404. The only interactive element is a bare,
// unlabeled input — typing the admin key and pressing Enter starts the
// session. A rejected key only shakes the input briefly (no words that
// would advertise what this page is). Also accepts /admin?key=… and
// auto-submits it once — a rescue path when typing is impractical.
export function AdminGate() {
  const [v, setV] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const triedUrlKey = useRef(false);

  async function tryKey(key: string) {
    if (!key.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      });
      if (r.ok) {
        // Drop ?key= from the address bar before reloading into the panel.
        window.history.replaceState(null, '', '/admin');
        window.location.reload();
        return;
      }
    } catch { /* fall through to the shake */ }
    setV('');
    setBusy(false);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  useEffect(() => {
    if (triedUrlKey.current) return;
    triedUrlKey.current = true;
    const key = new URLSearchParams(window.location.search).get('key');
    if (key) tryKey(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bcadm-gate">
      <h1>404</h1>
      <p>This page could not be found.</p>
      <form onSubmit={e => { e.preventDefault(); tryKey(v); }}>
        <input
          type="password"
          value={v}
          onChange={e => setV(e.target.value)}
          autoComplete="off"
          aria-label="reference"
          className={`bcadm-gate-input${shake ? ' is-shake' : ''}${busy ? ' is-busy' : ''}`}
        />
      </form>
    </div>
  );
}
