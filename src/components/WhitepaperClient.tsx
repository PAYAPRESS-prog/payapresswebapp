'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion, MotionConfig, useInView, useReducedMotion, useScroll, useSpring,
} from 'framer-motion';
import { Header } from '@/components/Header';
import { FxFooter } from '@/components/figma/FxFooter';

/* Whitepaper v2.0 — keynote-doc edition (July 2026).
   Animated four-platform architecture figure, formula cards (formulas are
   FROZEN and presented verbatim), sticky section nav with active highlight,
   reading-progress bar. Motion is transform/opacity only and collapses to
   static under prefers-reduced-motion. */

const SECTIONS = [
  { id: 'summary',      label: 'Executive summary' },
  { id: 'architecture', label: 'Four-platform architecture' },
  { id: 'methodology',  label: 'Calculation methodology' },
  { id: 'pipeline',     label: 'Live data pipeline' },
  { id: 'trust',        label: 'Trust & privacy' },
  { id: 'platforms',    label: 'Platform status' },
];

const FORMULAS = [
  { k: 'Busbar weight',   f: 'kg = (L × W × T) mm³ × ρ / 10⁶', note: 'Exact alloy density per grade — Cu-ETP 8.94, Cu-OF/OFE per IEC.' },
  { k: 'Live cost',       f: 'cost = kg × price(USD/kg) × FX', note: 'COMEX HG=F / LME spot, converted with the live FX rate of the chosen currency.' },
  { k: 'Blade kerf',      f: 'kerf = max(0.5 mm, Ø × 1.5%)',   note: 'Typical cold-saw slot; waste per cut = kerf × W × T × ρ.' },
  { k: 'Punch-out slug',  f: 'slug = π (d/2)² × T',            note: 'Removed volume per hole, weighed with the same density model.' },
  { k: 'Offcut packing',  f: 'FFD: sort ↓, first fit per bar', note: 'EPLAN pieces packed into stock bars first-fit-decreasing — real offcut scrap, kerf per cut included.' },
];

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] as const },
};

