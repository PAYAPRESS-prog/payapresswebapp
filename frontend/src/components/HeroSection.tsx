'use client';

import { motion } from 'framer-motion';

const words = ['Copper', 'Busbar', 'Cost', 'Calculator'];

export function HeroSection() {
  return (
    <div className="text-center mb-10">
      {/* Badge */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[0.65rem] font-bold tracking-[0.35em] text-copper-700 uppercase mb-4"
      >
        Electrical Panel Fabrication Tools
      </motion.p>

      {/* Headline word-by-word */}
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4 leading-[1.15]">
        {words.map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 240, damping: 20 }}
            className={`inline-block mr-[0.25em] ${i >= 2 ? 'text-shimmer' : ''}`}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed"
      >
        Live COMEX pricing · IEC &amp; DIN standard sizes · Weight, cost/m, cost/m²
      </motion.p>
    </div>
  );
}
