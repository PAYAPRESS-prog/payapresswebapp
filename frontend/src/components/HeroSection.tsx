'use client';

import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <div className="text-center mb-8">
      {/* Badge */}
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[0.62rem] font-bold tracking-[0.3em] text-copper-700 uppercase mb-3"
      >
        Electrical Panel Fabrication Tools
      </motion.p>

      {/* Headline — two lines, no overflow */}
      <h1 className="font-black tracking-tight text-white mb-3 leading-tight">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 240, damping: 22 }}
          className="block text-2xl sm:text-3xl"
        >
          Copper Busbar
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, type: 'spring', stiffness: 240, damping: 22 }}
          className="block text-3xl sm:text-4xl text-shimmer"
        >
          Cost Calculator
        </motion.span>
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="text-zinc-500 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed"
      >
        Live COMEX pricing · IEC &amp; DIN standard sizes · Weight, cost/m, cost/m²
      </motion.p>
    </div>
  );
}
