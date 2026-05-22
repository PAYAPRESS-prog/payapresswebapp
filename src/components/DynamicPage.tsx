'use client';

import dynamic from 'next/dynamic';

/* Dynamic (client-only) wrappers for all Framer Motion-heavy components.
   ssr:false eliminates SSR/CSR hydration mismatches in React 19 strict mode. */

export const HeroSection = dynamic(
  () => import('./HeroSection').then(m => ({ default: m.HeroSection })),
  {
    ssr: false,
    loading: () => <div className="mb-10 sm:mb-12 lg:mb-16" style={{ minHeight: '180px' }} />,
  },
);

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

export const ComingSoonSection = dynamic(
  () => import('./ComingSoonSection').then(m => ({ default: m.ComingSoonSection })),
  { ssr: false },
);

export const Footer = dynamic(
  () => import('./Footer').then(m => ({ default: m.Footer })),
  { ssr: false },
);

export const InstallPrompt = dynamic(
  () => import('./InstallPrompt').then(m => ({ default: m.InstallPrompt })),
  { ssr: false },
);
