'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion, MotionConfig, useInView, useReducedMotion, useScroll, useSpring,
} from 'framer-motion';
import { Header } from '@/components/Header';
import { FxFooter } from '@/components/figma/FxFooter';

/* Roadmap — showpiece edition (July 2026 relaunch).
   Four honest eras around an animated copper timeline: the spine draws
   itself with scroll, era nodes ignite in view, SHIPPED nodes pulse.
   All motion is transform/opacity-only and collapses to static under
   prefers-reduced-motion (MotionConfig reducedMotion="user" + CSS media). */

/* ── Data ─────────────────────────────────────────────────────── */
type Era = {
  key: string;
  chip: string;
  chipColor: string;
  title: string;
  blurb: string;
  pulse?: boolean;
  items: Array<{ icon: string; title: string; desc: string }>;
};

const ERAS: Era[] = [
  {
    key: 'shipped',
    chip: 'SHIPPED ✦ 2026',
    chipColor: '#22c55e',
    pulse: true,
    title: 'From calculator to four-platform product',
    blurb:
      'Everything below is live today — built, tested and deployed at calculator.payapress.com and in the official apps.',
    items: [
      { icon: '⚡', title: 'Copper & aluminum calculator', desc: 'Live COMEX/LME pricing, 17 currencies with live FX, weight · ampacity · cost from exact dimensions, IEC cross-sections and material grades.' },
      { icon: '🪚', title: 'Waste calculator', desc: 'Blade kerf loss per cut and punch-out slugs — weighed with exact alloy density and priced at the live market rate.' },
      { icon: '📥', title: 'EPLAN panel cost tool', desc: 'Import the parts list straight from EPLAN (Excel or text export), automatic DE/EN column mapping, offcut packing — the true copper cost of a whole panel. Files never leave the browser.' },
      { icon: '👤', title: 'Accounts & history', desc: 'Email OTP and Google Sign-In (Sign in with Apple ready), saved calculations, compare & bookmarks, daily price digest email.' },
      { icon: '🖥️', title: 'Official Windows app', desc: 'Native shell for Windows 10/11 (x64 + ARM64), branded offline handling — v1.0.2 live on /download.' },
      { icon: '🤖', title: 'Official Android app', desc: 'Trusted Web Activity signed and live (v1.0.1), Google Play submission kit complete.' },
      { icon: '🍎', title: 'iOS app built', desc: 'Capacitor shell with native Sign in with Apple — TestFlight-ready, App Store kit prepared.' },
      { icon: '🔌', title: 'Public REST API v1', desc: 'Free calculation + live price endpoints, plus first-party cookieless analytics and a PWA that installs anywhere.' },
    ],
  },
  {
    key: 'progress',
    chip: 'IN PROGRESS',
    chipColor: '#f7941d',
    title: 'Store rollouts & the feedback loop',
    blurb: 'The apps exist — now they meet the stores and the users shape what ships next.',
    items: [
      { icon: '▶️', title: 'Google Play listing', desc: 'Closed testing → production rollout of the signed Android build.' },
      { icon: '✈️', title: 'TestFlight → App Store', desc: 'Apple Developer onboarding, TestFlight beta, then App Store review.' },
      { icon: '💬', title: 'Pulse insights loop', desc: 'In-app micro-surveys feeding the roadmap — what users need decides what gets built.' },
    ],
  },
  {
    key: 'next',
    chip: 'NEXT',
    chipColor: '#f59e0b',
    title: 'Deeper intelligence for daily work',
    blurb: 'Sharper tools for the people who quote metal every day.',
    items: [
      { icon: '🔔', title: 'Price alerts expansion', desc: 'Threshold alerts and richer notification channels beyond the daily digest.' },
      { icon: '📈', title: 'Historical analytics', desc: 'Longer ranges, volatility context and comparisons built for procurement decisions.' },
      { icon: '👥', title: 'Teams & workspaces', desc: 'Shared history, panels and price books for fabrication teams.' },
    ],
  },
  {
    key: 'vision',
    chip: 'VISION',
    chipColor: '#8b9bb0',
    title: 'The industrial intelligence suite',
    blurb: 'The services we deliberately keep out of the header until they are real.',
    items: [
      { icon: '🌐', title: 'Live Metal Prices hub', desc: 'Aluminum, steel, zinc, tin, nickel — one dashboard for every panel-shop metal.' },
      { icon: '📰', title: 'Industry news & market intelligence', desc: 'Curated signals that matter to switchgear builders, not noise.' },
      { icon: '🔩', title: 'Equipment & component costs', desc: 'From enclosures to breakers — full BOM estimation around the busbar core.' },
    ],
  },
];

