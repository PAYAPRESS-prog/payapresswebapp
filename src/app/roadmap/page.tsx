'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useScroll, useSpring } from 'framer-motion';
import { Header } from '@/components/Header';

const PHASES = [
  {
    num: '01',
    status: 'LAUNCHING JUNE 2026',
    statusColor: '#22c55e',
    statusBg: 'rgba(34,197,94,0.08)',
    pulse: true,
    timeline: 'June 2026',
    title: 'Copper Busbar Calculator',
    subtitle: 'Platform Launch · Public API Included',
    desc: 'The foundation of the PAYAPRESS platform — a professional-grade cost calculator built for electrical panel fabricators across Iran and the MENA region. The Public REST API v1 launches simultaneously, available free of charge for developer integrations.',
    features: [
      'Live COMEX HG=F copper price — Yahoo Finance, 5-minute server cache',
      '22 currencies with Gulf central-bank peg rates (AED, SAR, KWD, QAR, BHD)',
      'IEC/DIN material grades — Cu-ETP · Cu-OF · Cu-OFE with exact density values',
      'Proportional SVG busbar viewer with drag-to-resize interaction',
      'IEC standard preset chips for one-tap dimension entry',
      'Achievement badges, calculation milestones, and live cost breakdown',
      'PWA — installs to home screen on iOS & Android, works fully offline',
      'Public REST API v1 — free at launch · endpoint: /api/v1/calculate',
    ],
    highlight: true,
  },
  {
    num: '02',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    statusBg: 'rgba(245,158,11,0.07)',
    pulse: false,
    timeline: 'Q3 2026',
    title: 'Live Metal Prices & Exchange Rates',
    subtitle: '~1–2 months after launch',
    desc: 'Expand beyond copper to a full industrial metals dashboard with live pricing for all major metals used in electrical panel manufacturing.',
    features: [
      'Live spot prices — Aluminum · Steel · Zinc · Tin · Lead · Nickel',
      'Real-time exchange rates with Iranian Rial (IRR/IRT) support',
      'Price history charts with 30 and 90-day trend indicators',
      'Market mood indicators and volatility alerts',
      'Spot vs 30-day and 90-day average comparison tables',
    ],
    highlight: false,
  },
  {
    num: '03',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    statusBg: 'rgba(245,158,11,0.07)',
    pulse: false,
    timeline: 'Q3–Q4 2026',
    title: 'Equipment & Component Cost Database',
    subtitle: '~2–4 months after launch',
    desc: 'A comprehensive component pricing reference covering everything that goes inside an electrical panel, with full Bill of Materials estimation.',
    features: [
      'Cables & conductors — all cross-sections, insulation types, and materials',
      'Terminal blocks, contactors, relays, and miniature circuit breakers',
      'Enclosures, DIN rails, cable trays, and mounting hardware',
      'Full BOM calculator — complete panel cost estimation in one place',
      'Local vs import supplier price comparison and analysis',
      'Export BOM to Excel and PDF formats',
    ],
    highlight: false,
  },
  {
    num: '04',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    statusBg: 'rgba(245,158,11,0.07)',
    pulse: false,
    timeline: 'Q4 2026',
    title: 'Industry News & Market Intelligence',
    subtitle: '~4–5 months after launch',
    desc: 'Curated industrial news and market intelligence for electrical professionals — metals markets, IEC standard updates, and regional sector developments.',
    features: [
      'Aggregated news from global metals and electrical industry sources',
      'IEC/EN standard updates and revision tracking',
      'Regional market analysis for Iran and MENA',
      'Weekly price summaries and market outlook reports',
      'Bookmark and offline reading via PWA',
    ],
    highlight: false,
  },
  {
    num: '05',
    status: 'FUTURE',
    statusColor: '#a78bfa',
    statusBg: 'rgba(167,139,250,0.07)',
    pulse: false,
    timeline: 'Q4 2026 – Q1 2027',
    title: 'Specialized Technical Encyclopedias',
    subtitle: '~5–6 months after launch',
    desc: 'Deep-dive knowledge bases covering IEC standards, material science, and practical engineering references — designed for professionals in the field.',
    features: [
      'IEC 60317 copper conductor standards — full reference library',
      'Material science encyclopedia: conductivity, thermal ratings, corrosion',
      'Panel fabrication guides and best-practice documentation',
      'Persian (فارسی) and Arabic (العربية) language versions',
      'Offline-first — fully accessible without internet connection',
    ],
    highlight: false,
  },
] as const;

