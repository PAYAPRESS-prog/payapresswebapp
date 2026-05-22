'use client';

import dynamic from 'next/dynamic';

/* CopperCalculator uses heavy Framer Motion (TiltCard, useSpring, AnimatePresence)
   that causes React 19 hydration mismatches — must stay client-only. */
export const CopperCalculator = dynamic(
  () => import('./CopperCalculator').then(m => ({ default: m.CopperCalculator })),
  {
    ssr: false,
    loading: () => (
      <div
        className="card-copper rounded-[1.25rem] animate-pulse"
        style={{ minHeight: '520px' }}
      />
    ),
  },
);
