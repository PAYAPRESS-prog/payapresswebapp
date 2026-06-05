'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * First-run onboarding tour — Instagram/professional-app style.
 *
 * Spotlights key parts of the calculator one step at a time with a dimmed
 * backdrop, a cut-out highlight around the target, and a tooltip card with
 * Back / Next / Skip controls. Shown once per device (localStorage flag);
 * can be relaunched via the `pp:tour:start` window event.
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

const PAD = 8;       // spotlight padding around the target
const GAP = 14;      // gap between spotlight and tooltip
const TOOLTIP_W = 300;

interface Rect { top: number; left: number; width: number; height: number; }

export function FxTour() {
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef<number | null>(null);

  // Decide whether to run on first mount
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(STORAGE_KEY) === '1'; } catch { /* ignore */ }
    if (!seen) {
      // Wait for the calculator panel to settle (swipe positioning, fonts)
      const id = setTimeout(() => setActive(true), 650);
      return () => clearTimeout(id);
    }
  }, []);

  // Allow relaunching from elsewhere (e.g. a "Show tutorial" button)
  useEffect(() => {
    const start = () => { setIdx(0); setActive(true); };
    window.addEventListener('pp:tour:start', start);
    return () => window.removeEventListener('pp:tour:start', start);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
  }, []);

  const measure = useCallback(() => {
    if (!active) return;
    const step = STEPS[idx];
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [active, idx]);

  // Scroll the current target into view, then measure (with settle delay)
  useLayoutEffect(() => {
    if (!active) return;
    const step = STEPS[idx];
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    measure();
    const t1 = setTimeout(measure, 220);
    const t2 = setTimeout(measure, 480);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active, idx, measure]);

  // Keep the spotlight glued to the target during scroll / resize
  useEffect(() => {
    if (!active) return;
    const onChange = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, measure]);

  // Keyboard: arrows + escape
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      else if (e.key === 'ArrowRight') setIdx(i => Math.min(STEPS.length - 1, i + 1));
      else if (e.key === 'ArrowLeft')  setIdx(i => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, finish]);

  if (!active) return null;

  const isLast = idx === STEPS.length - 1;
  const step = STEPS[idx];

  // Spotlight box (clamped to viewport)
  const vw = typeof window !== 'undefined' ? window.innerWidth : 480;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const spot = rect ? {
    top:    Math.max(PAD, rect.top - PAD),
    left:   Math.max(PAD, rect.left - PAD),
    width:  Math.min(vw - 2 * PAD, rect.width + 2 * PAD),
    height: rect.height + 2 * PAD,
  } : null;

  // Tooltip placement — below if target sits in the top half, else above
  let tipTop = vh / 2;
  let tipLeft = (vw - TOOLTIP_W) / 2;
  let arrow: 'up' | 'down' | null = null;

  if (spot) {
    const spaceBelow = vh - (spot.top + spot.height);
    const placeBelow = step.prefer === 'bottom'
      ? spaceBelow > 200
      : spaceBelow > 320;

    if (placeBelow) {
      tipTop = spot.top + spot.height + GAP;
      arrow = 'up';
    } else {
      tipTop = spot.top - GAP; // tooltip's bottom edge sits here (translateY -100%)
      arrow = 'down';
    }

    const cx = spot.left + spot.width / 2;
    tipLeft = Math.max(12, Math.min(vw - TOOLTIP_W - 12, cx - TOOLTIP_W / 2));
  }

  return (
    <div className="fx-tour" role="dialog" aria-modal="true" aria-label="Getting started tour">
      {/* Dimmed backdrop with a cut-out hole around the target.
          A click on the backdrop advances to the next step. */}
      {spot ? (
        <div
          className="fx-tour-spot"
          style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          onClick={() => (isLast ? finish() : setIdx(i => i + 1))}
        />
      ) : (
        <div className="fx-tour-dim" onClick={() => (isLast ? finish() : setIdx(i => i + 1))} />
      )}

      {/* Tooltip card */}
      <div
        className={`fx-tour-tip${arrow ? ` arrow-${arrow}` : ''}`}
        style={{
          top: tipTop,
          left: tipLeft,
          width: TOOLTIP_W,
          transform: arrow === 'down' ? 'translateY(-100%)' : undefined,
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
            <button type="button" className="fx-tour-btn fx-tour-btn-back" onClick={() => setIdx(i => i - 1)}>
              Back
            </button>
          ) : <span />}
          <button
            type="button"
            className="fx-tour-btn fx-tour-btn-next"
            onClick={() => (isLast ? finish() : setIdx(i => i + 1))}
          >
            {isLast ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
