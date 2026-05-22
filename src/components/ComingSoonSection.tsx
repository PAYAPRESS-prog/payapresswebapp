'use client';

import { useRef, useEffect, useState } from 'react';

const UPCOMING = [
  { icon: '📊', title: 'Live Metal Prices', desc: 'Real-time copper, aluminum, steel, and zinc from global exchanges.' },
  { icon: '📰', title: 'Industry News',      desc: 'Latest from the electrical panel fabrication industry.' },
  { icon: '⚙️', title: 'Equipment Costs',    desc: 'Cables, lugs, enclosures, and other panel component pricing.' },
] as const;

export function ComingSoonSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="mt-16 mb-12">
      <div className="copper-divider mb-8">Coming Soon</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {UPCOMING.map((u, i) => (
          <div
            key={u.title}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
              transition: `opacity 0.5s ease ${i * 0.09}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.09}s`,
            }}
          >
            <a
              href="https://www.payapress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="soon-card block h-full"
            >
              <div className="text-2xl mb-3">{u.icon}</div>
              <h3 className="font-semibold text-sm text-zinc-200 mb-1.5">{u.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{u.desc}</p>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
