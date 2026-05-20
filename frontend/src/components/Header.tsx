'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -44, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28, delay: 0.05 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[var(--color-surface-3)] bg-[var(--color-surface-0)]/92 backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.55)]'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto
                      px-4 sm:px-6 lg:px-8
                      h-12 sm:h-14
                      flex items-center justify-between">

        <motion.a
          href="/"
          className="flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-base sm:text-lg font-black tracking-tight text-shimmer">PAYAPRESS</span>
          <span className="text-[0.55rem] sm:text-[0.6rem] font-bold text-zinc-600
                           border border-[var(--color-surface-4)] rounded px-1.5 py-0.5 tracking-widest">
            PRO
          </span>
        </motion.a>

        <span className="hidden md:block text-[0.65rem] text-zinc-700 font-mono tracking-wide select-none">
          Copper Busbar Cost Calculator
        </span>
      </div>
    </motion.header>
  );
}
