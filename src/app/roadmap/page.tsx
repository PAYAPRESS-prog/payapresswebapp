'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useSpring } from 'framer-motion';
import { Header } from '@/components/Header';

/* ─────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────── */
const GROUPS = [
  {
    label: 'Launching June 2026',
    labelColor: '#22c55e',
    phases: [
      {
        num: '01',
        status: 'LAUNCHING JUNE 2026',
        statusColor: '#22c55e',
        pulse: true,
        timeline: 'June 2026',
        title: 'Copper Busbar Calculator',
        subtitle: 'Platform launch · Public REST API v1 included',
        desc: 'The foundation of the platform — a professional-grade cost calculator for electrical panel fabricators across Iran and the MENA region. The Public REST API v1 launches at the same time, free of charge for developer integrations.',
        features: [
          'Live COMEX HG=F copper price — Yahoo Finance, 5-minute server cache',
          '22 currencies with Gulf central-bank peg rates (AED, SAR, KWD, QAR, BHD)',
          'IEC/DIN material grades — Cu-ETP · Cu-OF · Cu-OFE with exact density values',
          'Proportional SVG busbar viewer with drag-to-resize interaction',
          'IEC standard preset chips for one-tap dimension entry',
          'Achievement badges, calculation milestones, live cost breakdown',
          'PWA — installs to home screen on iOS & Android, fully offline capable',
          'Public REST API v1 — free at launch · /api/v1/calculate',
        ],
        highlight: true,
      },
    ],
  },
  {
    label: 'Next 6 Months',
    labelColor: '#f59e0b',
    phases: [
      {
        num: '02',
        status: 'PLANNED',
        statusColor: '#f59e0b',
        pulse: false,
        timeline: 'Q3 2026',
        title: 'Live Metal Prices & Exchange Rates',
        subtitle: '~1–2 months after launch',
        desc: 'Expand beyond copper to a full industrial metals dashboard with live pricing for every major metal used in electrical panel manufacturing.',
        features: [
          'Live spot prices — Aluminum, Steel, Zinc, Tin, Lead, Nickel',
          'Real-time FX rates with Iranian Rial (IRR/IRT) support',
          'Price history charts — 30 and 90-day trend indicators',
          'Market mood indicators and volatility alerts',
          'Spot vs 30/90-day average comparison tables',
        ],
        highlight: false,
      },
      {
        num: '03',
        status: 'PLANNED',
        statusColor: '#f59e0b',
        pulse: false,
        timeline: 'Q3–Q4 2026',
        title: 'Equipment & Component Cost Database',
        subtitle: '~2–4 months after launch',
        desc: 'A comprehensive component pricing reference covering everything inside an electrical panel — from cables to enclosures, with full BOM estimation.',
        features: [
          'Cables & conductors — all cross-sections, insulation types, materials',
          'Terminal blocks, contactors, relays, miniature circuit breakers',
          'Enclosures, DIN rails, cable trays, mounting hardware',
          'Full BOM calculator — complete panel cost estimation',
          'Local vs import supplier price comparison',
          'Export BOM to Excel and PDF',
        ],
        highlight: false,
      },
      {
        num: '04',
        status: 'PLANNED',
        statusColor: '#f59e0b',
        pulse: false,
        timeline: 'Q4 2026',
        title: 'Industry News & Market Intelligence',
        subtitle: '~4–5 months after launch',
        desc: 'Curated news and market intelligence for electrical professionals — metals markets, IEC standard updates, and regional sector developments.',
        features: [
          'Aggregated news from global metals and electrical industry sources',
          'IEC/EN standard updates and revision tracking',
          'Regional market analysis for Iran and MENA',
          'Weekly price summaries and market outlook',
          'Bookmark and offline reading via PWA',
        ],
        highlight: false,
      },
    ],
  },
  {
    label: 'Horizon',
    labelColor: '#a78bfa',
    phases: [
      {
        num: '05',
        status: 'FUTURE',
        statusColor: '#a78bfa',
        pulse: false,
        timeline: 'Q4 2026 – Q1 2027',
        title: 'Specialized Technical Encyclopedias',
        subtitle: '~5–6 months after launch',
        desc: 'Deep-dive knowledge bases for IEC standards, material science, and practical engineering references — built for professionals, accessible offline.',
        features: [
          'IEC 60317 copper conductor standards — full reference library',
          'Material science: conductivity, thermal ratings, corrosion resistance',
          'Panel fabrication guides and best-practice documentation',
          'Persian (فارسی) and Arabic (العربية) language versions',
          'Offline-first via PWA service worker',
        ],
        highlight: false,
      },
    ],
  },
] as const;

type Phase = typeof GROUPS[number]['phases'][number];

