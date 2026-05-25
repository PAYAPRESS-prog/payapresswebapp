'use client';

import dynamic from 'next/dynamic';
import type { InitialPriceData } from '@/types/calculator';

/* CopperCalculator uses Framer Motion AnimatePresence and browser APIs
   (localStorage, navigator.language, pointer events) — stays client-only.
   initialData is fetched server-side in page.tsx and passed here so the
   component mounts with real prices instead of showing a "Fetching…" state. */
export const CopperCalculator = dynamic<{ initialData?: InitialPriceData }>(
  () => import('./CopperCalculator').then(m => ({ default: m.CopperCalculator })),
  {
    ssr: false,
    loading: () => (
      <div
        className="card-copper rounded-[1.25rem] animate-pulse"
        style={{ minHeight: '520px', background: '#131318', borderRadius: '1.25rem' }}
      />
    ),
  },
);
