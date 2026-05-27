// Inline SVG flags for the 4 currencies in the Figma redesign.
// Inlining removes a third-party network request (flagcdn.com), avoids
// a CSP exception, and means the icons render offline / before paint.

import type { SVGProps } from 'react';

type FlagProps = SVGProps<SVGSVGElement>;

function ClippedCircle({ children, ...rest }: { children: React.ReactNode } & FlagProps) {
  return (
    <svg viewBox="0 0 30 30" {...rest}>
      <defs>
        <clipPath id={rest.id || 'fx-flag-clip'}>
          <circle cx="15" cy="15" r="15" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rest.id || 'fx-flag-clip'})`}>
        {children}
      </g>
    </svg>
  );
}

export function FlagUSA(props: FlagProps) {
  const stripes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return (
    <ClippedCircle id="fx-flag-us" {...props}>
      <rect width="30" height="30" fill="#fff" />
      {stripes.map(i => (
        <rect key={i} x="0" y={i * (30 / 13)} width="30" height={30 / 13}
              fill={i % 2 === 0 ? '#b22234' : '#fff'} />
      ))}
      <rect x="0" y="0" width="13" height={30 * 7 / 13} fill="#3c3b6e" />
      {/* simplified star pattern */}
      {[2.5, 5, 7.5, 10].map(y => (
        [1.5, 3.5, 5.5, 7.5, 9.5, 11.5].map((x, j) => (
          <circle key={`${x}-${y}-${j}`} cx={x} cy={y} r="0.45" fill="#fff" />
        ))
      ))}
    </ClippedCircle>
  );
}

export function FlagAED(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-ae" {...props}>
      <rect x="7" y="0"  width="23" height="10" fill="#00732f" />
      <rect x="7" y="10" width="23" height="10" fill="#fff" />
      <rect x="7" y="20" width="23" height="10" fill="#000" />
      <rect x="0" y="0"  width="7"  height="30" fill="#ff0000" />
    </ClippedCircle>
  );
}

export function FlagCNY(props: FlagProps) {
  return (
    <ClippedCircle id="fx-flag-cn" {...props}>
      <rect width="30" height="30" fill="#de2910" />
      <g fill="#ffde00">
        <polygon points="6,4 6.8,6 9,6 7.2,7.5 8,9.5 6,8.2 4,9.5 4.8,7.5 3,6 5.2,6" />
        <polygon points="12,2 12.3,3 13.3,3 12.5,3.6 12.8,4.6 12,4 11.2,4.6 11.5,3.6 10.7,3 11.7,3" />
        <polygon points="14,5 14.3,6 15.3,6 14.5,6.6 14.8,7.6 14,7 13.2,7.6 13.5,6.6 12.7,6 13.7,6" />
        <polygon points="14,8.5 14.3,9.5 15.3,9.5 14.5,10.1 14.8,11.1 14,10.5 13.2,11.1 13.5,10.1 12.7,9.5 13.7,9.5" />
        <polygon points="12,11 12.3,12 13.3,12 12.5,12.6 12.8,13.6 12,13 11.2,13.6 11.5,12.6 10.7,12 11.7,12" />
      </g>
    </ClippedCircle>
  );
}

export function FlagEUR(props: FlagProps) {
  // 12 yellow stars on blue — circle of stars
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    return {
      cx: 15 + Math.cos(angle) * 8,
      cy: 15 + Math.sin(angle) * 8,
    };
  });
  return (
    <ClippedCircle id="fx-flag-eu" {...props}>
      <rect width="30" height="30" fill="#003399" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r="1" fill="#ffcc00" />
      ))}
    </ClippedCircle>
  );
}

export const FLAGS = {
  USD: FlagUSA,
  AED: FlagAED,
  CNY: FlagCNY,
  EUR: FlagEUR,
} as const;
