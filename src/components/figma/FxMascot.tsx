'use client';

import { useState } from 'react';

/* "Mr Busbar" mascot — a twisted copper busbar with glasses.
   Prefers the real illustration at /mr-busbar.png (exported from the Figma
   "mr busbar 1" node); the inline SVG below is the automatic fallback when
   the export hasn't been added to public/ yet, so the layout never breaks. */

export function MrBusbarSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 262 450" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="mrb_face" x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0%"  stopColor="#f2a95c" />
          <stop offset="55%" stopColor="#e08a35" />
          <stop offset="100%" stopColor="#c96f22" />
        </linearGradient>
        <linearGradient id="mrb_side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#a85818" />
          <stop offset="100%" stopColor="#8f4a12" />
        </linearGradient>
        <linearGradient id="mrb_twist" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"  stopColor="#e8953a" />
          <stop offset="50%" stopColor="#c96f22" />
          <stop offset="100%" stopColor="#e8953a" />
        </linearGradient>
      </defs>

      {/* question mark */}
      <text x="148" y="34" fontSize="30" fontWeight="600" fill="#4a2f14"
            fontFamily="Georgia, serif" transform="rotate(12 148 34)">?</text>

      {/* thin arms */}
      <path d="M96 200 C70 260 64 320 84 372" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M166 200 C196 258 202 316 180 370" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* top flat panel */}
      <path d="M98 46 L162 40 L166 196 L96 200 Z" fill="url(#mrb_face)" />
      <path d="M162 40 L172 46 L176 192 L166 196 Z" fill="url(#mrb_side)" />

      {/* ribbon twist */}
      <path d="M96 200 C96 258 168 300 168 356 L140 358 C140 312 96 262 96 200 Z" fill="url(#mrb_twist)" />
      <path d="M166 196 C166 252 100 300 100 354 L124 356 C124 314 166 258 166 196 Z"
            fill="#b45f1a" opacity="0.85" />

      {/* bottom flat panel */}
      <path d="M100 354 L168 356 L164 440 L102 442 Z" fill="url(#mrb_face)" />
      <path d="M168 356 L176 362 L172 436 L164 440 Z" fill="url(#mrb_side)" />

      {/* face — glasses, eyes, brows, smile */}
      <circle cx="116" cy="106" r="14" stroke="#2e2013" strokeWidth="3" fill="rgba(255,255,255,0.14)" />
      <circle cx="150" cy="104" r="14" stroke="#2e2013" strokeWidth="3" fill="rgba(255,255,255,0.14)" />
      <path d="M130 105 L136 104" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" />
      <path d="M102 104 L96 102" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" />
      <path d="M164 102 L170 100" stroke="#2e2013" strokeWidth="3" strokeLinecap="round" />
      <circle cx="118" cy="108" r="3.4" fill="#2e2013" />
      <circle cx="151" cy="106" r="3.4" fill="#2e2013" />
      <path d="M106 86 Q116 80 126 84"  stroke="#2e2013" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M140 84 Q150 78 160 82"  stroke="#2e2013" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M120 140 Q132 148 146 138" stroke="#2e2013" strokeWidth="3.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function MrBusbarMascot({ className }: { className?: string }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className={className} aria-hidden="true">
      {imgOk ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/mr-busbar.png"
          alt=""
          width={256}
          height={731}
          onError={() => setImgOk(false)}
        />
      ) : (
        <MrBusbarSvg width="100%" height="100%" />
      )}
    </div>
  );
}