/* ── Animated architecture figure ─────────────────────────────── */
function ArchitectureFigure() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const nodes = [
    { x: 60,  y: 40,  label: 'Web · PWA' },
    { x: 340, y: 40,  label: 'Windows · Tauri' },
    { x: 60,  y: 200, label: 'Android · TWA' },
    { x: 340, y: 200, label: 'iOS · Capacitor' },
  ];
  return (
    <svg ref={ref} viewBox="0 0 400 240" className={`wpx-arch${inView ? ' on' : ''}`}
      role="img" aria-label="Four platforms around one live core">
      <defs>
        <linearGradient id="wpxCore" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7941d" /><stop offset="100%" stopColor="#d71920" />
        </linearGradient>
      </defs>
      {nodes.map((n, i) => (
        <line key={i} className="wpx-arch-link" style={{ transitionDelay: `${0.25 + i * 0.18}s` }}
          x1={200} y1={120} x2={n.x + (n.x < 200 ? 52 : -52)} y2={n.y + (n.y < 120 ? 22 : -22)}
          stroke="rgba(247,148,29,0.45)" strokeWidth="1.4" strokeDasharray="4 4" />
      ))}
      <g className="wpx-arch-core">
        <circle cx="200" cy="120" r="46" fill="url(#wpxCore)" opacity="0.16" />
        <circle cx="200" cy="120" r="34" fill="#14161a" stroke="url(#wpxCore)" strokeWidth="1.6" />
        <text x="200" y="115" textAnchor="middle" fill="#f5f7fa" fontSize="11" fontWeight="700">Live core</text>
        <text x="200" y="130" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="8.5">calculator.payapress.com</text>
      </g>
      {nodes.map((n, i) => (
        <g key={n.label} className="wpx-arch-node" style={{ transitionDelay: `${0.35 + i * 0.18}s` }}>
          <rect x={n.x - 52} y={n.y - 22} width="104" height="44" rx="12"
            fill="rgba(245,247,250,0.05)" stroke="rgba(245,247,250,0.14)" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#f5f7fa" fontSize="10.5" fontWeight="600">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function WhitepaperClient() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  // Active-section highlight for the sticky nav
  const [active, setActive] = useState('summary');
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-25% 0px -65% 0px' },
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="wpx">
        <motion.div className="rmx-progress" style={{ scaleX: reduced ? 1 : progress }} aria-hidden />
        <Header />

        {/* ── Hero ── */}
        <section className="wpx-hero">
          <div className="rmx-orb a" aria-hidden />
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}>
            <p className="rmx-kicker">Technical whitepaper · v2.0 · July 2026</p>
            <h1 className="rmx-h1 wpx-h1">
              Busbar Calculation<span className="wpx-h1-dim"> — formulas, methodology &amp; the four-platform architecture</span>
            </h1>
            <p className="rmx-hero-sub">
              How Busbar Calculator turns live metal markets into engineering
              answers — the exact formulas, the data pipeline, and the
              architecture that ships one product to web, Windows, Android and iOS.
            </p>
          </motion.div>
        </section>

        <div className="wpx-layout">
          {/* ── Sticky section nav (desktop) ── */}
          <nav className="wpx-nav" aria-label="Sections">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className={`wpx-nav-link${active === s.id ? ' on' : ''}`}>
                {s.label}
              </a>
            ))}
          </nav>

          <div className="wpx-doc">
            {/* 1 ── Executive summary */}
            <motion.section id="summary" className="wpx-sec" {...rise}>
              <h2 className="wpx-h2">1 · Executive summary</h2>
              <p className="wpx-p">
                Busbar Calculator is a professional tool suite for electrical
                engineers, switchgear panel builders and estimators. It sizes
                copper and aluminum busbars, prices them with live COMEX/LME
                market data in 17 currencies, quantifies cutting waste, and
                imports EPLAN parts lists to cost a complete panel — on the
                web and as official Windows, Android and iOS apps around one
                continuously updated core.
              </p>
              <div className="wpx-tiles">
                {[['4', 'platforms, one core'], ['17', 'currencies · live FX'], ['5 min', 'price cache · COMEX/LME'], ['0', 'third-party trackers']].map(([n, l]) => (
                  <div key={l} className="wpx-tile"><b>{n}</b><span>{l}</span></div>
                ))}
              </div>
            </motion.section>

            {/* 2 ── Architecture */}
            <motion.section id="architecture" className="wpx-sec" {...rise}>
              <h2 className="wpx-h2">2 · Four-platform architecture</h2>
              <p className="wpx-p">
                One live product — a Next.js application with server-side
                price aggregation and ISR — is delivered natively everywhere:
                a PWA on the web, a Tauri shell on Windows, a Trusted Web
                Activity on Android and a Capacitor shell on iOS. Every web
                deploy IS an app update; the shells add offline handling,
                deep links and platform sign-in.
              </p>
              <ArchitectureFigure />
            </motion.section>

            {/* 3 ── Methodology */}
            <motion.section id="methodology" className="wpx-sec" {...rise}>
              <h2 className="wpx-h2">3 · Calculation methodology</h2>
              <p className="wpx-p">
                The formula set is deliberately small, industry-standard and
                frozen — results must be reproducible by hand.
              </p>
              <div className="wpx-formulas">
                {FORMULAS.map((f, i) => (
                  <motion.div key={f.k} className="wpx-formula"
                    initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}>
                    <span className="wpx-formula-k">{f.k}</span>
                    <code className="wpx-formula-f">{f.f}</code>
                    <span className="wpx-formula-n">{f.note}</span>
                  </motion.div>
                ))}
              </div>
              <p className="wpx-p wpx-dim">
                Ampacity guidance follows IEC-style cross-section tables; the
                EPLAN importer parses Excel and delimited text exports
                (German or English headers, German decimals, UTF-16) entirely
                in the browser — files are never uploaded.
              </p>
            </motion.section>

            {/* 4 ── Pipeline */}
            <motion.section id="pipeline" className="wpx-sec" {...rise}>
              <h2 className="wpx-h2">4 · Live data pipeline</h2>
              <ul className="wpx-list">
                <li><b>Copper</b> — COMEX HG=F spot, fetched server-side, 5-minute cache.</li>
                <li><b>Aluminum</b> — LME reference, same pipeline and cache discipline.</li>
                <li><b>FX</b> — live rates for all 17 currencies, applied at display time.</li>
                <li><b>Degradation</b> — if a feed stalls, the UI shows an explicit amber “Estimated price” badge; estimates are never presented as live.</li>
                <li><b>Delivery</b> — ISR pre-renders with fresh prices; clients revalidate in the background.</li>
              </ul>
            </motion.section>

            {/* 5 ── Trust */}
            <motion.section id="trust" className="wpx-sec" {...rise}>
              <h2 className="wpx-h2">5 · Trust &amp; privacy</h2>
              <ul className="wpx-list">
                <li>First-party, cookieless analytics — no third-party trackers, no ad identifiers.</li>
                <li>Sessions are httpOnly JWT cookies; passwords hashed with bcrypt; sign-in via email OTP, Google, and Sign in with Apple.</li>
                <li>In-app account deletion; EPLAN files parsed client-side only.</li>
                <li>The application is open source — the pipeline, formulas and analytics are auditable.</li>
              </ul>
            </motion.section>

            {/* 6 ── Platforms */}
            <motion.section id="platforms" className="wpx-sec" {...rise}>
              <h2 className="wpx-h2">6 · Platform status</h2>
              <div className="wpx-table-wrap">
                <table className="wpx-table">
                  <thead><tr><th>Platform</th><th>Delivery</th><th>Status</th></tr></thead>
                  <tbody>
                    {[
                      ['Web', 'PWA · calculator.payapress.com', 'LIVE', '#22c55e'],
                      ['Windows 10/11', 'Tauri shell · NSIS + MSI', 'LIVE · v1.0.2', '#22c55e'],
                      ['Android 7+', 'Trusted Web Activity · signed APK/AAB', 'LIVE · v1.0.1', '#22c55e'],
                      ['iOS 15+', 'Capacitor shell · Sign in with Apple', 'TESTFLIGHT-READY', '#f7941d'],
                    ].map(([p, d, s, c]) => (
                      <tr key={p as string}>
                        <td>{p}</td><td>{d}</td>
                        <td><span className="wpx-status" style={{ color: c as string, borderColor: c as string }}>{s}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="wpx-p wpx-dim">
                Where the platform goes next — alerts, teams, the industrial
                intelligence suite — lives on the{' '}
                <Link href="/roadmap" className="wpx-link">product roadmap</Link>.
              </p>
            </motion.section>

            <motion.div className="rmx-cta-row wpx-cta" {...rise}>
              <Link href="/busbar-calculator" className="rmx-cta-btn">Open Busbar Calculator</Link>
              <Link href="/roadmap" className="rmx-cta-ghost">View the roadmap</Link>
            </motion.div>
          </div>
        </div>

        <FxFooter />
      </div>
    </MotionConfig>
  );
}
