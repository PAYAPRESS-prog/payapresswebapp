'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Header } from '@/components/Header';

const PHASES = [
  {
    num: '01',
    status: 'LAUNCHING JUNE 2026',
    statusColor: '#22c55e',
    statusBg: 'rgba(34,197,94,0.1)',
    timeline: 'June 2026',
    title: 'Copper Busbar Calculator',
    desc: 'The foundation of the PAYAPRESS platform — a professional-grade cost calculator built specifically for electrical panel fabricators across Iran and the MENA region.',
    features: [
      'Live COMEX HG=F copper price (Yahoo Finance, 5-minute server cache)',
      '22 currencies with Gulf central-bank peg rates (AED, SAR, KWD, QAR, BHD)',
      'IEC/DIN material grades — Cu-ETP · Cu-OF · Cu-OFE with exact density values',
      'Proportional SVG busbar cross-section viewer with drag-to-resize interaction',
      'IEC standard preset chips for fastest dimension entry',
      'Achievement badges, calculation milestones, and real-time cost breakdown',
      'PWA — installs to home screen on iOS & Android, works fully offline',
      'Public REST API v1 for developer integrations',
    ],
    active: true,
  },
  {
    num: '02',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    statusBg: 'rgba(245,158,11,0.1)',
    timeline: 'Q3 2026',
    title: 'Live Metal Prices & Exchange Rates',
    desc: 'Expand beyond copper to a full industrial metals dashboard with live pricing for all major metals used in electrical panel manufacturing.',
    features: [
      'Live prices: Aluminum · Steel · Zinc · Tin · Lead · Nickel',
      'Real-time exchange rates with support for Iranian Rial (IRR/IRT)',
      'Price history charts with 30 and 90-day trend indicators',
      'Market mood indicators and volatility signals',
      'Comparison tables — spot price vs 30-day and 90-day averages',
      'Configurable price alert notifications via browser push',
    ],
    active: false,
  },
  {
    num: '03',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    statusBg: 'rgba(245,158,11,0.1)',
    timeline: 'Q3–Q4 2026',
    title: 'Equipment & Component Cost Database',
    desc: 'A comprehensive component pricing reference covering everything that goes inside an electrical panel, with real-time cost estimation.',
    features: [
      'Cables & conductors — all cross-sections, insulation types, and materials',
      'Terminal blocks, contactors, relays, and miniature circuit breakers',
      'Enclosures, DIN rails, cable trays, and mounting hardware',
      'Full Bill of Materials (BOM) calculator — complete panel cost estimation',
      'Supplier price comparison — local vs. import cost analysis',
      'Export BOM to Excel and PDF formats',
    ],
    active: false,
  },
  {
    num: '04',
    status: 'PLANNED',
    statusColor: '#f59e0b',
    statusBg: 'rgba(245,158,11,0.1)',
    timeline: 'Q4 2026',
    title: 'Industry News & Market Intelligence',
    desc: 'Curated industry intelligence bringing the latest news on metals markets, IEC standards updates, and regional electrical sector developments.',
    features: [
      'Aggregated news feed from global metals and electrical industry sources',
      'IEC/EN standard updates and revision tracking',
      'Regional market analysis for Iran and MENA markets',
      'Weekly price summary and market outlook reports',
      'Bookmarking and offline reading support via PWA',
    ],
    active: false,
  },
  {
    num: '05',
    status: 'FUTURE',
    statusColor: '#a78bfa',
    statusBg: 'rgba(167,139,250,0.1)',
    timeline: 'Q4 2026 – Q1 2027',
    title: 'Specialized Technical Encyclopedias',
    desc: 'Deep-dive knowledge bases covering IEC standards, material science, and practical engineering references — designed for professionals in the field.',
    features: [
      'IEC 60317 copper conductor standards — full reference library',
      'Material science encyclopedia: conductivity, thermal ratings, corrosion',
      'Panel fabrication guides and best-practice documentation',
      'Persian (فارسی) and Arabic (العربية) language versions',
      'Offline-first — fully accessible without internet connection',
      'Community contribution system for industry practitioners',
    ],
    active: false,
  },
] as const;

