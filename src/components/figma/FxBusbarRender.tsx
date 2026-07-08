'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

interface Props {
  /** Current width in mm */
  width: number;
  /** Current thickness in mm */
  thick: number;
  metal: 'copper' | 'aluminum';
  /** Called while dragging — (newWidth, newThickness) in mm */
  onResize: (w: number, t: number) => void;
}

// Drag bounds (mm) — sensible busbar range; matches calculator clamps
const W_MIN = 1,  W_MAX = 2000;
const T_MIN = 1,  T_MAX = 400;

/**
 * 3D isometric busbar render with live drag-to-resize.
 *
 * The bar redraws proportionally to width × thickness in real time — even
 * before pressing Calculate. Drag horizontally to change width, vertically
 * to change thickness (gamified, tactile feedback). Copper / aluminum
 * textures via SVG gradients + fractal-noise filter.
 */
export function FxBusbarRender({ width, thick, metal, onResize }: Props) {
  const isAl = metal === 'aluminum';
  const dragStart = useRef<{ x: number; y: number; w: number; t: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Stop native gestures/selection from stealing the drag (Windows
    // WebView2 touchscreens, Edge). Must come before anything that can
    // throw, or the drag never starts.
    e.preventDefault();
    // setPointerCapture keeps move events flowing outside the element;
    // some engines throw here (pointer already released / not supported) —
    // the drag still works while hovering, so never let it kill the handler.
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch { /* drag continues without capture */ }
    dragStart.current = { x: e.clientX, y: e.clientY, w: width, t: thick };
    setIsDragging(true);
  }, [width, thick]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newW = Math.max(W_MIN, Math.min(W_MAX, Math.round(dragStart.current.w + dx * 0.7)));
    const newT = Math.max(T_MIN, Math.min(T_MAX, Math.round(dragStart.current.t - dy * 0.12)));
    onResize(newW, newT);
  }, [onResize]);

  const onPointerUp = useCallback(() => {
    dragStart.current = null;
    setIsDragging(false);
  }, []);

  const g = useMemo(() => {
    const VW = 340, VH = 192;
    const MAX_W = 230, MAX_H = 80;
    const scale = Math.min(MAX_W / width, MAX_H / thick);
    const W  = Math.max(1, Math.round(width * scale));
    const H  = Math.max(8, Math.round(thick * scale));

    const DX = Math.max(14, Math.round(H * 0.55));
    const DY = Math.max(9,  Math.round(H * 0.34));

    const x0 = (VW - W - DX) / 2 + 8;
    const y0 = Math.round(VH * 0.73);

    const A  = { x: x0,          y: y0 };
    const B  = { x: x0 + W,      y: y0 };
    const C  = { x: x0 + W,      y: y0 - H };
    const D  = { x: x0,          y: y0 - H };
    const F  = { x: x0 + W + DX, y: y0 - DY };
    const G  = { x: x0 + W + DX, y: y0 - H - DY };
    const H2 = { x: x0 + DX,     y: y0 - H - DY };

    const shadowCX = (x0 + x0 + W + DX) / 2 + 4;
    const shadowRX = (W + DX) / 2 + 20;

    const glowCX = x0 + (W + DX) / 2;
    const glowCY = y0 - H / 2 - DY / 2;
    const glowRX = (W + DX) / 2 + 38;
    const glowRY = (H + DY) / 2 + 28;

    const wRefl = [
      { x: x0 + 0.36 * W + 0.05 * DX, y: y0 - H - 0.05 * DY },
      { x: x0 + 0.56 * W + 0.05 * DX, y: y0 - H - 0.05 * DY },
      { x: x0 + 0.56 * W + 0.88 * DX, y: y0 - H - 0.88 * DY },
      { x: x0 + 0.36 * W + 0.88 * DX, y: y0 - H - 0.88 * DY },
    ];

    return { VW, VH, W, H, A, B, C, D, F, G, H2, shadowCX, shadowY: y0 + 14, shadowRX, glowCX, glowCY, glowRX, glowRY, wRefl };
  }, [width, thick]);

  const pts = (arr: Array<{ x: number; y: number }>) =>
    arr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const { VW, VH, H, A, B, C, D, F, G, H2, shadowCX, shadowY, shadowRX, glowCX, glowCY, glowRX, glowRY, wRefl } = g;
  const area = width * thick;

  return (
    <div className="fx-busbar-card" data-tour="busbar">
      <div
        className={`fx-busbar-viewer${isDragging ? ' dragging' : ''}`}
        data-no-swipe
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="fx-busbar-svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label={`${width}×${thick} mm ${isAl ? 'aluminum' : 'copper'} busbar`}
        >
          <defs>
            <linearGradient id="brTop" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={isAl ? '#6a7e90' : '#8a4a16'} />
              <stop offset="20%"  stopColor={isAl ? '#96aec4' : '#c47228'} />
              <stop offset="48%"  stopColor={isAl ? '#b4ccde' : '#e8a030'} />
              <stop offset="72%"  stopColor={isAl ? '#ccd8e8' : '#f2c050'} />
              <stop offset="100%" stopColor={isAl ? '#dce8f4' : '#fad878'} />
            </linearGradient>
            <linearGradient id="brFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={isAl ? '#8898a8' : '#c87c34'} />
              <stop offset="40%"  stopColor={isAl ? '#6e7e8e' : '#a8682c'} />
              <stop offset="100%" stopColor={isAl ? '#3c4c5c' : '#6a3c10'} />
            </linearGradient>
            <linearGradient id="brSide" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={isAl ? '#526272' : '#7e4820'} />
              <stop offset="100%" stopColor={isAl ? '#2a3846' : '#3c1e08'} />
            </linearGradient>
            <linearGradient id="brSpec" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={isAl ? 'rgba(255,255,255,0)'    : 'rgba(255,245,210,0)'} />
              <stop offset="32%"  stopColor={isAl ? 'rgba(255,255,255,0)'    : 'rgba(255,245,210,0)'} />
              <stop offset="46%"  stopColor={isAl ? 'rgba(255,255,255,0.65)' : 'rgba(255,245,210,0.55)'} />
              <stop offset="54%"  stopColor={isAl ? 'rgba(255,255,255,0.22)' : 'rgba(255,245,210,0.20)'} />
              <stop offset="68%"  stopColor={isAl ? 'rgba(255,255,255,0)'    : 'rgba(255,245,210,0)'} />
              <stop offset="100%" stopColor={isAl ? 'rgba(255,255,255,0)'    : 'rgba(255,245,210,0)'} />
            </linearGradient>
            <linearGradient id="brFill" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%"   stopColor={isAl ? 'rgba(180,200,220,0)'    : 'rgba(230,160,60,0)'} />
              <stop offset="100%" stopColor={isAl ? 'rgba(200,220,238,0.18)' : 'rgba(255,215,110,0.20)'} />
            </linearGradient>
            <linearGradient id="brAO" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor={isAl ? 'rgba(0,0,0,0.40)' : 'rgba(0,0,0,0.34)'} />
            </linearGradient>
            <linearGradient id="brFrontHL" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={isAl ? 'rgba(200,220,240,0)'    : 'rgba(255,195,90,0)'} />
              <stop offset="42%"  stopColor={isAl ? 'rgba(200,220,240,0)'    : 'rgba(255,195,90,0)'} />
              <stop offset="50%"  stopColor={isAl ? 'rgba(200,220,240,0.14)' : 'rgba(255,195,90,0.13)'} />
              <stop offset="58%"  stopColor={isAl ? 'rgba(200,220,240,0)'    : 'rgba(255,195,90,0)'} />
              <stop offset="100%" stopColor={isAl ? 'rgba(200,220,240,0)'    : 'rgba(255,195,90,0)'} />
            </linearGradient>
            <radialGradient id="brShad" cx="50%" cy="25%" r="55%">
              <stop offset="0%"   stopColor="rgba(0,0,0,0.60)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <radialGradient id="brGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={isAl ? 'rgba(140,165,195,0.20)' : 'rgba(205,127,50,0.24)'} />
              <stop offset="55%"  stopColor={isAl ? 'rgba(140,165,195,0.06)' : 'rgba(205,127,50,0.07)'} />
              <stop offset="100%" stopColor={isAl ? 'rgba(140,165,195,0)'    : 'rgba(205,127,50,0)'} />
            </radialGradient>
            <linearGradient id="brWindow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={isAl ? 'rgba(255,255,255,0.35)' : 'rgba(255,248,225,0.30)'} />
              <stop offset="45%"  stopColor={isAl ? 'rgba(255,255,255,0.14)' : 'rgba(255,248,225,0.12)'} />
              <stop offset="100%" stopColor={isAl ? 'rgba(255,255,255,0)'    : 'rgba(255,248,225,0)'} />
            </linearGradient>
            <filter id="brNoise" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.2" numOctaves="2" result="noise" />
              <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
              <feBlend in="SourceGraphic" in2="gray" mode="overlay" result="blend" />
              <feComposite in="blend" in2="SourceGraphic" operator="in" />
            </filter>
          </defs>

          <ellipse cx={glowCX} cy={glowCY} rx={glowRX} ry={glowRY} fill="url(#brGlow)" />
          <ellipse cx={shadowCX} cy={shadowY} rx={shadowRX} ry={10} fill="url(#brShad)" />

          {/* Right side face */}
          <polygon points={pts([B, F, G, C])} fill="url(#brSide)" />
          {/* Front face */}
          <polygon points={pts([A, B, C, D])} fill="url(#brFront)" />
          <polygon points={pts([A, B, C, D])} fill="url(#brAO)" />
          <polygon points={pts([A, B, C, D])} fill="url(#brFrontHL)" />
          {/* Top face + copper texture */}
          <polygon points={pts([D, C, G, H2])} fill="url(#brTop)" />
          <polygon points={pts([D, C, G, H2])} fill="url(#brTop)" filter="url(#brNoise)" opacity="0.09" />
          <polygon points={pts([D, C, G, H2])} fill="url(#brFill)" />
          <polygon points={pts([D, C, G, H2])} fill="url(#brSpec)" />
          <polygon points={pts(wRefl)} fill="url(#brWindow)" opacity="0.75" />

          {/* Edge highlights */}
          <line x1={D.x} y1={D.y} x2={C.x} y2={C.y} stroke={isAl ? 'rgba(220,235,250,0.90)' : 'rgba(255,218,128,0.82)'} strokeWidth="1.0" />
          <line x1={H2.x} y1={H2.y} x2={G.x} y2={G.y} stroke={isAl ? 'rgba(190,210,230,0.32)' : 'rgba(255,205,90,0.30)'} strokeWidth="0.65" />
          <line x1={D.x} y1={D.y} x2={H2.x} y2={H2.y} stroke={isAl ? 'rgba(205,225,245,0.58)' : 'rgba(255,212,112,0.55)'} strokeWidth="0.85" />
          <line x1={C.x} y1={C.y} x2={G.x} y2={G.y} stroke={isAl ? 'rgba(120,150,180,0.42)' : 'rgba(205,145,55,0.38)'} strokeWidth="0.55" />
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(0,0,0,0.38)" strokeWidth="0.65" />
          <line x1={D.x} y1={D.y} x2={A.x} y2={A.y} stroke={isAl ? 'rgba(195,215,235,0.25)' : 'rgba(255,200,100,0.22)'} strokeWidth="0.6" />

          {/* Width dimension */}
          <line x1={A.x} y1={A.y + 9} x2={B.x} y2={B.y + 9} stroke={isAl ? 'rgba(80,108,138,0.52)' : 'rgba(170,110,35,0.52)'} strokeWidth="0.7" />
          <line x1={A.x} y1={A.y + 6} x2={A.x} y2={A.y + 12} stroke={isAl ? 'rgba(80,108,138,0.52)' : 'rgba(170,110,35,0.52)'} strokeWidth="0.7" />
          <line x1={B.x} y1={B.y + 6} x2={B.x} y2={B.y + 12} stroke={isAl ? 'rgba(80,108,138,0.52)' : 'rgba(170,110,35,0.52)'} strokeWidth="0.7" />
          <text x={(A.x + B.x) / 2} y={A.y + 22} textAnchor="middle" fill={isAl ? 'rgba(140,165,195,0.85)' : 'rgba(247,148,29,0.90)'} fontSize="9" fontFamily="monospace">
            {width} mm
          </text>

          {/* Thickness dimension */}
          {H >= 16 && (
            <>
              <line x1={B.x + 7} y1={C.y} x2={B.x + 7} y2={B.y} stroke={isAl ? 'rgba(80,108,138,0.52)' : 'rgba(170,110,35,0.52)'} strokeWidth="0.7" />
              <line x1={B.x + 4} y1={C.y} x2={B.x + 10} y2={C.y} stroke={isAl ? 'rgba(80,108,138,0.52)' : 'rgba(170,110,35,0.52)'} strokeWidth="0.7" />
              <line x1={B.x + 4} y1={B.y} x2={B.x + 10} y2={B.y} stroke={isAl ? 'rgba(80,108,138,0.52)' : 'rgba(170,110,35,0.52)'} strokeWidth="0.7" />
              <text x={B.x + 18} y={(B.y + C.y) / 2 + 3} fill={isAl ? 'rgba(140,165,195,0.85)' : 'rgba(247,148,29,0.90)'} fontSize="8" fontFamily="monospace">
                {thick} mm
              </text>
            </>
          )}
        </svg>

        {/* Dimension label row */}
        <div className="fx-busbar-label">
          <span className="fx-busbar-dims">{width} × {thick} mm</span>
          <span className="fx-busbar-sep">·</span>
          <span className="fx-busbar-area">{area.toLocaleString()} mm²</span>
        </div>

        {/* Drag hint */}
        <p className={`fx-busbar-hint${isDragging ? ' hidden' : ''}`}>
          <DragIcon /> drag to resize
        </p>
      </div>
    </div>
  );
}

function DragIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ verticalAlign: '-2px' }}>
      <path d="M5 9L2 12l3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
