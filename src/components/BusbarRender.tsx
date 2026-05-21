'use client';

import { useMemo } from 'react';

interface Props { width: number; thickness: number }

export function BusbarRender({ width, thickness }: Props) {
  const g = useMemo(() => {
    const VW = 340, VH = 192;

    // Scale W and H proportionally so pixel W:H = real width:thickness
    const MAX_W = 230, MAX_H = 80;
    const scale = Math.min(MAX_W / width, MAX_H / thickness);
    const W  = Math.max(1, Math.round(width     * scale));
    const H  = Math.max(8, Math.round(thickness * scale));

    // Depth proportional to H so visual aspect ratio stays close to real ratio.
    // Fixed large depth made thin busbars (e.g. 60×8) look 3× too thick.
    const DX = Math.max(14, Math.round(H * 0.55));
    const DY = Math.max(9,  Math.round(H * 0.34));

    const x0 = (VW - W - DX) / 2 + 8;
    const y0 = Math.round(VH * 0.73);

    const A = { x: x0,          y: y0 };
    const B = { x: x0 + W,      y: y0 };
    const C = { x: x0 + W,      y: y0 - H };
    const D = { x: x0,          y: y0 - H };
    const E = { x: x0 + DX,     y: y0 - DY };
    const F = { x: x0 + W + DX, y: y0 - DY };
    const G = { x: x0 + W + DX, y: y0 - H - DY };
    const H2= { x: x0 + DX,     y: y0 - H - DY };

    void E;

    const shadowCX = (x0 + x0 + W + DX) / 2 + 4;
    const shadowRX = (W + DX) / 2 + 20;

    // Ambient glow centered on the full busbar shape
    const glowCX = x0 + (W + DX) / 2;
    const glowCY = y0 - H / 2 - DY / 2;
    const glowRX = (W + DX) / 2 + 38;
    const glowRY = (H + DY) / 2 + 28;

    // Window-light reflection strip on top face
    // Top face parameterised as D + s*(C-D) + t*(H2-D)
    const wRefl = [
      { x: x0 + 0.36*W + 0.05*DX, y: y0 - H - 0.05*DY },
      { x: x0 + 0.56*W + 0.05*DX, y: y0 - H - 0.05*DY },
      { x: x0 + 0.56*W + 0.88*DX, y: y0 - H - 0.88*DY },
      { x: x0 + 0.36*W + 0.88*DX, y: y0 - H - 0.88*DY },
    ];

    return { VW, VH, W, H, A, B, C, D, F, G, H2, shadowCX, shadowY: y0 + 14, shadowRX, glowCX, glowCY, glowRX, glowRY, wRefl };
  }, [width, thickness]);

  const pts = (arr: Array<{ x: number; y: number }>) =>
    arr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const { VW, VH, H, A, B, C, D, F, G, H2, shadowCX, shadowY, shadowRX, glowCX, glowCY, glowRX, glowRY, wRefl } = g;

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
          <stop offset="20%"  stopColor="#c47228" />
          <stop offset="48%"  stopColor="#e8a030" />
          <stop offset="72%"  stopColor="#f2c050" />
          <stop offset="100%" stopColor="#fad878" />
        </linearGradient>

        {/* ── Front face: medium copper ── */}
        <linearGradient id="brFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#c87c34" />
          <stop offset="40%"  stopColor="#a8682c" />
          <stop offset="100%" stopColor="#6a3c10" />
        </linearGradient>

        {/* ── Right side: darkest ── */}
        <linearGradient id="brSide" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#7e4820" />
          <stop offset="100%" stopColor="#3c1e08" />
        </linearGradient>

        {/* ── Specular streak across top ── */}
        <linearGradient id="brSpec" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(255,245,210,0)" />
          <stop offset="32%"  stopColor="rgba(255,245,210,0)" />
          <stop offset="46%"  stopColor="rgba(255,245,210,0.55)" />
          <stop offset="54%"  stopColor="rgba(255,245,210,0.20)" />
          <stop offset="68%"  stopColor="rgba(255,245,210,0)" />
          <stop offset="100%" stopColor="rgba(255,245,210,0)" />
        </linearGradient>

        {/* ── Fill light from back-top ── */}
        <linearGradient id="brFill" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="rgba(230,160,60,0)" />
          <stop offset="100%" stopColor="rgba(255,215,110,0.20)" />
        </linearGradient>

        {/* ── AO at bottom of front face ── */}
        <linearGradient id="brAO" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.34)" />
        </linearGradient>

        {/* ── Front face center vertical highlight ── */}
        <linearGradient id="brFrontHL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(255,195,90,0)" />
          <stop offset="42%"  stopColor="rgba(255,195,90,0)" />
          <stop offset="50%"  stopColor="rgba(255,195,90,0.13)" />
          <stop offset="58%"  stopColor="rgba(255,195,90,0)" />
          <stop offset="100%" stopColor="rgba(255,195,90,0)" />
        </linearGradient>

        {/* ── Ground shadow ── */}
        <radialGradient id="brShad" cx="50%" cy="25%" r="55%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.60)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* ── Ambient copper environment glow ── */}
        <radialGradient id="brGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(205,127,50,0.24)" />
          <stop offset="55%"  stopColor="rgba(205,127,50,0.07)" />
          <stop offset="100%" stopColor="rgba(205,127,50,0)" />
        </radialGradient>

        {/* ── Window/studio light reflection on top ── */}
        <linearGradient id="brWindow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,248,225,0.30)" />
          <stop offset="45%"  stopColor="rgba(255,248,225,0.12)" />
          <stop offset="100%" stopColor="rgba(255,248,225,0)" />
        </linearGradient>

        {/* ── Surface noise texture ── */}
        <filter id="brNoise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.2" numOctaves="2" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* Ambient copper glow behind the busbar */}
      <ellipse cx={glowCX} cy={glowCY} rx={glowRX} ry={glowRY}
               fill="url(#brGlow)" />

      {/* Ground shadow */}
      <ellipse cx={shadowCX} cy={shadowY} rx={shadowRX} ry={10}
               fill="url(#brShad)" />

      {/* Right side face: B → F → G → C */}
      <polygon points={pts([B, F, G, C])} fill="url(#brSide)" />

      {/* Front face: A → B → C → D */}
      <polygon points={pts([A, B, C, D])} fill="url(#brFront)" />
      <polygon points={pts([A, B, C, D])} fill="url(#brAO)" />
      <polygon points={pts([A, B, C, D])} fill="url(#brFrontHL)" />

      {/* Top face: D → C → G → H2 */}
      <polygon points={pts([D, C, G, H2])} fill="url(#brTop)" />
      <polygon points={pts([D, C, G, H2])} fill="url(#brTop)" filter="url(#brNoise)" opacity="0.09" />
      <polygon points={pts([D, C, G, H2])} fill="url(#brFill)" />
      <polygon points={pts([D, C, G, H2])} fill="url(#brSpec)" />
      {/* Studio window reflection strip */}
      <polygon points={pts(wRefl)} fill="url(#brWindow)" opacity="0.75" />

      {/* ── Edge highlights ── */}
      <line x1={D.x} y1={D.y} x2={C.x} y2={C.y}
            stroke="rgba(255,218,128,0.82)" strokeWidth="1.0" />
      <line x1={H2.x} y1={H2.y} x2={G.x} y2={G.y}
            stroke="rgba(255,205,90,0.30)" strokeWidth="0.65" />
      <line x1={D.x} y1={D.y} x2={H2.x} y2={H2.y}
            stroke="rgba(255,212,112,0.55)" strokeWidth="0.85" />
      <line x1={C.x} y1={C.y} x2={G.x} y2={G.y}
            stroke="rgba(205,145,55,0.38)" strokeWidth="0.55" />
      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke="rgba(0,0,0,0.38)" strokeWidth="0.65" />
      <line x1={D.x} y1={D.y} x2={A.x} y2={A.y}
            stroke="rgba(255,200,100,0.22)" strokeWidth="0.6" />

      {/* ── Dimension: width ── */}
      <line x1={A.x} y1={A.y+9}  x2={B.x} y2={B.y+9}  stroke="rgba(170,110,35,0.52)" strokeWidth="0.7" />
      <line x1={A.x} y1={A.y+6}  x2={A.x} y2={A.y+12} stroke="rgba(170,110,35,0.52)" strokeWidth="0.7" />
      <line x1={B.x} y1={B.y+6}  x2={B.x} y2={B.y+12} stroke="rgba(170,110,35,0.52)" strokeWidth="0.7" />
      <text x={(A.x+B.x)/2} y={A.y+22} textAnchor="middle"
            fill="rgba(155,105,35,0.72)" fontSize="9" fontFamily="monospace">
        {width} mm
      </text>

      {/* ── Dimension: thickness (only if tall enough) ── */}
      {H >= 16 && (
        <>
          <line x1={B.x+7} y1={C.y}    x2={B.x+7} y2={B.y}    stroke="rgba(170,110,35,0.52)" strokeWidth="0.7" />
          <line x1={B.x+4} y1={C.y}    x2={B.x+10} y2={C.y}   stroke="rgba(170,110,35,0.52)" strokeWidth="0.7" />
          <line x1={B.x+4} y1={B.y}    x2={B.x+10} y2={B.y}   stroke="rgba(170,110,35,0.52)" strokeWidth="0.7" />
          <text x={B.x+18} y={(B.y+C.y)/2+3}
                fill="rgba(155,105,35,0.72)" fontSize="8" fontFamily="monospace">
            {thickness} mm
          </text>
        </>
      )}
    </svg>
  );
}