/* ─────────────────────────────────────────────────────────────────
   Scroll progress bar
───────────────────────────────────────────────────────────────── */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[200] origin-left pointer-events-none"
      style={{
        scaleX,
        height: 2,
        background: 'linear-gradient(90deg,#7d4c22,#cd7f32,#f5d78e)',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   3D tilt card — safe pattern: CSS perspective on parent,
   motion.div for the rotation only
───────────────────────────────────────────────────────────────── */
function TiltCard({ children, className, style }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const touched = useRef(false);

  return (
    /* CSS perspective on the wrapper — NOT on the motion element */
    <div style={{ perspective: '1000px' }}>
      <motion.div
        className={className}
        style={style}
        animate={{ rotateX: rx, rotateY: ry }}
        transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.8 }}
        onMouseMove={e => {
          if (touched.current) return;
          const r = e.currentTarget.getBoundingClientRect();
          setRx(((e.clientY - r.top) / r.height - 0.5) * -5);
          setRy(((e.clientX - r.left) / r.width - 0.5) * 8);
        }}
        onMouseLeave={() => { setRx(0); setRy(0); }}
        onTouchStart={() => { touched.current = true; setRx(0); setRy(0); }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Phase card
───────────────────────────────────────────────────────────────── */
function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [open, setOpen] = useState(phase.highlight);

  return (
    <motion.div
      ref={ref}
      initial={{ y: 40 }}
      animate={inView ? { y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard
        className={phase.highlight ? 'card-copper rounded-2xl' : 'rounded-2xl'}
        style={phase.highlight ? undefined : {
          background: 'var(--color-surface-1)',
          border: '1px solid var(--color-surface-3)',
        }}
      >
        <div className="relative overflow-hidden rounded-2xl">

          {/* Decorative phase number watermark */}
          <div
            aria-hidden
            className="absolute right-0 top-0 font-black font-mono leading-none select-none pointer-events-none"
            style={{
              fontSize: 'clamp(5rem, 18vw, 9rem)',
              color: `${phase.statusColor}0d`,
              right: '-0.08em',
              top: '-0.15em',
            }}
          >
            {phase.num}
          </div>

          <div className="relative p-6 sm:p-8">

            {/* ── Top meta row ─────────────────────────── */}
            <div className="flex items-center gap-2.5 flex-wrap mb-6">
              <span
                className="font-mono text-[0.6rem] font-black tracking-[0.2em] uppercase"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                Phase {phase.num}
              </span>

              <div
                className="flex items-center gap-1.5 text-[0.62rem] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
                style={{
                  background: `${phase.statusColor}12`,
                  color: phase.statusColor,
                  border: `1px solid ${phase.statusColor}30`,
                }}
              >
                {phase.pulse && (
                  <span
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: 6, height: 6,
                      background: phase.statusColor,
                      display: 'inline-block',
                      animation: 'live-pulse 2s ease-in-out infinite',
                    }}
                  />
                )}
                {phase.status}
              </div>

              <span
                className="ml-auto font-mono text-[0.68rem] font-medium"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {phase.timeline}
              </span>
            </div>

            {/* ── Title block ──────────────────────────── */}
            <div className="mb-5">
              <h2
                className="font-black leading-tight mb-1.5"
                style={{
                  fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)',
                  color: phase.highlight ? '#e8a855' : '#e4e4e7',
                  letterSpacing: '-0.01em',
                }}
              >
                {phase.title}
              </h2>
              <p
                className="font-mono text-[0.7rem] tracking-wide"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {phase.subtitle}
              </p>
            </div>

            {/* ── Description ──────────────────────────── */}
            <p
              className="leading-relaxed mb-6"
              style={{ fontSize: '0.875rem', color: '#71717a' }}
            >
              {phase.desc}
            </p>

            {/* ── Divider ──────────────────────────────── */}
            <div
              className="mb-5"
              style={{ height: 1, background: `${phase.statusColor}18` }}
            />

            {/* ── Feature list (safe AnimatePresence) ──── */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  key="features"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-3 mb-5"
                >
                  {phase.features.map((f, fi) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fi * 0.05, duration: 0.28 }}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        className="flex-shrink-0 mt-0.5 text-[0.65rem]"
                        style={{ color: phase.statusColor }}
                      >
                        ›
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#71717a', lineHeight: 1.55 }}>
                        {f}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {/* ── Toggle button ────────────────────────── */}
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1.5 text-[0.76rem] font-semibold transition-opacity hover:opacity-80"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: phase.statusColor,
              }}
            >
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.22 }}
                className="inline-block leading-none"
              >
                ↓
              </motion.span>
              {open ? 'Hide details' : 'Show details'}
            </button>

          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Group divider
