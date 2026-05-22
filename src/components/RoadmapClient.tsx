'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useSpring } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/* ─────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────── */
const PHASES = [
  {
    num: '01',
    group: 'launch',
    groupLabel: 'Launching June 2026',
    groupColor: '#22c55e',
    status: 'LAUNCHING JUNE 2026',
    statusColor: '#22c55e',
    pulse: true,
    timeline: 'June 2026',
    icon: '⚡',
    title: 'Copper Busbar Calculator',
    subtitle: 'Platform launch · Public REST API v1 included',
    desc: 'The foundation of the platform — a professional-grade cost calculator for electrical panel fabricators across the UAE and the MENA region. The Public REST API v1 launches at the same time, free of charge for developer integrations.',
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
    featured: true,
  },
  {
    num: '02',
    group: 'next',
    groupLabel: 'Next 6 Months',
    groupColor: '#f59e0b',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    pulse: false,
    timeline: 'Q3 2026',
    icon: '📊',
    title: 'Live Metal Prices & Exchange Rates',
    subtitle: '~1–2 months after launch',
    desc: 'Expand beyond copper to a full industrial metals dashboard with live pricing for every major metal used in electrical panel manufacturing.',
    features: [
      'Live spot prices — Aluminum, Steel, Zinc, Tin, Lead, Nickel',
      'Real-time FX rates with GCC & MENA currency support',
      'Price history charts — 30 and 90-day trend indicators',
      'Market mood indicators and volatility alerts',
      'Spot vs 30/90-day average comparison tables',
    ],
    highlight: false,
    featured: false,
  },
  {
    num: '03',
    group: 'next',
    groupLabel: 'Next 6 Months',
    groupColor: '#f59e0b',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    pulse: false,
    timeline: 'Q3–Q4 2026',
    icon: '🔧',
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
    featured: false,
  },
  {
    num: '04',
    group: 'next',
    groupLabel: 'Next 6 Months',
    groupColor: '#f59e0b',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    pulse: false,
    timeline: 'Q4 2026',
    icon: '📰',
    title: 'Industry News & Market Intelligence',
    subtitle: '~4–5 months after launch',
    desc: 'Curated news and market intelligence for electrical professionals — metals markets, IEC standard updates, and regional sector developments.',
    features: [
      'Aggregated news from global metals and electrical industry sources',
      'IEC/EN standard updates and revision tracking',
      'Regional market analysis for the UAE and MENA',
      'Weekly price summaries and market outlook',
      'Bookmark and offline reading via PWA',
    ],
    highlight: false,
    featured: false,
  },
  {
    num: '05',
    group: 'horizon',
    groupLabel: 'Horizon',
    groupColor: '#a78bfa',
    status: 'FUTURE',
    statusColor: '#a78bfa',
    pulse: false,
    timeline: 'Q4 2026 – Q1 2027',
    icon: '📚',
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
    featured: true,
  },
] as const;

type Phase = typeof PHASES[number];

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
        height: 3,
        background: 'linear-gradient(90deg,#7d4c22,#cd7f32,#f5d78e,#cd7f32)',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   Pulsing live dot
───────────────────────────────────────────────────────────────── */
function PulseDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: 6, height: 6, background: color,
        animation: 'live-pulse 2s ease-in-out infinite',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   Phase card — Canva presentation style
