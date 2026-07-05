'use client';

import { useState } from 'react';

// Looks exactly like a 404. The only interactive element is a bare,
// unlabeled input — typing the admin key and pressing Enter starts the
// session. Wrong keys change nothing visible (opaque surface).
export function AdminGate() {
  const [v, setV] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: v.trim() }),
      });
      if (r.ok) { window.location.reload(); return; }
    } catch { /* stay silent */ }
    setV('');
    setBusy(false);
  }

  return (
    <div className="bcadm-gate">
      <h1>404</h1>
      <p>This page could not be found.</p>
      <form onSubmit={submit}>
        <input
          type="password"
          value={v}
          onChange={e => setV(e.target.value)}
          autoComplete="off"
          aria-label="reference"
          className="bcadm-gate-input"
        />
      </form>
    </div>
  );
}
