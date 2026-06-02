// Inline SVG flags for the 4 currencies in the Figma redesign.
// Inlining removes a third-party network request (flagcdn.com), avoids
// a CSP exception, and means the icons render offline / before paint.

import type { SVGProps } from 'react';

type FlagProps = SVGProps<SVGSVGElement>;

function ClippedCircle({
  id,
  children,
  ...rest
}: { id: string; children: React.ReactNode } & FlagProps) {
  return (
    <svg viewBox="0 0 30 30" {...rest}>
      <defs>
        <clipPath id={id}>
          <circle cx="15" cy="15" r="15" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
      {/* outer ring for definition */}
      <circle cx="15" cy="15" r="14.5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
    </svg>
  );
}

// 5-pointed star — outline polygon, scalable via cx/cy/r/rotate
function Star({
  cx, cy, r, fill = '#ffde00', rotate = 0,
}: { cx: number; cy: number; r: number; fill?: string; rotate?: number }) {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.42;
    const angle = (i * 36 - 90 + rotate) * (Math.PI / 180);
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return <polygon points={points.join(' ')} fill={fill} />;
}

export function FlagUSA(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-us" {...props}>
      <rect width="30" height="30" fill="#fff" />
      {Array.from({ length: 13 }).map((_, i) => (
        <rect
          key={i}
          x="0"
          y={i * (30 / 13)}
          width="30"
          height={30 / 13}
          fill={i % 2 === 0 ? '#b22234' : '#fff'}
        />
      ))}
      <rect x="0" y="0" width="14" height={30 * 7 / 13} fill="#3c3b6e" />
      {/* 9 rows × alternating 6/5 stars — simplified to small white dots/stars */}
      {[1.5, 4, 6.5, 9, 11.5, 14].map((y, rowIdx) =>
        Array.from({ length: rowIdx % 2 === 0 ? 6 : 5 }).map((_, j) => (
          <Star
            key={`${rowIdx}-${j}`}
            cx={1.2 + j * 2.2 + (rowIdx % 2 === 0 ? 0 : 1.1)}
            cy={y}
            r={0.6}
            fill="#fff"
          />
        )),
      )}
    </ClippedCircle>
  );
}

export function FlagAED(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-ae" {...props}>
      <rect x="8" y="0"  width="22" height="10" fill="#00843d" />
      <rect x="8" y="10" width="22" height="10" fill="#ffffff" />
      <rect x="8" y="20" width="22" height="10" fill="#000000" />
      <rect x="0" y="0"  width="8"  height="30" fill="#ce1126" />
    </ClippedCircle>
  );
}

export function FlagCNY(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-cn" {...props}>
      <rect width="30" height="30" fill="#de2910" />
      {/* large star */}
      <Star cx={6} cy={6} r={3.2} />
      {/* 4 smaller stars arc — each rotated toward the big star */}
      <Star cx={11.5} cy={2.5} r={1.1} rotate={-22} />
      <Star cx={13.5} cy={5}   r={1.1} rotate={-3}  />
      <Star cx={13.5} cy={8.5} r={1.1} rotate={15}  />
      <Star cx={11.5} cy={11}  r={1.1} rotate={32}  />
    </ClippedCircle>
  );
}

export function FlagEUR(props: FlagProps) {
  // 12 yellow stars on blue — circle of 5-pointed stars
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    return {
      cx: 15 + Math.cos(angle) * 9,
      cy: 15 + Math.sin(angle) * 9,
    };
  });
  return (
    <ClippedCircle id="fx-flag-eu" {...props}>
      <rect width="30" height="30" fill="#003399" />
      {stars.map((s, i) => (
        <Star key={i} cx={s.cx} cy={s.cy} r={1.6} />
      ))}
    </ClippedCircle>
  );
}

export function FlagGBP(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-gb" {...props}>
      <rect width="30" height="30" fill="#ffffff" />
      <rect x="13" y="0" width="4" height="30" fill="#cf142b" />
      <rect x="0" y="13" width="30" height="4" fill="#cf142b" />
    </ClippedCircle>
  );
}

export function FlagTRY(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-tr" {...props}>
      <rect width="30" height="30" fill="#e30a17" />
      <circle cx="12.5" cy="15" r="6.5" fill="#ffffff" />
      <circle cx="14.8" cy="15" r="5.2" fill="#e30a17" />
      <Star cx={20.5} cy={11.5} r={2.2} fill="#ffffff" rotate={18} />
    </ClippedCircle>
  );
}

export function FlagIRR(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-ir" {...props}>
      <rect x="0" y="0"  width="30" height="10" fill="#239f40" />
      <rect x="0" y="10" width="30" height="10" fill="#ffffff" />
      <rect x="0" y="20" width="30" height="10" fill="#da0000" />
    </ClippedCircle>
  );
}

export const FLAGS = {
  USD: FlagUSA,
  AED: FlagAED,
  CNY: FlagCNY,
  EUR: FlagEUR,
  GBP: FlagGBP,
  TRY: FlagTRY,
  IRR: FlagIRR,
} as const;
