'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * First-run onboarding tour — Instagram/professional-app style.
 *
 * Spotlights key parts of the calculator one step at a time with a dimmed
 * backdrop, a cut-out highlight around the target, and a tooltip card with
 * Back / Next / Skip controls. Shown once per device (localStorage flag);
 * can be relaunched via the `pp:tour:start` window event.
 *
 * Positioning is fully measured at runtime (target rect + tooltip size) and
 * clamped into the viewport, so it stays correct on every screen size,
 * orientation, and safe-area inset.
 */

const STORAGE_KEY = 'pp_tour_seen_v1';

interface Step {
  /** data-tour attribute value of the element to spotlight */
  target: string;
  title: string;
  body: string;
  /** Preferred tooltip side; auto-flips when there's no room */
  prefer?: 'top' | 'bottom';
}

const STEPS: Step[] = [
  {
    target: 'metal',
    title: 'Choose your metal',
    body: 'Switch between Copper and Aluminum. Prices update live from COMEX & LME.',
    prefer: 'bottom',
  },
  {
    target: 'grade',
    title: 'Pick the alloy grade',
    body: 'Select the exact grade and purity — each one adjusts the price with its busbar premium.',
    prefer: 'bottom',
  },
  {
    target: 'suggestions',
    title: 'Quick-size presets',
    body: 'Tap a preset like 100×10 to instantly fill width and thickness.',
    prefer: 'bottom',
  },
  {
    target: 'dimensions',
    title: 'Enter dimensions',
    body: 'Type length, width and thickness in millimeters for a precise estimate.',
    prefer: 'top',
  },
  {
    target: 'busbar',
    title: 'Drag to resize',
    body: 'Drag on the 3D busbar to change width and thickness — it reshapes live as you go.',
    prefer: 'top',
  },
  {
    target: 'calculate',
    title: 'Calculate the cost',
    body: 'Press Calculate Now to see the price, weight, rated current and currency conversions.',
    prefer: 'top',
  },
  {
    target: 'nav',
    title: 'Switch sections',
    body: 'Swipe left or right — or use these tabs — to reach your saved History and Profile.',
    prefer: 'top',
  },
];

const PAD = 8;            // spotlight padding around the target
const GAP = 12;           // gap between spotlight and tooltip
const EDGE = 12;          // min distance from any viewport edge
const MAX_TIP_W = 320;    // tooltip max width

interface Spot { top: number; left: number; width: number; height: number; }
interface Tip {
  top: number; left: number; width: number;
  arrow: 'up' | 'down' | null;
  arrowX: number; // px from tooltip's left edge to the arrow tip
}

/** Reads an env(safe-area-inset-*) value in px via a one-off probe element. */
function readSafeInsets(): { top: number; bottom: number } {
  if (typeof window === 'undefined') return { top: 0, bottom: 0 };
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;' +
    'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const top = parseFloat(cs.paddingTop) || 0;
  const bottom = parseFloat(cs.paddingBottom) || 0;
  probe.remove();
  return { top, bottom };
}

