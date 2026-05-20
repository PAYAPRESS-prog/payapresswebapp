'use client';

import { motion } from 'framer-motion';

const PILLS = [
  { label: 'Live COMEX', dot: true  },
  { label: 'IEC · DIN',  dot: false },
  { label: 'USD · EUR · AED', dot: false },
] as const;

export function HeroSection() {
  return (
    <div className="text-center mb-10 sm:mb-12">

      <h1 className="font-black tracking-tight mb-5 leading-[1.06]">
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="block text-lg sm:text-xl text-zinc-500 font-semibold tracking-[0.03em] mb-1"
        >
          Copper Busbar
        </motion.span>

        <motion.span
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="block text-4xl sm:text-5xl lg:text-6xl text-shimmer"
        >
          Cost Calculator
        </motion.span>
      </h1>

      <motion.div
        className="flex items-center justify-center gap-2 flex-wrap"
        initial="hidden"
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.09, delayChildren: 0.42 } },
          hidden: {},
        }}
      >
        {PILLS.map(pill => (
          <motion.div
            key={pill.label}
            variants={{
              hidden: { opacity: 0, scale: 0.78, y: 6 },
              show: {
                opacity: 1, scale: 1, y: 0,
                transition: { type: 'spring' as const, stiffness: 340, damping: 22 },
              },
            }}
            className="flex items-center gap-1.5 text-[0.66rem] font-medium text-zinc-500
                       bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]
                       rounded-full px-3 py-1 select-none"
          >
            {pill.dot && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500
                               shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
            )}
            {pill.label}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
