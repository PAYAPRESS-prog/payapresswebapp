// Solar Icons Set Vol.2 — Linear style.
// Uses the official @solar-icons/react-perf package, same source as the
// Figma design system at https://www.figma.com/design/Aw6w7uGDCmaYZ4tUdLIoPP
// This guarantees pixel-exact match with the Figma file.

import {
  Bell,
  HamburgerMenu,
  RulerAngular,
  Ruler,
  Dollar,
  GraphUp,
  Calculator,
  Layers,
  History,
  Letter,
  Eye,
  EyeClosed,
  MagicStick,
  AltArrowLeft,
  AltArrowRight,
  User,
  Bookmark,
  Share,
  RoundTransferHorizontal,
} from '@solar-icons/react-perf/Linear';
import type { ComponentProps } from 'react';

type IconProps = ComponentProps<typeof Bell>;

export function BellIcon(props: IconProps) {
  return <Bell {...props} />;
}

export function HamburgerIcon(props: IconProps) {
  return <HamburgerMenu {...props} />;
}

export function RulerAngularIcon(props: IconProps) {
  return <RulerAngular {...props} />;
}

export function RulerIcon(props: IconProps) {
  return <Ruler {...props} />;
}

export function DollarIcon(props: IconProps) {
  return <Dollar {...props} />;
}

export function ChartUpIcon(props: IconProps) {
  return <GraphUp {...props} />;
}

export function CalculatorIcon(props: IconProps) {
  return <Calculator {...props} />;
}

export function LayersIcon(props: IconProps) {
  return <Layers {...props} />;
}

export function HistoryIcon(props: IconProps) {
  return <History {...props} />;
}

export function LetterIcon(props: IconProps) {
  return <Letter {...props} />;
}

export function EyeIcon(props: IconProps) {
  return <Eye {...props} />;
}

export function EyeClosedIcon(props: IconProps) {
  return <EyeClosed {...props} />;
}

export function MagicStickIcon(props: IconProps) {
  return <MagicStick {...props} />;
}

export function ArrowLeftIcon(props: IconProps) {
  return <AltArrowLeft {...props} />;
}

export function ArrowRightIcon(props: IconProps) {
  return <AltArrowRight {...props} />;
}

export function UserIcon(props: IconProps) {
  return <User {...props} />;
}

export function BookmarkIcon(props: IconProps) {
  return <Bookmark {...props} />;
}

export function ShareIcon(props: IconProps) {
  return <Share {...props} />;
}

export function CompareIcon(props: IconProps) {
  return <RoundTransferHorizontal {...props} />;
}

/* ── PAYAPRESS Logo ────────────────────────────────────────── */

export function PayapressLogo({ height = 28 }: { height?: number }) {
  return (
    <div className="fx-logo-wrap" aria-label="Busbar Calculator">
      <span className="fx-logo-mark" style={{ width: height, height, fontSize: height * 0.42 }}>
        CH
      </span>
      <span className="fx-logo-text" style={{ fontSize: height * 0.64 }}>
        Busbar Calculator
      </span>
    </div>
  );
}

/* ── Busbar — 3 stacked bars with metallic gradient ─────────── */

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
  const c = isCu
    ? { hi: '#f4c79a', mid: '#c8854c', lo: '#7a3a1d', shadow: '#3a1a0c' }
    : { hi: '#eef0f2', mid: '#bcc3c9', lo: '#7c858d', shadow: '#3a3f44' };

  return (
    <svg viewBox="0 0 56 44" width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={`bb-top-${metal}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={c.hi} />
          <stop offset="55%"  stopColor={c.mid} />
          <stop offset="100%" stopColor={c.lo} />
        </linearGradient>
        <linearGradient id={`bb-side-${metal}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={c.mid} />
          <stop offset="100%" stopColor={c.shadow} />
        </linearGradient>
      </defs>
      <polygon points="8,16 40,8 52,12 20,20"  fill={`url(#bb-top-${metal})`} />
      <polygon points="40,8 52,12 52,18 40,14" fill={c.shadow} />
      <polygon points="20,20 52,12 52,18 20,26" fill={`url(#bb-side-${metal})`} />
      <polygon points="5,24 38,16 52,20 18,28" fill={`url(#bb-top-${metal})`} />
      <polygon points="38,16 52,20 52,26 38,22" fill={c.shadow} />
      <polygon points="18,28 52,20 52,26 18,34" fill={`url(#bb-side-${metal})`} />
      <polygon points="2,32 36,24 52,28 18,36" fill={`url(#bb-top-${metal})`} />
      <polygon points="36,24 52,28 52,34 36,30" fill={c.shadow} />
      <polygon points="18,36 52,28 52,34 18,42" fill={`url(#bb-side-${metal})`} />
    </svg>
  );
}
