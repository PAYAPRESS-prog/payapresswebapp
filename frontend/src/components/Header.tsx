'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { CopperPriceData } from '@/types/calculator';

export function Header() {
  const [price, setPrice]     = useState<CopperPriceData | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/copper-price').then(r => r.json()).then(setPrice).catch(() => null);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28, delay: 0.1 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[var(--color-surface-3)] bg-[var(--color-surface-0)]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
        >
          <span className="text-lg font-black tracking-tight text-shimmer">PAYAPRESS</span>
          <span className="text-[0.6rem] font-bold text-zinc-600 border border-[var(--color-surface-4)] rounded px-1.5 py-0.5 tracking-widest">
            PRO
          </span>
        </motion.div>

        {/* Live ticker */}
        <div className="flex items-center gap-2 text-sm">
          {price ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className={price.isFallback ? 'fallback-dot' : 'live-dot'} />
              <span className="text-zinc-500 hidden sm:inline text-xs">Cu / kg</span>
              <span className="font-mono font-semibold text-copper-400">
                ${price.pricePerKg.toFixed(3)}
              </span>
              <span className="text-zinc-700 text-[0.65rem] hidden md:inline">
                {price.isFallback ? 'est.' : 'COMEX'}
              </span>
            </motion.div>
          ) : (
            <span className="text-zinc-700 text-xs animate-pulse">—</span>
          )}
        </div>
      </div>
    </motion.header>
  );
}