/* ── Scroll progress bar ──────────────────────────────────────── */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[200] origin-left"
      style={{
        scaleX,
        height: '2px',
        background: 'linear-gradient(90deg,#7d4c22,#cd7f32,#f5d78e)',
        pointerEvents: 'none',
      }}
    />
  );
}

/* ── 3D tilt wrapper ──────────────────────────────────────────── */
function TiltCard({ children, className, style }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isTouching = useRef(false);

  return (
    <motion.div
      className={className}
      style={{ ...style, transformPerspective: 900, transformStyle: 'preserve-3d', willChange: 'transform' }}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.7 }}
      onMouseMove={e => {
        if (isTouching.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          x: ((e.clientY - r.top) / r.height - 0.5) * -6,
          y: ((e.clientX - r.left) / r.width - 0.5) * 9,
        });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onTouchStart={() => { isTouching.current = true; }}
    >
      {children}
    </motion.div>
  );
}

/* ── Phase card ───────────────────────────────────────────────── */
function PhaseCard({ phase, index }: { phase: typeof PHASES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [open, setOpen] = useState(phase.highlight);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard
        className={phase.highlight ? 'card-copper rounded-2xl overflow-hidden' : 'rounded-2xl overflow-hidden'}
        style={phase.highlight ? {} : {
          background: 'var(--color-surface-1)',
          border: '1px solid var(--color-surface-3)',
        }}
      >
        {/* Decorative phase number */}
        <div
          aria-hidden
          className="absolute top-0 right-0 font-black leading-none select-none pointer-events-none font-mono"
          style={{
            fontSize: 'clamp(4.5rem, 16vw, 8rem)',
            color: `${phase.statusColor}12`,
            right: '-0.05em',
            top: '-0.12em',
            lineHeight: 1,
          }}
        >
          {phase.num}
        </div>

        <div className="relative p-5 sm:p-7">

          {/* Status row */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="font-mono text-[0.58rem] font-black tracking-widest" style={{ color: '#3f3f46' }}>
              PHASE {phase.num}
            </span>

            <div
              className="flex items-center gap-1.5 text-[0.6rem] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full"
              style={{ background: phase.statusBg, color: phase.statusColor, border: `1px solid ${phase.statusColor}35` }}
            >
              {phase.pulse && (
                <span
                  className="rounded-full"
                  style={{
                    width: 6, height: 6, flexShrink: 0,
                    background: phase.statusColor,
                    display: 'inline-block',
                    animation: 'live-pulse 2s ease-in-out infinite',
                  }}
                />
              )}
              {phase.status}
            </div>

            <span className="ml-auto font-mono text-[0.65rem]" style={{ color: '#52525b' }}>
              {phase.timeline}
            </span>
          </div>

          {/* Title */}
          <h2
            className="font-black leading-tight mb-0.5"
            style={{
              fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)',
              color: phase.highlight ? '#e8a855' : '#d4d4d8',
            }}
          >
            {phase.title}
          </h2>
          <p className="text-[0.68rem] mb-4 font-mono" style={{ color: '#52525b' }}>
            {phase.subtitle}
          </p>

          <p style={{ fontSize: '0.85rem', color: '#71717a', lineHeight: 1.65, marginBottom: '1.25rem' }}>
            {phase.desc}
          </p>

          {/* Feature list */}
          <motion.div
            animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
            initial={false}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <ul className="space-y-2 mb-4">
              {phase.features.map((f, fi) => (
                <motion.li
                  key={f}
                  initial={{ x: -8, opacity: 0 }}
                  animate={inView && open ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: fi * 0.055 + 0.1, duration: 0.35 }}
                  className="flex items-start gap-2"
                  style={{ fontSize: '0.8rem', color: '#52525b', lineHeight: 1.5 }}
                >
                  <span style={{ color: phase.statusColor, flexShrink: 0, marginTop: '0.15em' }}>›</span>
                  {f}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Toggle */}
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: '0.75rem', fontWeight: 600,
              color: phase.statusColor,
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}
          >
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}
              style={{ display: 'inline-block', lineHeight: 1 }}>
              ↓
            </motion.span>
            {open ? 'Hide details' : 'Show details'}
          </button>
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function RoadmapPage() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 60%', 'end 80%'],
  });
  const lineScaleY = useSpring(scrollYProgress, { stiffness: 70, damping: 20 });

  return (
    <div style={{ background: 'var(--color-surface-0)', minHeight: '100svh' }}>
      <ScrollProgressBar />
      <Header />

      <main className="px-4 sm:px-6 pt-8 sm:pt-12 pb-24">
        <div style={{ maxWidth: '46rem', margin: '0 auto' }}>

          {/* ── Hero ────────────────────────────────────── */}
          <motion.div
            initial={{ y: 28 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-14"
          >
            <a
              href="/"
              style={{ fontSize: '0.8rem', color: '#cd7f32', textDecoration: 'none', display: 'inline-block', marginBottom: '1.75rem' }}
            >
              ← Back to Calculator
            </a>

            {/* Launch badge */}
            <div className="flex justify-center mb-5">
              <div
                className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full"
                style={{
                  color: '#22c55e',
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.22)',
                }}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: 7, height: 7, background: '#22c55e', flexShrink: 0, display: 'inline-block',
                    animation: 'live-pulse 2s ease-in-out infinite',
                  }}
                />
                Launching June 2026
              </div>
            </div>

            <h1
              className="font-black"
              style={{
                fontSize: 'clamp(2.8rem, 9vw, 4.5rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.0,
                marginBottom: '1.1rem',
                background: 'linear-gradient(90deg,#7d4c22,#cd7f32,#f5d78e,#cd7f32,#7d4c22)',
                backgroundSize: '250% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'copper-shimmer 5s linear infinite',
              }}
            >
              Roadmap
            </h1>

            <p style={{ fontSize: '0.9rem', color: '#71717a', lineHeight: 1.65, maxWidth: '32rem', margin: '0 auto' }}>
              From copper busbar calculator to a full industrial intelligence suite —
              built by the PAYAPRESS Digital Marketing Team for electrical professionals.
            </p>
          </motion.div>

          {/* ── Timeline ────────────────────────────────── */}
          <div
            ref={timelineRef}
            className="relative"
            style={{ paddingLeft: '2rem', paddingTop: '0.25rem' }}
          >
            {/* Track */}
            <div
              className="absolute top-2 bottom-2"
              style={{
                left: '4px',
                width: '1px',
                background: 'rgba(184,115,51,0.10)',
              }}
            />
            {/* Animated fill */}
            <motion.div
              className="absolute top-2"
              style={{
                left: '4px',
                width: '1px',
                bottom: '0.5rem',
                transformOrigin: 'top',
                scaleY: lineScaleY,
                background: 'linear-gradient(to bottom,#cd7f32,rgba(205,127,50,0.15))',
              }}
            />

            <div className="space-y-5">
              {PHASES.map((phase, i) => (
                <div key={phase.num} className="relative">
                  {/* Timeline dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2rem',
                      top: '1.6rem',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: phase.highlight ? phase.statusColor : 'var(--color-surface-2)',
                      border: `2px solid ${phase.statusColor}`,
                      boxShadow: phase.highlight ? `0 0 14px ${phase.statusColor}70` : 'none',
                      transform: 'translateX(-50%) translateX(4.5px)',
                      zIndex: 1,
                    }}
                  />
                  <PhaseCard phase={phase} index={i} />
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ─────────────────────────────────────── */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 flex gap-3 justify-center flex-wrap"
          >
            <a
              href="/"
              style={{
                fontSize: '0.88rem', fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg,#cd7f32,#b87333)',
                padding: '0.65rem 1.75rem', borderRadius: '0.5rem',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(205,127,50,0.25)',
              }}
            >
              Try the Calculator →
            </a>
            <a
              href="/whitepaper"
              style={{
                fontSize: '0.88rem', fontWeight: 500,
                color: '#cd7f32',
                border: '1px solid rgba(205,127,50,0.28)',
                padding: '0.65rem 1.75rem', borderRadius: '0.5rem',
                textDecoration: 'none',
                background: 'rgba(205,127,50,0.05)',
              }}
            >
              Read the Whitepaper
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
