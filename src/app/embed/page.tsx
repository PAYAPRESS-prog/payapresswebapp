'use client';

import dynamic from 'next/dynamic';

const CopperCalculatorDynamic = dynamic(
  () => import('@/components/CopperCalculator').then(m => ({ default: m.CopperCalculator })),
  { ssr: false, loading: () => <div style={{ minHeight: '520px' }} /> },
);

export default function EmbedPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] p-4">
      <CopperCalculatorDynamic />
      <p className="text-center text-zinc-700 text-[0.65rem] mt-3">
        Powered by{' '}
        <a href="https://payapress.com" className="hover:text-copper-600 transition-colors">
          PAYAPRESS
        </a>
      </p>
    </div>
  );
}