───────────────────────────────────────────────────────────────── */
function GroupLabel({ label, color }: { label: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45 }}
      className="flex items-center gap-3 mb-5 mt-2"
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 10px ${color}80` }}
      />
      <span
        className="font-mono text-[0.65rem] font-bold tracking-[0.18em] uppercase"
        style={{ color }}
      >
        {label}
      </span>
      <div className="flex-1" style={{ height: 1, background: `${color}18` }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────── */
export default function RoadmapPage() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 55%', 'end 85%'],
  });
  const lineScaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 18 });

  return (
    <div style={{ background: 'var(--color-surface-0)', minHeight: '100svh' }}>
      <ScrollProgressBar />
      <Header />

      <main className="px-4 sm:px-6 pt-10 sm:pt-14 pb-28">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>

          {/* ── Hero ──────────────────────────────────── */}
          <motion.div
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16 sm:mb-20"
          >
            <a
              href="/"
              className="inline-flex items-center gap-1.5 mb-8 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: '#cd7f32', textDecoration: 'none' }}
            >
              ← Back to Calculator
            </a>

            <div className="flex flex-col items-start gap-4">
              {/* Launch badge */}
              <div
                className="inline-flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full"
                style={{
                  color: '#22c55e',
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: 7, height: 7, background: '#22c55e',
                    display: 'inline-block', flexShrink: 0,
                    animation: 'live-pulse 2s ease-in-out infinite',
                  }}
                />
                Launching June 2026
              </div>

              <h1
                style={{
                  fontSize: 'clamp(3rem, 10vw, 5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.035em',
                  lineHeight: 1,
                  background: 'linear-gradient(135deg,#7d4c22 0%,#cd7f32 40%,#f5d78e 65%,#cd7f32 85%,#7d4c22 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Roadmap
              </h1>

              <p
                className="max-w-lg leading-relaxed"
                style={{ fontSize: '0.95rem', color: '#71717a' }}
              >
                PAYAPRESS Industrial Tools Platform — from copper busbar calculator
                to a full industrial intelligence suite for electrical professionals.
                Built by the PAYAPRESS Digital Marketing Team.
              </p>
            </div>
          </motion.div>

          {/* ── Timeline ──────────────────────────────── */}
          <div
            ref={timelineRef}
            className="relative"
            style={{ paddingLeft: '1.25rem' }}
          >
            {/* Track */}
            <div
              className="absolute top-0 bottom-0"
              style={{ left: 0, width: 1, background: 'rgba(184,115,51,0.10)' }}
            />
            {/* Animated fill */}
            <motion.div
              className="absolute top-0"
              style={{
                left: 0,
                width: 1,
                bottom: 0,
                transformOrigin: 'top',
                scaleY: lineScaleY,
                background: 'linear-gradient(to bottom,#cd7f32,rgba(205,127,50,0.1))',
              }}
            />

            {/* Phase groups */}
            <div className="space-y-16">
              {GROUPS.map((group) => (
                <div key={group.label}>
                  <GroupLabel label={group.label} color={group.labelColor} />
                  <div className="space-y-5">
                    {group.phases.map((phase, i) => (
                      <div key={phase.num} className="relative">
                        {/* Dot on the timeline */}
                        <div
                          className="absolute"
                          style={{
                            left: '-1.25rem',
                            top: '2rem',
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: phase.highlight ? phase.statusColor : 'var(--color-surface-2)',
                            border: `2px solid ${phase.statusColor}`,
                            boxShadow: phase.highlight ? `0 0 12px ${phase.statusColor}70` : 'none',
                            transform: 'translateX(-50%) translateX(0.5px)',
                            zIndex: 1,
                          }}
                        />
                        <PhaseCard phase={phase} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ───────────────────────────────────── */}
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20 pt-12 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
            style={{ borderTop: '1px solid rgba(184,115,51,0.12)' }}
          >
            <p style={{ fontSize: '0.85rem', color: '#52525b' }}>
              Built by the PAYAPRESS Digital Marketing Team
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm px-5 py-2.5 rounded-lg"
                style={{
                  color: '#fff',
                  background: 'linear-gradient(135deg,#cd7f32,#b87333)',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(205,127,50,0.22)',
                }}
              >
                Try the Calculator →
              </a>
              <a
                href="/whitepaper"
                className="inline-flex items-center gap-1.5 font-medium text-sm px-5 py-2.5 rounded-lg"
                style={{
                  color: '#cd7f32',
                  border: '1px solid rgba(205,127,50,0.25)',
                  textDecoration: 'none',
                  background: 'rgba(205,127,50,0.04)',
                }}
              >
                Whitepaper
              </a>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
