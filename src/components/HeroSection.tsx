'use client';

const PILLS = [
  { label: 'Live COMEX', dot: true  },
  { label: 'IEC · DIN',  dot: false },
  { label: 'USD · EUR · AED', dot: false },
] as const;

export function HeroSection() {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <h1 className="font-black tracking-tight mb-4 sm:mb-5 leading-[1.06]">
        <span
          className="block text-sm sm:text-lg text-zinc-600 font-semibold tracking-[0.05em] mb-1"
          style={{ animation: 'hero-slide-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}
        >
          Professional
        </span>
        <span
          className="block text-4xl sm:text-5xl lg:text-6xl text-shimmer"
          style={{ animation: 'hero-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s both' }}
        >
          Busbar Calculator
        </span>
      </h1>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {PILLS.map((pill, i) => (
          <div
            key={pill.label}
            className="flex items-center gap-1.5 text-[0.7rem] font-medium text-zinc-500
                       bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]
                       rounded-full px-3 py-1 select-none"
            style={{ animation: `hero-pill-in 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.4 + i * 0.08}s both` }}
          >
            {pill.dot && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500
                               shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
            )}
            {pill.label}
          </div>
        ))}
      </div>
    </div>
  );
}
