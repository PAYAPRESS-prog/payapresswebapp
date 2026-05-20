'use client';

import { useMemo } from 'react';

interface Props { width: number; thickness: number }

export function BusbarRender({ width, thickness }: Props) {
  const g = useMemo(() => {
    const VW = 340, VH = 180;

    // scale: normalize width 15–160 mm → 90–240 px, thickness exaggerated for visibility
    const W  = Math.min(235, Math.max(88, width * 1.75));
    const H  = Math.max(11,  Math.min(48, thickness * 3.8));
    const DX = 70;   // perspective offset X
    const DY = 44;   // perspective offset Y

    // center in viewport
    const x0 = (VW - W - DX) / 2 + 8;
    const y0 = Math.round(VH * 0.62);

    // Front-face corners (ABCD, clockwise from bottom-left)
    const A = { x: x0,      y: y0 };
    const B = { x: x0 + W,  y: y0 };
    const C = { x: x0 + W,  y: y0 - H };
    const D = { x: x0,      y: y0 - H };

    // Back corners (shift by +DX, -DY)
    const E  = { x: x0 + DX,      y: y0 - DY };      // back bottom-left  (hidden)
    const F  = { x: x0 + W + DX,  y: y0 - DY };      // back bottom-right
    const G  = { x: x0 + W + DX,  y: y0 - H - DY };  // back top-right
    const H2 = { x: x0 + DX,      y: y0 - H - DY };  // back top-left

    void E; // not drawn directly

    const shadowCX = (x0 + x0 + W + DX) / 2 + 4;
    const shadowRX = (W + DX) / 2 + 18;

    return { VW, VH, W, H, A, B, C, D, F, G, H2, shadowCX, shadowY: y0 + 12, shadowRX };
  }, [width, thickness]);

  const pts = (arr: Array<{ x: number; y: number }>) =>
    arr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const { VW, VH, H, A, B, C, D, F, G, H2, shadowCX, shadowY, shadowRX } = g;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full"
      style={{ height: VH, display: 'block' }}
      aria-label={`${width}×${thickness} mm copper busbar`}
    >
      <defs>
        {/* ── Top face: bright copper, light from top-right ── */}
        <linearGradient id="brTop" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#8a4a16" />
          <stop offset="22%"  stopColor="#c47228" />
          <stop offset="50%"  stopColor="#e49838" />
          <stop offset="75%"  stopColor="#f0bc58" />
          <stop offset="100%" stopColor="#f8d472" />
        </linearGradient>

        {/* ── Front face: medium copper ── */}
        <linearGradient id="brFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#c07830" />
          <stop offset="45%"  stopColor="#a06228" />
          <stop offset="100%" stopColor="#6a3c10" />
        </linearGradient>

        {/* ── Right side: darkest ── */}
        <linearGradient id="brSide" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#7a4418" />
          <stop offset="100%" stopColor="#3a1c06" />
        </linearGradient>

        {/* ── Specular highlight streak across top ── */}
        <linearGradient id="brSpec" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(255,245,210,0)" />
          <stop offset="33%"  stopColor="rgba(255,245,210,0)" />
          <stop offset="46%"  stopColor="rgba(255,245,210,0.52)" />
          <stop offset="54%"  stopColor="rgba(255,245,210,0.18)" />
          <stop offset="68%"  stopColor="rgba(255,245,210,0)" />
          <stop offset="100%" stopColor="rgba(255,245,210,0)" />
        </linearGradient>

        {/* ── Soft fill light from back-top ── */}
        <linearGradient id="brFill" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="rgba(230,160,60,0)" />
          <stop offset="100%" stopColor="rgba(255,215,110,0.18)" />
        </linearGradient>

        {/* ── AO at bottom of front face ── */}
        <linearGradient id="brAO" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.32)" />
        </linearGradient>

        {/* ── Ground shadow ── */}
        <radialGradient id="brShad" cx="50%" cy="25%" r="55%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* ── Surface noise (subtle scratch texture) ── */}
        <filter id="brNoise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.2" numOctaves="2" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx={shadowCX} cy={shadowY} rx={shadowRX} ry={9}
               fill="url(#brShad)" />

      {/* Right side face: B → F → G → C */}
      <polygon points={pts([B, F, G, C])} fill="url(#brSide)" />

      {/* Front face: A → B → C → D */}
      <polygon points={pts([A, B, C, D])} fill="url(#brFront)" />
      {/* AO overlay on front */}
      <polygon points={pts([A, B, C, D])} fill="url(#brAO)" />

      {/* Top face: D → C → G → H2 */}
      <polygon points={pts([D, C, G, H2])} fill="url(#brTop)" />
      {/* Texture on top */}
      <polygon points={pts([D, C, G, H2])} fill="url(#brTop)"
               filter="url(#brNoise)" opacity="0.08" />
      {/* Fill light on top */}
      <polygon points={pts([D, C, G, H2])} fill="url(#brFill)" />
      {/* Specular streak */}
      <polygon points={pts([D, C, G, H2])} fill="url(#brSpec)" />

      {/* ── Edge highlights ── */}
      {/* Top front edge (brightest) */}
      <line x1={D.x} y1={D.y} x2={C.x} y2={C.y}
            stroke="rgba(255,215,120,0.65)" strokeWidth="0.9" />
      {/* Top back edge */}
      <line x1={H2.x} y1={H2.y} x2={G.x} y2={G.y}
            stroke="rgba(255,200,90,0.25)" strokeWidth="0.6" />
      {/* Left top edge */}
      <line x1={D.x} y1={D.y} x2={H2.x} y2={H2.y}
            stroke="rgba(255,210,110,0.45)" strokeWidth="0.7" />
      {/* Right top edge */}
      <line x1={C.x} y1={C.y} x2={G.x} y2={G.y}
            stroke="rgba(200,140,50,0.3)" strokeWidth="0.5" />
      {/* Bottom front edge (dark AO) */}
      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke="rgba(0,0,0,0.35)" strokeWidth="0.6" />

      {/* ── Dimension: width ── */}
      <line x1={A.x} y1={A.y+9}  x2={B.x} y2={B.y+9}  stroke="rgba(170,110,35,0.5)" strokeWidth="0.7" />
      <line x1={A.x} y1={A.y+6}  x2={A.x} y2={A.y+12} stroke="rgba(170,110,35,0.5)" strokeWidth="0.7" />
      <line x1={B.x} y1={B.y+6}  x2={B.x} y2={B.y+12} stroke="rgba(170,110,35,0.5)" strokeWidth="0.7" />
      <text x={(A.x+B.x)/2} y={A.y+22} textAnchor="middle"
            fill="rgba(155,105,35,0.7)" fontSize="9" fontFamily="monospace">
        {width} mm
      </text>

      {/* ── Dimension: thickness (only if tall enough) ── */}
      {H >= 16 && (
        <>
          <line x1={B.x+7} y1={C.y}   x2={B.x+7} y2={B.y}   stroke="rgba(170,110,35,0.5)" strokeWidth="0.7" />
          <line x1={B.x+4} y1={C.y}   x2={B.x+10} y2={C.y}  stroke="rgba(170,110,35,0.5)" strokeWidth="0.7" />
          <line x1={B.x+4} y1={B.y}   x2={B.x+10} y2={B.y}  stroke="rgba(170,110,35,0.5)" strokeWidth="0.7" />
          <text x={B.x+18} y={(B.y+C.y)/2+3}
                fill="rgba(155,105,35,0.7)" fontSize="8" fontFamily="monospace">
            {thickness} mm
          </text>
        </>
      )}
    </svg>
  );
}
