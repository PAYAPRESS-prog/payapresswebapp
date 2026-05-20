'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const UPCOMING = [
  { icon: '📊', title: 'Live Metal Prices',   desc: 'Real-time copper, aluminum, steel, and zinc from global exchanges.' },
  { icon: '📰', title: 'Industry News',        desc: 'Latest from the electrical panel fabrication industry.' },
  { icon: '⚙️', title: 'Equipment Costs',      desc: 'Cables, lugs, enclosures, and other panel component pricing.' },
  { icon: '💱', title: 'Multi-Currency',        desc: 'Live FX for USD, EUR, GBP, AED and more.' },
  { icon: '📐', title: 'Project Estimator',    desc: 'Full BOM costing with exportable reports.' },
  { icon: '🔧', title: 'Custom Profiles',      desc: 'Any busbar dimension beyond standard IEC/DIN sizes.' },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 28, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring' as const, stiffness: 220, damping: 22 } },
};

export function ComingSoonSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="mt-16 mb-12">
      <div className="copper-divider mb-8">Coming Soon</div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {UPCOMING.map(u => (
          <motion.div key={u.title} variants={item} className="soon-card">
            <div className="text-2xl mb-3">{u.icon}</div>
            <h3 className="font-semibold text-sm text-zinc-200 mb-1">{u.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{u.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
