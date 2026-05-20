'use client';

import { useEffect, useState } from 'react';
import type { CopperPriceData } from '@/types/calculator';

export function Header() {
  const [price, setPrice] = useState<CopperPriceData | null>(null);

  useEffect(() => {
    fetch('/api/copper-price')
      .then(r => r.json())
      .then((d: CopperPriceData) => setPrice(d))
      .catch(() => null);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-surface-3)] bg-[var(--color-surface-0)]/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight text-copper-gradient">
            PAYAPRESS
          </span>
          <span className="text-xs font-medium text-[var(--color-surface-4)] border border-[var(--color-surface-4)] rounded px-1.5 py-0.5">
            PRO
          </span>
        </div>

        {/* Live copper ticker */}
        <div className="flex items-center gap-2 text-sm">
          {price ? (
            <>
              <span className={price.isFallback ? 'fallback-dot' : 'live-dot'} />
              <span className="text-zinc-400 hidden sm:inline">Cu / kg</span>
              <span className="font-mono font-semibold text-copper-400">
                ${price.pricePerKg.toFixed(3)}
              </span>
              <span className="text-zinc-600 text-xs hidden md:inline">
                {price.isFallback ? 'est.' : 'COMEX'}
              </span>
            </>
          ) : (
            <span className="text-zinc-600 text-xs animate-pulse">Fetching price…</span>
          )}
        </div>
      </div>
    </header>
  );
}
