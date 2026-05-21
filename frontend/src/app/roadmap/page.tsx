'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Header } from '@/components/Header';

const PHASES = [
  {
    num: '01',
    status: 'LIVE',
    statusColor: '#22c55e',
    statusBg: 'rgba(34,197,94,0.1)',
    timeline: 'Q2 2025',
    title: 'Copper Busbar Calculator',
    desc: 'The foundation of the platform — a professional-grade cost calculator built specifically for electrical panel fabricators.',
    features: [
      'Live COMEX HG=F copper price (Yahoo Finance, 5-min cache)',
      '22 currencies with Gulf central-bank peg rates (AED, SAR, KWD, QAR, BHD)',
      'IEC/DIN material grades — Cu-ETP · Cu-OF · Cu-OFE',
      'Proportional SVG busbar viewer, drag-to-resize',
      'IEC preset chips for fastest entry',
      'Achievement badges · calculation counter · milestone toasts',
      'PWA — installs to home screen, works offline',
      'Public REST API v1',
    ],
    active: true,
  },
  {
    num: '02',
    status: 'IN PROGRESS',
    statusColor: '#f59e0b',
    statusBg: 'rgba(245,158,11,0.1)',
    timeline: 'Q3 – Q4 2025',
    title: 'Live Metal Prices & Industry News',
    desc: 'Expand beyond copper to a full metals dashboard, and bring the latest industry intelligence directly to panel fabricators.',
    features: [
      'Live prices: Aluminum · Steel · Zinc · Tin · Lead',
      'Price history charts with 30/90-day trend lines',
      'Industry news feed from global electrical and metals sources',
      'Configurable price alert notifications',
      'Market mood indicators across all metals',
      'Comparison table — spot vs 30-day average',
    ],
    active: false,
  },
  {
    num: '03',
    status: 'PLANNED',
    statusColor: '#60a5fa',
    statusBg: 'rgba(96,165,250,0.1)',
    timeline: '2026 H1',
    title: 'Equipment & Component Costs',
    desc: 'A comprehensive component pricing database covering everything that goes inside an electrical panel.',
    features: [
      'Cables & conductors — all cross-sections, materials',
      'Terminal blocks, contactors, relays, circuit breakers',
      'Enclosures & DIN rails',
      'Bill of Materials (BOM) calculator — full panel cost estimate',
      'Supplier integration — live prices from major distributors',
      'Cost comparison: local vs import suppliers',
    ],
    active: false,
  },
  {
    num: '04',
    status: 'FUTURE',
    statusColor: '#a78bfa',
    statusBg: 'rgba(167,139,250,0.1)',
    timeline: '2026+',
    title: 'Community Platform & Public API',
    desc: 'Transform the platform from a tool into a professional community hub for the industrial electrical sector.',
    features: [
      'Public REST API with commercial tier for enterprise integrations',
      'Professional community forum for panel fabricators',
      'Native mobile apps — iOS & Android (App Store / Google Play)',
      'Multi-language interface — Persian (فارسی) · Arabic (العربية) · English',
      'Enterprise dashboard for workshop chains',
      'Educational content — IEC standards library, calculation guides',
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
      initial={{ opacity: 0, x: -32 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
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
          <span
            className="font-mono text-[0.6rem] font-black tracking-widest"
            style={{ color: '#3f3f46' }}
          >
            PHASE {phase.num}
          </span>
          <span
            className="text-[0.58rem] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ background: phase.statusBg, color: phase.statusColor, border: `1px solid ${phase.statusColor}40` }}
          >
            {phase.status}
          </span>
          <span
            className="ml-auto text-[0.65rem] font-mono"
            style={{ color: '#52525b' }}
          >
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

        {/* Feature list */}
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
      <main style={{ padding: '2.5rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              Where we&rsquo;ve been and where we&rsquo;re going —<br />
              the PAYAPRESS Industrial Tools Platform evolution.
            </p>
          </motion.div>

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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
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
