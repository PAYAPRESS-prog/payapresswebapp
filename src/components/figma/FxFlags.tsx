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

export function FlagSAR(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-sa" {...props}>
      <rect width="30" height="30" fill="#006c35" />
      <line x1="5"  y1="20" x2="25" y2="20" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="23" y1="17" x2="25" y2="20" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5"  y1="17" x2="5"  y2="23" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5"  y1="11" x2="25" y2="11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7"  y1="14.5" x2="23" y2="14.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </ClippedCircle>
  );
}

export function FlagCAD(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-ca" {...props}>
      <rect width="30" height="30" fill="#ffffff" />
      <rect x="0"  y="0" width="8"  height="30" fill="#ff0000" />
      <rect x="22" y="0" width="8"  height="30" fill="#ff0000" />
      <polygon
        points="15,5 13,11 8,10 11,14 7,19 12,17 11.5,22 15,20.5 18.5,22 18,17 23,19 19,14 22,10 17,11"
        fill="#ff0000"
      />
    </ClippedCircle>
  );
}

export function FlagAUD(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-au" {...props}>
      <rect width="30" height="30" fill="#00008b" />
      <rect x="0" y="5.5" width="14" height="3" fill="#ffffff" />
      <rect x="5.5" y="0" width="3" height="14" fill="#ffffff" />
      <rect x="0" y="6.5" width="14" height="1" fill="#cc0000" />
      <rect x="6.5" y="0" width="1" height="14" fill="#cc0000" />
      <circle cx="23" cy="8"  r="1.3" fill="#ffffff" />
      <circle cx="27" cy="15" r="1.3" fill="#ffffff" />
      <circle cx="22.5" cy="21" r="1.3" fill="#ffffff" />
      <circle cx="18" cy="19" r="1.3" fill="#ffffff" />
      <circle cx="16" cy="13" r="0.9" fill="#ffffff" />
    </ClippedCircle>
  );
}

export function FlagCHF(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-ch" {...props}>
      <rect width="30" height="30" fill="#ff0000" />
      <rect x="13" y="7"  width="4"  height="16" fill="#ffffff" />
      <rect x="7"  y="13" width="16" height="4"  fill="#ffffff" />
    </ClippedCircle>
  );
}

export function FlagJPY(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-jp" {...props}>
      <rect width="30" height="30" fill="#ffffff" />
      <circle cx="15" cy="15" r="7.5" fill="#bc002d" />
    </ClippedCircle>
  );
}

export function FlagINR(props: FlagProps) {
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30 * (Math.PI / 180);
    return {
      x1: 15 + Math.cos(angle) * 0.6,
      y1: 15 + Math.sin(angle) * 0.6,
      x2: 15 + Math.cos(angle) * 3.5,
      y2: 15 + Math.sin(angle) * 3.5,
    };
  });
  return (
    <ClippedCircle id="fx-flag-in" {...props}>
      <rect x="0" y="0"  width="30" height="10" fill="#ff9933" />
      <rect x="0" y="10" width="30" height="10" fill="#ffffff" />
      <rect x="0" y="20" width="30" height="10" fill="#138808" />
      <circle cx="15" cy="15" r="3.5" fill="none" stroke="#000080" strokeWidth="0.6" />
      <circle cx="15" cy="15" r="0.5" fill="#000080" />
      {spokes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#000080" strokeWidth="0.4" />
      ))}
    </ClippedCircle>
  );
}

export function FlagRUB(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-ru" {...props}>
      <rect x="0" y="0"  width="30" height="10" fill="#ffffff" />
      <rect x="0" y="10" width="30" height="10" fill="#0039a6" />
      <rect x="0" y="20" width="30" height="10" fill="#d52b1e" />
    </ClippedCircle>
  );
}

export function FlagKWD(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-kw" {...props}>
      <rect x="0" y="0"  width="30" height="10" fill="#007a3d" />
      <rect x="0" y="10" width="30" height="10" fill="#ffffff" />
      <rect x="0" y="20" width="30" height="10" fill="#ce1126" />
      <polygon points="0,0 10,10 10,20 0,30" fill="#000000" />
    </ClippedCircle>
  );
}

export function FlagQAR(props: FlagProps) {
  const pts: string[] = ['0,0'];
  for (let i = 0; i <= 9; i++) {
    pts.push(`${i % 2 === 0 ? 8 : 12},${((i / 9) * 30).toFixed(1)}`);
  }
  pts.push('0,30');
  return (
    <ClippedCircle id="fx-flag-qa" {...props}>
      <rect width="30" height="30" fill="#8d153a" />
      <polygon points={pts.join(' ')} fill="#ffffff" />
    </ClippedCircle>
  );
}

export function FlagSGD(props: FlagProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180);
    return { cx: 20 + Math.cos(angle) * 3.5, cy: 7.5 + Math.sin(angle) * 3.5 };
  });
  return (
    <ClippedCircle id="fx-flag-sg" {...props}>
      <rect x="0" y="0"  width="30" height="15" fill="#ef3340" />
      <rect x="0" y="15" width="30" height="15" fill="#ffffff" />
      <circle cx="7" cy="7.5" r="4.5" fill="#ffffff" />
      <circle cx="9" cy="7.5" r="3.6" fill="#ef3340" />
      {stars.map((s, i) => (
        <Star key={i} cx={s.cx} cy={s.cy} r={1.3} fill="#ffffff" />
      ))}
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
  SAR: FlagSAR,
  CAD: FlagCAD,
  AUD: FlagAUD,
  CHF: FlagCHF,
  JPY: FlagJPY,
  INR: FlagINR,
  RUB: FlagRUB,
  KWD: FlagKWD,
  QAR: FlagQAR,
  SGD: FlagSGD,
} as const;
