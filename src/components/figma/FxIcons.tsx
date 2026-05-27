// Solar Icons Set Vol.2 — Bold style (24×24 viewBox).
// Paths hand-matched to Solar's geometric style used in the Figma design.

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/* ── Header icons ──────────────────────────────────────────── */

export function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2a7 7 0 0 0-7 7c0 3.15-.8 5.25-1.56 6.5A1 1 0 0 0 4.3 17H19.7a1 1 0 0 0 .86-1.5C19.8 14.25 19 12.15 19 9a7 7 0 0 0-7-7Z"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M12 2a7 7 0 0 0-7 7c0 3.15-.8 5.25-1.56 6.5A1 1 0 0 0 4.3 17H19.7a1 1 0 0 0 .86-1.5C19.8 14.25 19 12.15 19 9a7 7 0 0 0-7-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 17c0 1.657 1.343 3 3 3s3-1.343 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HamburgerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75 6.75A.75.75 0 0 1 4.5 6h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75ZM3.75 12A.75.75 0 0 1 4.5 11.25h15a.75.75 0 0 1 0 1.5h-15A.75.75 0 0 1 3.75 12ZM4.5 16.5a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"
      />
    </svg>
  );
}

/* ── Calculator section icons ──────────────────────────────── */

export function RulerAngularIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.25 8A4.75 4.75 0 0 1 8 3.25h8A4.75 4.75 0 0 1 20.75 8v8A4.75 4.75 0 0 1 16 20.75H8A4.75 4.75 0 0 1 3.25 16V8Zm4 .75a.75.75 0 0 0 0 1.5h1.5v1.5H7.25a.75.75 0 0 0 0 1.5H9v1.5H7.25a.75.75 0 0 0 0 1.5H10.5a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75H7.25Z"
        opacity="0.5"
      />
      <path d="M8 3.25A4.75 4.75 0 0 0 3.25 8v8A4.75 4.75 0 0 0 8 20.75h8A4.75 4.75 0 0 0 20.75 16V8A4.75 4.75 0 0 0 16 3.25H8ZM7.25 8.75a.75.75 0 0 1 .75-.75h3.25a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H7.25a.75.75 0 0 1 0-1.5H9v-1.5H7.25a.75.75 0 0 1 0-1.5H9v-1.5H7.25a.75.75 0 0 1-.75-.75 .75.75 0 0 1 .75-.75H9V9.5H8a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Zm2.75 1a.75.75 0 0 0 0 1.5v1.5a.75.75 0 0 0 0 1.5.75.75 0 0 0 .75-.75v-3A.75.75 0 0 0 4.75 10Zm3.5 0a.75.75 0 0 0 0 1.5V10a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 10Zm3 0a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5A.75.75 0 0 0 11.25 10Zm3 0a.75.75 0 0 0 0 1.5V10a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 14.25 10Zm3 0a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5A.75.75 0 0 0 17.25 10Zm2.5.75a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z"
      />
    </svg>
  );
}

export function DollarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
        opacity="0.5"
      />
      <path d="M12 6a.75.75 0 0 1 .75.75v.585c1.38.274 2.5 1.22 2.5 2.54a.75.75 0 0 1-1.5 0c0-.496-.561-1.125-1.75-1.125-1.19 0-1.75.63-1.75 1.125 0 .387.155.637.598.87.487.257 1.145.434 1.97.651.773.206 1.534.46 2.11.838.627.407 1.072 1.01 1.072 1.891 0 1.32-1.12 2.266-2.5 2.54v.585a.75.75 0 0 1-1.5 0v-.585c-1.38-.274-2.5-1.22-2.5-2.54a.75.75 0 0 1 1.5 0c0 .496.561 1.125 1.75 1.125 1.19 0 1.75-.63 1.75-1.125 0-.387-.155-.637-.598-.87-.487-.257-1.145-.434-1.97-.651-.773-.206-1.534-.46-2.11-.838C9.445 11.284 9 10.68 9 9.8c0-1.32 1.12-2.266 2.5-2.54V6.75A.75.75 0 0 1 12 6Z" />
    </svg>
  );
}

export function ChartUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        d="M2 12.5a.75.75 0 0 1 .75-.75h3.69l2.72-4.53a.75.75 0 0 1 1.28-.02l2.81 4.21 1.97-2.96a.75.75 0 0 1 1.24-.02L18.06 11.5H21.25a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.62-.33l-1.38-2.07-2.03 3.04a.75.75 0 0 1-1.25.01L9.63 9.44 7.56 12.75a.75.75 0 0 1-.64.25H2.75A.75.75 0 0 1 2 12.5Z"
        opacity="0.5"
      />
      <path d="M15.47 5.47a.75.75 0 0 1 1.06 0l3 3a.75.75 0 1 1-1.06 1.06L16 7.06l-2.47 2.47a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 1.06-1.06l1.47 1.47L15.47 5.47Z" />
    </svg>
  );
}

/* ── Bottom nav icons ──────────────────────────────────────── */

export function CalculatorIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        d="M7 2a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5H7Z"
        opacity="0.4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.25 6A.75.75 0 0 1 9 5.25h6a.75.75 0 0 1 0 1.5H9A.75.75 0 0 1 8.25 6ZM8 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm4-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM8 14a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM8 18a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
      />
    </svg>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        d="M12 2.25 2.25 7.5 12 12.75l9.75-5.25L12 2.25Z"
        opacity="0.5"
      />
      <path d="M2.25 12 12 17.25 21.75 12M2.25 16.5 12 21.75l9.75-5.25" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.633 11.02a.75.75 0 0 1 1.014-.317L12 15.064l8.353-4.36a.75.75 0 0 1 .697 1.33l-8.75 4.571a.75.75 0 0 1-.697 0l-8.75-4.572a.75.75 0 0 1-.22-1.014Zm0 4.5a.75.75 0 0 1 1.014-.317L12 19.564l8.353-4.36a.75.75 0 0 1 .697 1.33l-8.75 4.571a.75.75 0 0 1-.697 0l-8.75-4.572a.75.75 0 0 1-.22-1.014ZM3.367 6.704a.75.75 0 0 1 1.016-.338L12 10.064l7.617-3.698a.75.75 0 0 1 .666 1.338L12 11.686 3.717 7.704a.75.75 0 0 1-.35-1Z"
        opacity="0.5"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.65 2.019a.75.75 0 0 1 .7 0l9.75 5.25a.75.75 0 0 1 0 1.33l-9.75 5.25a.75.75 0 0 1-.7 0L1.9 8.598a.75.75 0 0 1 0-1.33l9.75-5.25Z"
      />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
        opacity="0.4"
      />
      <path d="M12 7.25a.75.75 0 0 1 .75.75v3.69l2.47 2.47a.75.75 0 1 1-1.06 1.06l-2.75-2.75A.75.75 0 0 1 11.25 12V8a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}

/* ── Logo & Busbar ─────────────────────────────────────────── */

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
      <polygon points="6,18 38,8 50,12 18,22" fill={`url(#fx-bb-top-${metal})`} />
      <polygon points="38,8 50,12 50,18 38,14"  fill={dark} opacity="0.85" />
      <polygon points="18,22 50,12 50,18 18,28" fill={`url(#fx-bb-side-${metal})`} />
      <polygon points="2,28 34,18 50,22 18,32" fill={`url(#fx-bb-top-${metal})`} />
      <polygon points="34,18 50,22 50,30 34,26" fill={dark} opacity="0.9" />
      <polygon points="18,32 50,22 50,30 18,40" fill={`url(#fx-bb-side-${metal})`} />
    </svg>
  );
}