export function FxTour() {
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [idx, setIdx] = useState(0);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // A sheet/dialog being open locks body scroll (src/lib/scrollLock.ts).
  // The tour sits at z-9000 — starting it over an open sheet would cover
  // the sheet and swallow its clicks (e.g. the Sign Up tab). So the tour
  // only ever starts when the app is idle, and steps aside if a sheet
  // opens mid-tour.
  const sheetIsOpen = () =>
    typeof document !== 'undefined' && document.body.style.overflow === 'hidden';

  // Decide whether to run on first mount — wait until the open-splash is
  // gone AND no sheet is open (keeps polling until the app is idle).
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(STORAGE_KEY) === '1'; } catch { /* ignore */ }
    if (seen) return;
    let timer: ReturnType<typeof setTimeout>;
    const tryStart = () => {
      if (sheetIsOpen()) { timer = setTimeout(tryStart, 900); return; }
      setActive(true);
    };
    timer = setTimeout(tryStart, 2300); // splash hides ~2100ms
    return () => clearTimeout(timer);
  }, []);

  // Allow relaunching from elsewhere (e.g. a "Show tutorial" button) —
  // same idle gate as the auto-start.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const start = () => {
      if (sheetIsOpen()) { timer = setTimeout(start, 900); return; }
      setIdx(0); setActive(true);
    };
    window.addEventListener('pp:tour:start', start);
    return () => {
      window.removeEventListener('pp:tour:start', start);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // If a sheet opens while the tour is showing, pause the tour (keeping
  // the current step) and resume once the sheet closes.
  useEffect(() => {
    if (!active && !paused) return;
    const iv = setInterval(() => {
      if (active && sheetIsOpen()) { setActive(false); setPaused(true); }
      else if (paused && !sheetIsOpen()) { setPaused(false); setActive(true); }
    }, 700);
    return () => clearInterval(iv);
  }, [active, paused]);

  const finish = useCallback(() => {
    setActive(false);
    setPaused(false); // a finished tour must never auto-resume
    setSpot(null);
    setTip(null);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
  }, []);

  const next = useCallback(() => {
    setIdx(i => (i >= STEPS.length - 1 ? i : i + 1));
  }, []);
  const back = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);

  // Measure target + tooltip, then place the tooltip clamped into the viewport.
  const measure = useCallback(() => {
    if (!active) return;
    const step = STEPS[idx];
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { top: insTop, bottom: insBot } = readSafeInsets();

    if (!el) { setSpot(null); setTip(null); return; }

    const r = el.getBoundingClientRect();
    const s: Spot = {
      top:    Math.max(EDGE, r.top - PAD),
      left:   Math.max(EDGE, r.left - PAD),
      width:  Math.min(vw - 2 * EDGE, r.width + 2 * PAD),
      height: Math.min(vh - 2 * EDGE, r.height + 2 * PAD),
    };

    const tipW = Math.min(MAX_TIP_W, vw - 2 * EDGE);
    const tipH = tipRef.current?.offsetHeight ?? 210; // estimate before first paint

    const spaceBelow = vh - (s.top + s.height) - insBot;
    const spaceAbove = s.top - insTop;
    const need = tipH + GAP + EDGE;

    // Honor preference, flip when the preferred side can't fit.
    let placeBelow = step.prefer === 'top'
      ? spaceAbove < need && spaceBelow >= spaceAbove
      : !(spaceBelow < need && spaceAbove > spaceBelow);

    let top: number;
    let arrow: 'up' | 'down' | null;
    if (placeBelow) {
      top = s.top + s.height + GAP;
      arrow = 'up';
    } else {
      top = s.top - GAP - tipH;
      arrow = 'down';
    }
    // Vertical clamp — never let the card leave the safe viewport.
    top = Math.max(EDGE + insTop, Math.min(vh - tipH - EDGE - insBot, top));

    // Horizontal: center on the target, clamp to edges.
    const targetCx = r.left + r.width / 2;
    const left = Math.max(EDGE, Math.min(vw - tipW - EDGE, targetCx - tipW / 2));

    // Arrow points at the target center within the (possibly clamped) card.
    const arrowX = Math.max(16, Math.min(tipW - 16, targetCx - left));

    // If the card ended up overlapping the spotlight (tight screens), drop the arrow.
    const cardBottom = top + tipH;
    const overlaps = cardBottom > s.top - 2 && top < s.top + s.height + 2;
    if (overlaps) arrow = null;

    setSpot(s);
    setTip({ top, left, width: tipW, arrow, arrowX });
  }, [active, idx]);

  // Scroll the target into view, then measure (with settle passes for animation)
  useLayoutEffect(() => {
    if (!active) return;
    const step = STEPS[idx];
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    measure();
    const ids = [80, 240, 480].map(d => setTimeout(measure, d));
    return () => ids.forEach(clearTimeout);
  }, [active, idx, measure]);

  // Re-place once the tooltip's real height is known (two-pass refinement)
  useLayoutEffect(() => {
    if (active && tip) measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip?.width]);

  // Track scroll / resize / orientation
  useEffect(() => {
    if (!active) return;
    const onChange = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
      window.removeEventListener('scroll', onChange, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, measure]);

  // Keyboard nav
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, finish, next, back]);

  if (!active) return null;

  const isLast = idx === STEPS.length - 1;
  const step = STEPS[idx];
  const advance = () => (isLast ? finish() : next());

  return (
    <div className="fx-tour" role="dialog" aria-modal="true" aria-label="Getting started tour">
      {/* Dimmed backdrop with a cut-out hole around the target.
          Clicking the backdrop advances to the next step. */}
      {spot ? (
        <div
          className="fx-tour-spot"
          style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          onClick={advance}
        />
      ) : (
        <div className="fx-tour-dim" onClick={advance} />
      )}

      {/* Tooltip card */}
      <div
        ref={tipRef}
        className={`fx-tour-tip${tip?.arrow ? ` arrow-${tip.arrow}` : ''}`}
        style={{
          top:  tip ? tip.top  : '50%',
          left: tip ? tip.left : '50%',
          width: tip ? tip.width : Math.min(MAX_TIP_W, 320),
          transform: tip ? undefined : 'translate(-50%, -50%)',
          ['--arrow-x' as string]: tip ? `${tip.arrowX}px` : '50%',
          visibility: tip ? 'visible' : 'hidden',
        }}
      >
        <div className="fx-tour-tip-head">
          <span className="fx-tour-step">{idx + 1} / {STEPS.length}</span>
          <button type="button" className="fx-tour-skip" onClick={finish}>Skip</button>
        </div>
        <h3 className="fx-tour-title">{step.title}</h3>
        <p className="fx-tour-body">{step.body}</p>

        <div className="fx-tour-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`fx-tour-dot${i === idx ? ' active' : ''}`} />
          ))}
        </div>

        <div className="fx-tour-actions">
          {idx > 0 ? (
            <button type="button" className="fx-tour-btn fx-tour-btn-back" onClick={back}>
              Back
            </button>
          ) : <span />}
          <button type="button" className="fx-tour-btn fx-tour-btn-next" onClick={advance}>
            {isLast ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
