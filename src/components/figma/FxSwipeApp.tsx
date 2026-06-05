'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FxHeader } from './FxHeader';
import { FxBottomNav } from './FxBottomNav';
import { FxCalculator } from './FxCalculator';
import { FxHistoryPage } from './FxHistoryPage';
import { FxProfilePage } from './FxProfilePage';
import type { InitialPriceData } from '@/types/calculator';

type Tab = 'history' | 'calculator' | 'profile';
const TABS: Tab[] = ['history', 'calculator', 'profile'];
const SNAP_PX = 60; // minimum drag distance to trigger snap

interface Props {
  initialData: InitialPriceData;
  copperPrice: number | null;
  aluminumPrice: number | null;
}

export function FxSwipeApp({ initialData, copperPrice, aluminumPrice }: Props) {
  const [activeIdx, setActiveIdx] = useState(1); // start at Calculator
  const activeIdxRef = useRef(1);
  const trackRef     = useRef<HTMLDivElement>(null);
  const viewportRef  = useRef<HTMLDivElement>(null);

  // Keep ref in sync so touch handlers (which close over stale values) always read current
  useEffect(() => { activeIdxRef.current = activeIdx; }, [activeIdx]);

  const goTo = useCallback((idx: number, animated = true) => {
    const next = Math.max(0, Math.min(2, idx));
    if (trackRef.current) {
      trackRef.current.style.transition = animated
        ? 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)'
        : 'none';
      trackRef.current.style.transform = `translateX(${-next * (100 / 3)}%)`;
    }
    setActiveIdx(next);
    activeIdxRef.current = next;
  }, []);

  // Set initial position without animation on mount
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform  = `translateX(${-1 * (100 / 3)}%)`;
    }
  }, []);

  // Non-passive touch handler so we can call e.preventDefault() on horizontal swipes
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    let startX = 0;
    let startY = 0;
    let dir: 'h' | 'v' | null = null;
    let liveOffset = 0;

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dir = null;
      liveOffset = 0;
      if (trackRef.current) trackRef.current.style.transition = 'none';
    };

    const onMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      // Determine direction on first significant movement
      if (dir === null) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }
      if (dir !== 'h') return;

      // Prevent page scroll while swiping horizontally
      e.preventDefault();
      liveOffset = dx;

      const cur  = activeIdxRef.current;
      const base = -(cur * (100 / 3));
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(calc(${base}% + ${dx}px))`;
      }
    };

    const onEnd = () => {
      if (dir !== 'h') return;
      const cur  = activeIdxRef.current;
      const next = liveOffset < -SNAP_PX && cur < 2 ? cur + 1
                 : liveOffset >  SNAP_PX && cur > 0 ? cur - 1
                 : cur;
      goTo(next);
    };

    vp.addEventListener('touchstart',  onStart,  { passive: true  });
    vp.addEventListener('touchmove',   onMove,   { passive: false });
    vp.addEventListener('touchend',    onEnd,    { passive: true  });
    vp.addEventListener('touchcancel', onEnd,    { passive: true  });

    return () => {
      vp.removeEventListener('touchstart',  onStart);
      vp.removeEventListener('touchmove',   onMove);
      vp.removeEventListener('touchend',    onEnd);
      vp.removeEventListener('touchcancel', onEnd);
    };
  }, [goTo]);

  return (
    <div className="fx-swipe-root">
      <FxHeader />

      <div className="fx-swipe-viewport" ref={viewportRef}>
        <div className="fx-swipe-track" ref={trackRef}>

          {/* Panel 0 — History */}
          <div className="fx-swipe-panel">
            <FxHistoryPage
              embedded
              copperPrice={copperPrice}
              aluminumPrice={aluminumPrice}
            />
          </div>

          {/* Panel 1 — Calculator */}
          <div className="fx-swipe-panel">
            <FxCalculator initialData={initialData} />
          </div>

          {/* Panel 2 — Profile */}
          <div className="fx-swipe-panel">
            <FxProfilePage embedded />
          </div>

        </div>
      </div>

      <FxBottomNav active={TABS[activeIdx]} onTabChange={goTo} />
    </div>
  );
}
