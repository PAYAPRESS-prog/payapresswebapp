'use client';

import { useEffect, useState } from 'react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 pt-safe transition-all duration-300
                  animate-[header-slide-in_0.45s_cubic-bezier(0.22,1,0.36,1)_both] ${
        scrolled
          ? 'border-b border-[var(--color-surface-3)] bg-[var(--color-surface-0)]/92 backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.55)]'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="page-container h-14 flex items-center justify-between">

        <a
          href="/"
          className="flex items-center gap-2
                     transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97]"
        >
          <span className="text-base sm:text-lg font-black tracking-tight text-shimmer">Busbar Calculator</span>
          <span className="text-[0.55rem] sm:text-[0.6rem] font-bold text-zinc-600
                           border border-[var(--color-surface-4)] rounded px-1.5 py-0.5 tracking-widest">
            PRO
          </span>
        </a>

        <span className="hidden md:block text-[0.65rem] text-zinc-700 font-mono tracking-wide select-none">
          Busbar Calculator
        </span>
      </div>
    </header>
  );
}