───────────────────────────────────────────────────────────────── */
function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [open, setOpen] = useState(phase.highlight);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const touched = useRef(false);

  return (
    <motion.div
      ref={ref}
      initial={{ y: 36 }}
      animate={inView ? { y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {/* CSS perspective on wrapper — avoids Safari preserve-3d bugs */}
      <div style={{ perspective: '1200px' }} className="h-full">
        <motion.div
          className="relative h-full rounded-2xl overflow-hidden"
          style={{
            background: phase.highlight
              ? 'linear-gradient(145deg, rgba(205,127,50,0.12) 0%, rgba(120,70,30,0.04) 100%)'
              : 'var(--color-surface-1)',
            border: `1px solid ${phase.statusColor}25`,
            borderTopWidth: 3,
            borderTopColor: phase.statusColor,
            boxShadow: phase.highlight
              ? `0 0 40px ${phase.statusColor}18, inset 0 1px 0 ${phase.statusColor}15`
              : `0 1px 0 ${phase.statusColor}10 inset`,
          }}
          animate={{ rotateX: rx, rotateY: ry }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.9 }}
          onMouseMove={e => {
            if (touched.current) return;
            const r = e.currentTarget.getBoundingClientRect();
            setRx(((e.clientY - r.top) / r.height - 0.5) * -4);
            setRy(((e.clientX - r.left) / r.width - 0.5) * 7);
          }}
          onMouseLeave={() => { setRx(0); setRy(0); }}
          onTouchStart={() => { touched.current = true; setRx(0); setRy(0); }}
        >
          {/* Phase number watermark */}
          <div
            aria-hidden
            className="absolute right-0 top-0 font-black font-mono leading-none select-none pointer-events-none"
            style={{
              fontSize: 'clamp(5.5rem, 18vw, 9rem)',
              color: `${phase.statusColor}09`,
              right: '-0.05em',
              top: '-0.12em',
              lineHeight: 1,
            }}
          >
            {phase.num}
          </div>

          <div className="relative p-6 sm:p-8 flex flex-col h-full">

            {/* ── Top meta row ─────────────────────────── */}
            <div className="flex items-center gap-2.5 flex-wrap mb-6">
              {/* Numbered circle badge */}
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl font-black font-mono text-sm flex-shrink-0"
                style={{
                  background: `${phase.statusColor}15`,
                  color: phase.statusColor,
                  border: `1.5px solid ${phase.statusColor}35`,
                }}
              >
                {phase.num}
              </div>

              {/* Status badge */}
              <div
                className="flex items-center gap-1.5 text-[0.6rem] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-full"
                style={{
                  background: `${phase.statusColor}10`,
                  color: phase.statusColor,
                  border: `1px solid ${phase.statusColor}28`,
                }}
              >
                {phase.pulse && <PulseDot color={phase.statusColor} />}
                {phase.status}
              </div>

              <span
                className="ml-auto font-mono text-[0.67rem] font-medium"
                style={{ color: 'rgba(255,255,255,0.22)' }}
              >
                {phase.timeline}
              </span>
            </div>

            {/* ── Icon + Title ──────────────────────────── */}
            <div className="flex items-start gap-3 mb-3">
              <span
                className="text-xl flex-shrink-0 mt-0.5 leading-none"
                style={{ filter: 'drop-shadow(0 0 8px rgba(205,127,50,0.3))' }}
              >
                {phase.icon}
              </span>
              <div>
                <h2
                  className="font-black leading-tight mb-1"
                  style={{
                    fontSize: 'clamp(1.1rem, 3.2vw, 1.35rem)',
                    letterSpacing: '-0.015em',
                    color: phase.highlight ? '#e8a855' : '#e4e4e7',
                  }}
                >
                  {phase.title}
                </h2>
                <p
                  className="font-mono text-[0.68rem] tracking-wide leading-snug"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  {phase.subtitle}
                </p>
              </div>
            </div>

            {/* ── Description ──────────────────────────── */}
            <p
              className="leading-relaxed mb-6 flex-1"
              style={{ fontSize: '0.875rem', color: '#71717a', minHeight: 0 }}
            >
              {phase.desc}
            </p>

            {/* ── Divider ──────────────────────────────── */}
            <div
              className="mb-5"
              style={{ height: 1, background: `linear-gradient(90deg, ${phase.statusColor}20, transparent)` }}
            />

            {/* ── Feature list (safe AnimatePresence) ──── */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  key="features"
                  initial={{ y: -8 }}
                  animate={{ y: 0 }}
                  exit={{ y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-2.5 mb-5"
                >
                  {phase.features.map((f, fi) => (
                    <motion.li
                      key={f}
                      initial={{ x: -6 }}
                      animate={{ x: 0 }}
                      transition={{ delay: fi * 0.04, duration: 0.25 }}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[0.38rem]"
                        style={{ background: phase.statusColor, boxShadow: `0 0 6px ${phase.statusColor}60` }}
                      />
                      <span style={{ fontSize: '0.82rem', color: '#71717a', lineHeight: 1.55 }}>
                        {f}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {/* ── Toggle ───────────────────────────────── */}
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1.5 text-[0.75rem] font-semibold mt-auto transition-opacity hover:opacity-75"
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
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Group section header
───────────────────────────────────────────────────────────────── */
function GroupHeader({ label, color, count }: { label: string; color: string; count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ x: -16 }}
      animate={inView ? { x: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 mb-6"
    >
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 12px ${color}90` }}
      />
      <span
        className="font-mono text-[0.67rem] font-bold tracking-[0.2em] uppercase"
        style={{ color }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded"
        style={{ color: `${color}80`, border: `1px solid ${color}20`, background: `${color}08` }}
      >
        {count} phase{count !== 1 ? 's' : ''}
      </span>
      <div className="flex-1" style={{ height: 1, background: `linear-gradient(90deg, ${color}25, transparent)` }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────── */
export default function RoadmapClient() {
  const { scrollYProgress } = useScroll();
  const lineScaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const launchPhases  = PHASES.filter(p => p.group === 'launch');
  const nextPhases    = PHASES.filter(p => p.group === 'next');
  const horizonPhases = PHASES.filter(p => p.group === 'horizon');

  return (
    <div style={{ background: 'var(--color-surface-0)', minHeight: '100svh' }}>
      <ScrollProgressBar />
      <Header />

      <main className="px-4 sm:px-6 pt-10 sm:pt-14 pb-28">
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>

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

            {/* Launch badge */}
            <div className="mb-5">
              <div
                className="inline-flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full"
                style={{
                  color: '#22c55e',
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.22)',
                }}
              >
                <PulseDot color="#22c55e" />
                Launching June 2026
              </div>
            </div>

            {/* Title */}
            <h1
              className="mb-5 leading-none"
              style={{
                fontSize: 'clamp(2.8rem, 9vw, 4.8rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg,#7d4c22 0%,#cd7f32 35%,#f5d78e 58%,#cd7f32 80%,#8b5a2b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Development<br />Roadmap
            </h1>

            <p
              className="max-w-lg leading-relaxed mb-8"
              style={{ fontSize: '0.95rem', color: '#71717a' }}
            >
              PAYAPRESS Industrial Tools Platform — from copper busbar calculator
              to a full industrial intelligence suite for electrical professionals
              across the UAE and MENA region. Built by the PAYAPRESS Digital Marketing Team.
            </p>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-4 sm:gap-8">
              {[
                { label: 'Total Phases', value: '5' },
                { label: 'Launch',       value: 'June 2026' },
                { label: 'Roadmap',      value: '6 Months' },
                { label: 'Region',       value: 'UAE · MENA' },
              ].map(s => (
                <div key={s.label}>
                  <p
                    className="font-black leading-none mb-0.5"
                    style={{ fontSize: '1.15rem', color: '#cd7f32' }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-widest font-medium" style={{ color: '#52525b' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Animated left-rail progress ───────────── */}
          <div className="relative" style={{ paddingLeft: '0' }}>

            {/* ── GROUP: Launching June 2026 ─────────── */}
            <section className="mb-14">
              <GroupHeader
                label="Launching June 2026"
                color="#22c55e"
                count={launchPhases.length}
              />
              <div className="grid grid-cols-1 gap-5">
                {launchPhases.map((phase, i) => (
                  <PhaseCard key={phase.num} phase={phase} index={i} />
                ))}
              </div>
            </section>

            {/* ── GROUP: Next 6 Months ───────────────── */}
            <section className="mb-14">
              <GroupHeader
                label="Next 6 Months"
                color="#f59e0b"
                count={nextPhases.length}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {nextPhases.map((phase, i) => (
                  <PhaseCard key={phase.num} phase={phase} index={i} />
                ))}
              </div>
            </section>

            {/* ── GROUP: Horizon ─────────────────────── */}
            <section className="mb-14">
              <GroupHeader
                label="Horizon"
                color="#a78bfa"
                count={horizonPhases.length}
              />
              <div className="grid grid-cols-1 gap-5">
                {horizonPhases.map((phase, i) => (
                  <PhaseCard key={phase.num} phase={phase} index={i} />
                ))}
              </div>
            </section>

          </div>

          {/* ── Timeline progress rail ─────────────── */}
          <motion.div
            aria-hidden
            className="fixed left-4 sm:left-6 top-1/4 bottom-1/4 pointer-events-none"
            style={{ width: 2, zIndex: 10 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(184,115,51,0.08)' }}
            />
            <motion.div
              className="absolute top-0 left-0 right-0 rounded-full origin-top"
              style={{
                scaleY: lineScaleY,
                background: 'linear-gradient(to bottom, #cd7f32, rgba(205,127,50,0.15))',
              }}
            />
          </motion.div>

          {/* ── CTA ───────────────────────────────────── */}
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="pt-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
            style={{ borderTop: '1px solid rgba(184,115,51,0.12)' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: '#71717a' }}>
                Built by the PAYAPRESS Digital Marketing Team
              </p>
              <p className="text-[0.72rem] mt-0.5" style={{ color: '#3f3f46' }}>
                payapress.com · Industrial Tools Platform
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm px-5 py-2.5 rounded-xl"
                style={{
                  color: '#fff',
                  background: 'linear-gradient(135deg,#cd7f32,#b87333)',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(205,127,50,0.25)',
                }}
              >
                Try the Calculator →
              </a>
              <a
                href="/whitepaper"
                className="inline-flex items-center gap-1.5 font-medium text-sm px-5 py-2.5 rounded-xl"
                style={{
                  color: '#cd7f32',
                  border: '1px solid rgba(205,127,50,0.28)',
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

      <Footer />
    </div>
  );
}