const STATS: Array<{ n: number; suffix: string; label: string }> = [
  { n: 4,  suffix: '',  label: 'platforms live' },
  { n: 17, suffix: '',  label: 'currencies' },
  { n: 3,  suffix: '',  label: 'live feeds · COMEX LME FX' },
  { n: 97, suffix: '',  label: 'automated tests green' },
];

/* ── Small primitives ─────────────────────────────────────────── */

function Counter({ n, suffix }: { n: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) { setV(n); return; }
    const t0 = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, n, reduced]);
  return <span ref={ref}>{v}{suffix}</span>;
}

const rise = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] as const },
};

/* ── Milestone card ───────────────────────────────────────────── */
function MilestoneCard({ icon, title, desc, i }: { icon: string; title: string; desc: string; i: number }) {
  return (
    <motion.div
      className="rmx-card"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (i % 4) * 0.07, ease: [0.32, 0.72, 0, 1] }}
    >
      <span className="rmx-card-icon" aria-hidden>{icon}</span>
      <div>
        <h3 className="rmx-card-title">{title}</h3>
        <p className="rmx-card-desc">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ── Era block (node ignites when in view) ────────────────────── */
function EraBlock({ era }: { era: Era }) {
  const ref = useRef<HTMLDivElement>(null);
  const lit = useInView(ref, { once: true, margin: '-25% 0px -25% 0px' });
  return (
    <section ref={ref} className={`rmx-era${lit ? ' lit' : ''}`} aria-label={era.chip}>
      <div className="rmx-node-wrap" aria-hidden>
        <span
          className={`rmx-node${era.pulse ? ' pulse' : ''}`}
          style={{ '--node': era.chipColor } as React.CSSProperties}
        />
      </div>
      <div className="rmx-era-body">
        <motion.div {...rise}>
          <span className="rmx-chip" style={{ color: era.chipColor, borderColor: era.chipColor }}>
            {era.chip}
          </span>
          <h2 className="rmx-era-title">{era.title}</h2>
          <p className="rmx-era-blurb">{era.blurb}</p>
        </motion.div>
        <div className="rmx-grid">
          {era.items.map((m, i) => <MilestoneCard key={m.title} {...m} i={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function RoadmapClient() {
  const reduced = useReducedMotion();

  // Top reading-progress bar
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  // Timeline spine draws with scroll through the timeline section
  const spineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: spineProg } = useScroll({
    target: spineRef,
    offset: ['start 0.75', 'end 0.6'],
  });
  const spineScale = useSpring(spineProg, { stiffness: 120, damping: 24, mass: 0.4 });

  return (
    <MotionConfig reducedMotion="user">
      <div className="rmx">
        <motion.div className="rmx-progress" style={{ scaleX: reduced ? 1 : progress }} aria-hidden />
        <Header />

        {/* ── Hero ── */}
        <section className="rmx-hero">
          <div className="rmx-orb a" aria-hidden />
          <div className="rmx-orb b" aria-hidden />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="rmx-hero-inner"
          >
            <p className="rmx-kicker">Busbar Calculator · Product Roadmap</p>
            <h1 className="rmx-h1">
              Development<br />Roadmap
              <span className="sr-only"> — Busbar Calculator product plan</span>
            </h1>
            <p className="rmx-hero-sub">
              From a copper busbar calculator to a four-platform industrial
              product — shipped, in motion, and what comes next.
            </p>
            <div className="rmx-stats">
              {STATS.map(s => (
                <motion.div key={s.label} className="rmx-stat" {...rise}>
                  <span className="rmx-stat-n"><Counter n={s.n} suffix={s.suffix} /></span>
                  <span className="rmx-stat-l">{s.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src="/mr-busbar.png" alt="" width={120} height={345}
            className="rmx-mascot" aria-hidden
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.32, 0.72, 0, 1] }}
          />
        </section>

        {/* ── Timeline ── */}
        <div className="rmx-timeline" ref={spineRef}>
          <div className="rmx-spine" aria-hidden>
            <motion.div className="rmx-spine-fill" style={{ scaleY: reduced ? 1 : spineScale }} />
          </div>
          {ERAS.map(era => <EraBlock key={era.key} era={era} />)}
        </div>

        {/* ── CTA ── */}
        <motion.section className="rmx-cta" {...rise}>
          <h2 className="rmx-cta-title">See the shipped part for yourself</h2>
          <p className="rmx-cta-sub">The calculator is free — on the web today, on your desktop and phone as apps.</p>
          <div className="rmx-cta-row">
            <Link href="/busbar-calculator" className="rmx-cta-btn">Open Busbar Calculator</Link>
            <Link href="/download" className="rmx-cta-ghost">Get the apps — Windows · Android · iOS</Link>
          </div>
        </motion.section>

        <FxFooter />
      </div>
    </MotionConfig>
  );
}
