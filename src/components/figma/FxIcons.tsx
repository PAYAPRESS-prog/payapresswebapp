// SVG icon set used by the Figma redesign. Inline so we ship no font/icon dep.

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 4.5 1.5 6.5 2 7H4c.5-.5 2-2.5 2-7Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function HamburgerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" {...props}>
      <line x1="4"  y1="7"  x2="20" y2="7"  />
      <line x1="4"  y1="12" x2="20" y2="12" />
      <line x1="4"  y1="17" x2="20" y2="17" />
    </svg>
  );
}

export function RulerAngularIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 8h14a4 4 0 0 1 4 4v9H8a5 5 0 0 1-5-5V8Z" />
      <path d="M7  8 v4" />
      <path d="M11 8 v4" />
      <path d="M15 8 v4" />
      <path d="M17 14 h4" />
      <path d="M17 18 h4" />
    </svg>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="9" width="20" height="6" rx="1.5" />
      <path d="M6 9  v2" />
      <path d="M10 9 v3" />
      <path d="M14 9 v2" />
      <path d="M18 9 v3" />
    </svg>
  );
}

export function DollarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9c-.5-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.3 0 1.3 1.1 2.1 3 2.5 1.9.4 3 1.2 3 2.5 0 1.4-1.3 2.3-3 2.3-1.3 0-2.5-.5-3-1.5" />
      <path d="M12 6v2" />
      <path d="M12 16v2" />
    </svg>
  );
}

export function ChartUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
      <path d="M14 8h5v5" />
    </svg>
  );
}

export function CalculatorIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 11h.01" /><path d="M12 11h.01" /><path d="M16 11h.01" />
      <path d="M8 15h.01" /><path d="M12 15h.01" /><path d="M16 15h.01" />
      <path d="M8 19h.01" /><path d="M12 19h.01" /><path d="M16 19h.01" />
    </svg>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2l9 5-9 5-9-5 9-5Z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// PAYAPRESS combo logo (icon mark + wordmark). Stylized "CH" inside a copper square.
export function PayapressLogo({ height = 28 }: { height?: number }) {
  return (
    <div className="fx-logo-wrap" aria-label="PAYAPRESS">
      <span className="fx-logo-mark" style={{ width: height, height, fontSize: height * 0.42 }}>
        CH
      </span>
      <span className="fx-logo-text" style={{ fontSize: height * 0.64 }}>
        PAYAPRESS
      </span>
    </div>
  );
}

// Stylized 3-D busbar block (pure SVG — no external image).
export function BusbarMock({
  width = 56,
  height = 44,
  metal = 'copper',
}: {
  width?: number;
  height?: number;
  metal?: 'copper' | 'aluminum';
}) {
  const isCu = metal === 'copper';
  const top   = isCu ? '#e8a878' : '#dde2e6';
  const mid   = isCu ? '#c47a47' : '#b6bdc4';
  const dark  = isCu ? '#7a3a1d' : '#7c858d';
  return (
    <svg viewBox="0 0 56 44" width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={`fx-bb-top-${metal}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={mid} />
        </linearGradient>
        <linearGradient id={`fx-bb-side-${metal}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      {/* back bar */}
      <polygon points="6,18 38,8 50,12 18,22" fill={`url(#fx-bb-top-${metal})`} />
      <polygon points="38,8 50,12 50,18 38,14"  fill={dark} opacity="0.85" />
      <polygon points="18,22 50,12 50,18 18,28" fill={`url(#fx-bb-side-${metal})`} />
      {/* front bar */}
      <polygon points="2,28 34,18 50,22 18,32" fill={`url(#fx-bb-top-${metal})`} />
      <polygon points="34,18 50,22 50,30 34,26" fill={dark} opacity="0.9" />
      <polygon points="18,32 50,22 50,30 18,40" fill={`url(#fx-bb-side-${metal})`} />
    </svg>
  );
}