function PhaseCard({ phase, index }: { phase: typeof PHASES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ x: -16 }}
      animate={inView ? { x: 0 } : {}}
      transition={{ type: 'spring', stiffness: 180, damping: 24, delay: index * 0.08 }}
      className="relative pl-8 sm:pl-12"
    >
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-6 w-4 h-4 rounded-full border-2 flex-shrink-0"
        style={{
          background: phase.active ? phase.statusColor : '#1c1c23',
          borderColor: phase.statusColor,
          boxShadow: phase.active ? `0 0 12px ${phase.statusColor}66` : 'none',
          transform: 'translateX(-50%)',
          left: '0.5rem',
        }}
      />

      {/* Card */}
      <div
        className={`rounded-2xl p-5 sm:p-6 mb-6 border transition-colors ${phase.active ? 'card-copper' : ''}`}
        style={phase.active ? {} : {
          background: 'var(--color-surface-1)',
          border: '1px solid var(--color-surface-3)',
        }}
      >
        {/* Header row */}
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <span className="font-mono text-[0.6rem] font-black tracking-widest" style={{ color: '#3f3f46' }}>
            PHASE {phase.num}
          </span>
          <span
            className="text-[0.58rem] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ background: phase.statusBg, color: phase.statusColor, border: `1px solid ${phase.statusColor}40` }}
          >
            {phase.status}
          </span>
          <span className="ml-auto text-[0.65rem] font-mono" style={{ color: '#52525b' }}>
            {phase.timeline}
          </span>
        </div>

        <h2
          className="font-bold mb-2 leading-tight"
          style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: phase.active ? '#e8a855' : '#d4d4d8' }}
        >
          {phase.title}
        </h2>

        <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: '#71717a', marginBottom: '1.25rem' }}>
          {phase.desc}
        </p>

        <ul className="space-y-1.5">
          {phase.features.map(f => (
            <li
              key={f}
              className="flex items-start gap-2"
              style={{ fontSize: '0.8rem', color: '#52525b', lineHeight: 1.5 }}
            >
              <span style={{ color: phase.statusColor, marginTop: '0.15em', flexShrink: 0 }}>›</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function RoadmapPage() {
  return (
    <div style={{ background: 'var(--color-surface-0)', minHeight: '100svh' }}>
      <Header />
      <main className="px-4 sm:px-6 pt-8 sm:pt-10 pb-20">
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>

          {/* Page header */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: '3rem', textAlign: 'center' }}
          >
            <a
              href="/"
              style={{ fontSize: '0.8rem', color: '#cd7f32', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}
            >
              ← Back to Calculator
            </a>
            <h1
              style={{
                fontSize: 'clamp(2rem, 6vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginBottom: '0.75rem',
                background: 'linear-gradient(90deg,#b87333,#cd7f32,#e8a855,#cd7f32,#b87333)',
                backgroundSize: '250% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Roadmap
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#71717a', lineHeight: 1.6 }}>
              PAYAPRESS Industrial Tools Platform — development timeline.<br />
              Launching June&nbsp;2026 · Built by the PAYAPRESS Digital Marketing Team.
            </p>
          </motion.div>

          {/* Development notice */}
          <div
            style={{
              marginBottom: '2.5rem',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <p style={{ fontSize: '0.82rem', color: '#f59e0b', lineHeight: 1.6, margin: 0 }}>
              <strong>Currently in active development.</strong> Phase&nbsp;01 — the Copper Busbar Calculator — launches in June&nbsp;2026.
              Phases&nbsp;02–05 will roll out over the following six months.
            </p>
          </div>

          {/* Timeline */}
          <div
            className="relative"
            style={{
              borderLeft: '1px solid rgba(184,115,51,0.2)',
              marginLeft: '0.5rem',
              paddingTop: '0.5rem',
            }}
          >
            {PHASES.map((phase, i) => (
              <PhaseCard key={phase.num} phase={phase} index={i} />
            ))}
          </div>

          {/* CTA row */}
          <motion.div
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              marginTop: '2rem',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/"
              style={{
                fontSize: '0.85rem', fontWeight: 600, color: '#fff',
                background: 'linear-gradient(135deg,#cd7f32,#b87333)',
                padding: '0.6rem 1.5rem', borderRadius: '0.5rem',
                textDecoration: 'none',
              }}
            >
              Try the Calculator →
            </a>
            <a
              href="/whitepaper"
              style={{
                fontSize: '0.85rem', fontWeight: 500,
                color: '#cd7f32',
                border: '1px solid rgba(205,127,50,0.3)',
                padding: '0.6rem 1.5rem', borderRadius: '0.5rem',
                textDecoration: 'none',
                background: 'rgba(205,127,50,0.06)',
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
