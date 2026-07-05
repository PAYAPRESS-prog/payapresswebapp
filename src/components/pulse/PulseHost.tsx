'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PulseSurvey } from './PulsePlayer';

// Lazy: the player (and its CSS work) loads only when a survey opens.
const PulsePlayer = dynamic(() => import('./PulsePlayer'), { ssr: false });

/* Busbar Pulse — trigger engine + invitation toast.
   Counts calculates / bookmarks / waste runs in-session by chaining
   window.bcTrack, tracks distinct visit days in localStorage, applies
   the frequency guards, then shows a small invitation toast. Manual
   entry points dispatch `bc:pulse:open`. */

// ── TEST MODE ────────────────────────────────────────────────
// While the app is in its beta/testing phase we ask much more often:
// invites fire on the FIRST qualifying action, the 2-minute grace and
// 14-day cap are off, and snoozes are hours instead of weeks. Flip to
// false for the public/production behaviour.
const TEST_MODE = true;

const LAST_PROMPT_KEY = 'bc_fb_last';          // any prompt shown
const FIRST_SEEN_KEY  = 'bc_pulse_first';
const DAYS_KEY        = 'bc_pulse_days';
const SNOOZE_PREFIX   = 'bc_pulse_s_';          // per-survey snooze until (ms)
const PROMPT_EVERY_MS = TEST_MODE ? 0 : 14 * 86400_000;
const DISMISS_SNOOZE  = TEST_MODE ? 4 * 3600_000  : 30 * 86400_000;  // 4h in test
const DONE_SNOOZE     = TEST_MODE ? 24 * 3600_000 : 60 * 86400_000;  // 1d in test

function lsGet(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k: string, v: string): void { try { localStorage.setItem(k, v); } catch { /* private mode */ } }

// Persistent (frequency) guards — if these fail, don't ask this time.
function frequencyOk(slug: string): boolean {
  const now = Date.now();
  const first = Number(lsGet(FIRST_SEEN_KEY));
  if (!first) { lsSet(FIRST_SEEN_KEY, String(now)); if (!TEST_MODE) return false; }
  if (!TEST_MODE && now - Number(first || now) < 2 * 60_000) return false; // first 2 minutes
  const last = Number(lsGet(LAST_PROMPT_KEY));
  if (PROMPT_EVERY_MS && last && now - last < PROMPT_EVERY_MS) return false; // global cap
  const snooze = Number(lsGet(SNOOZE_PREFIX + slug));
  if (snooze && now < snooze) return false;                      // per-survey snooze
  return true;
}

// Transient guard — a sheet/tour is open or the user is typing. When
// only THIS fails (e.g. the mobile results sheet opens with the same
// tap that triggered us) we wait politely and ask once the UI is idle.
function uiIdle(): boolean {
  if (document.body.style.overflow === 'hidden') return false;
  const ae = document.activeElement;
  if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return false;
  return true;
}

function markVisitDay(): number {
  const today = new Date().toISOString().slice(0, 10);
  const raw = lsGet(DAYS_KEY);
  let days: string[] = [];
  try { days = raw ? JSON.parse(raw) : []; } catch { days = []; }
  if (!days.includes(today)) { days.push(today); days = days.slice(-30); lsSet(DAYS_KEY, JSON.stringify(days)); }
  return days.length;
}

export function PulseHost() {
  const [invite, setInvite] = useState<PulseSurvey | null>(null);
  const [open, setOpen] = useState<PulseSurvey | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const counts = useRef<Record<string, number>>({});
  const promptedThisSession = useRef(false);

  const idleWaiter = useRef<ReturnType<typeof setInterval> | null>(null);

  const tryTrigger = useCallback(async (trigger: string, n: number) => {
    if (promptedThisSession.current) return;
    try {
      let r = await fetch(`/api/survey/active?trigger=${trigger}`);
      // Test mode: if no survey is bound to this trigger, fall back to
      // the default one so EVERY section produces tester feedback.
      if (r.status !== 200 && TEST_MODE) r = await fetch('/api/survey/active?trigger=manual');
      if (r.status !== 200) return;
      const s = await r.json();
      if (!s?.id) return;
      const need = TEST_MODE ? 1 : (s.triggerN ?? 1);
      if (n < need) return;
      if (!frequencyOk(s.slug)) return;

      const show = () => {
        if (promptedThisSession.current) return;
        promptedThisSession.current = true;
        lsSet(LAST_PROMPT_KEY, String(Date.now()));
        setInvite(s);
        try { window.bcTrack?.('pulse_invited'); } catch { /* noop */ }
      };
      if (uiIdle()) { show(); return; }
      // UI busy (results sheet just opened, etc.) — wait up to 60s for idle.
      if (idleWaiter.current) return;
      let tries = 0;
      idleWaiter.current = setInterval(() => {
        tries++;
        if (uiIdle()) {
          if (idleWaiter.current) clearInterval(idleWaiter.current);
          idleWaiter.current = null;
          show();
        } else if (tries > 60) {
          if (idleWaiter.current) clearInterval(idleWaiter.current);
          idleWaiter.current = null;
        }
      }, 1000);
    } catch { /* offline — never bother the user */ }
  }, []);

  useEffect(() => () => {
    if (idleWaiter.current) clearInterval(idleWaiter.current);
  }, []);

  // Chain window.bcTrack to observe app events without touching them.
  useEffect(() => {
    const prev = window.bcTrack;
    window.bcTrack = (event: string, meta?: string) => {
      try { prev?.(event, meta); } catch { /* keep chain alive */ }
      const c = counts.current;
      if (event === 'calculate') { c.calculate = (c.calculate ?? 0) + 1; tryTrigger('post_calculate', c.calculate); }
      if (event === 'bookmark')  { c.bookmark  = (c.bookmark ?? 0) + 1;  tryTrigger('post_bookmark', c.bookmark); }
      if (event === 'waste')     { c.waste     = (c.waste ?? 0) + 1;     tryTrigger('post_waste', c.waste); }
    };
    return () => { window.bcTrack = prev; };
  }, [tryTrigger]);

  // Visit-day trigger + login state (for the optional email field).
  useEffect(() => {
    const days = markVisitDay();
    // Test mode: also invite after ~25s of simply exploring the page.
    const t = setTimeout(
      () => tryTrigger('nth_visit', TEST_MODE ? 99 : days),
      TEST_MODE ? 25_000 : 8000,
    );
    fetch('/api/auth/me', { signal: AbortSignal.timeout(4000) })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setLoggedIn(Boolean(d?.user)))
      .catch(() => {});
    return () => clearTimeout(t);
  }, [tryTrigger]);

  // Manual entry points (menu row / header icon) — always allowed.
  useEffect(() => {
    const onOpen = async () => {
      try {
        const r = await fetch('/api/survey/active?trigger=manual');
        if (r.status !== 200) return;
        const s = await r.json();
        if (s?.id) {
          setInvite(null); setOpen(s);
          try { window.bcTrack?.('pulse_opened'); } catch { /* noop */ }
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('bc:pulse:open', onOpen);
    return () => window.removeEventListener('bc:pulse:open', onOpen);
  }, []);

  function acceptInvite() {
    if (!invite) return;
    setOpen(invite); setInvite(null);
    try { window.bcTrack?.('pulse_opened'); } catch { /* noop */ }
  }
  function dismissInvite() {
    if (invite) lsSet(SNOOZE_PREFIX + invite.slug, String(Date.now() + DISMISS_SNOOZE));
    setInvite(null);
    try { window.bcTrack?.('pulse_dismissed'); } catch { /* noop */ }
  }

  return (
    <>
      {invite && (
        <div className="plx-invite" role="status">
          <span className="plx-invite-txt">Got 30 seconds to make this app better?</span>
          <button type="button" className="plx-invite-yes" onClick={acceptInvite}>Sure</button>
          <button type="button" className="plx-invite-no" onClick={dismissInvite}>Not now</button>
        </div>
      )}
      {open && (
        <PulsePlayer
          survey={open}
          loggedIn={loggedIn}
          onClose={() => setOpen(null)}
          onComplete={() => lsSet(SNOOZE_PREFIX + open.slug, String(Date.now() + DONE_SNOOZE))}
        />
      )}
    </>
  );
}
