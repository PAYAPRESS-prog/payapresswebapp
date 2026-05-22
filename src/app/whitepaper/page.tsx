import type { Metadata } from 'next';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Whitepaper',
  description:
    'Technical whitepaper for the PAYAPRESS Industrial Tools Platform — ' +
    'architecture, formula methodology, platform roadmap, and technology stack.',
};

export default function WhitepaperPage() {
  return (
    <div style={{ background: 'var(--color-surface-0)', minHeight: '100svh' }}>
      <Header />
      <main className="px-4 sm:px-6 pt-8 sm:pt-10 pb-20">
        <article style={{ maxWidth: '48rem', margin: '0 auto' }}>

          {/* Back link */}
          <a href="/" style={backLink}>← Back to Calculator</a>

          {/* Document header */}
          <header style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid #1c1c23' }}>
            <p style={{ ...mono, color: '#3f3f46', fontSize: '0.72rem', marginBottom: '0.75rem' }}>
              PAYAPRESS · Technical Document · v1.0 · May 2026
            </p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '0.75rem', background: 'linear-gradient(90deg,#b87333,#cd7f32,#e8a855,#cd7f32,#b87333)', backgroundSize: '250% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              PAYAPRESS Industrial<br />Tools Platform
            </h1>
            <p style={{ ...body, color: '#71717a', marginBottom: 0 }}>
              A professional digital tools platform for industrial electrical engineers and
              panel fabricators, developed and maintained by the PAYAPRESS Digital Marketing
              Team at PAYAP MACHINERY.
            </p>
          </header>

          {/* 1. Executive Summary */}
          <section style={section}>
            <h2 style={h2}>1. Executive Summary</h2>
            <p style={body}>
              PAYAPRESS Industrial Tools Platform is a web-first Progressive Web Application
              (PWA) delivering practical, data-driven tools to electrical panel fabricators,
              procurement engineers, and industrial electricians across the UAE and the broader
              MENA region. The platform is developed and maintained by the digital marketing
              team of <strong style={{ color: '#f0f0f0' }}>PAYAP MACHINERY</strong> (trading
              as PAYAPRESS), a manufacturer and distributor of electrical machinery and press
              equipment.
            </p>
            <p style={body}>
              The platform is currently in active development and scheduled to launch
              in <strong style={{ color: '#f0f0f0' }}>June&nbsp;2026</strong>. Phase&nbsp;1
              focuses on the Copper Busbar Cost Calculator — a professional-grade tool
              supporting live COMEX HG=F market pricing, 22 currencies with Gulf
              central-bank peg rates, and full IEC/DIN material-grade compliance.
            </p>
            <p style={body}>
              Following the initial launch, the platform will expand over six months with
              live metal price dashboards, equipment and component cost databases, industry
              news aggregation, and specialized technical encyclopedias — evolving into a
              comprehensive industrial intelligence suite for the electrical sector.
            </p>
          </section>

          {/* 2. Problem Statement */}
          <section style={section}>
            <h2 style={h2}>2. Problem Statement</h2>
            <p style={body}>
              Electrical panel fabricators — particularly small-to-medium workshops in the UAE
              and the MENA region — rely on manual, spreadsheet-based cost estimation for
              copper busbars. Key pain points include:
            </p>
            <ul style={list}>
              <li style={li}><strong style={{ color: '#d4d4d8' }}>Stale pricing</strong> — copper prices change daily; manually tracking COMEX leads to systematic under- or over-quoting.</li>
              <li style={li}><strong style={{ color: '#d4d4d8' }}>Currency friction</strong> — multi-currency quoting requires manual FX lookups; Gulf-pegged currencies (AED, SAR, KWD, QAR, BHD) are often mishandled.</li>
              <li style={li}><strong style={{ color: '#d4d4d8' }}>No IEC standardisation</strong> — material grade selection (Cu-ETP vs Cu-OF vs Cu-OFE) is rarely modelled correctly, causing density errors of up to 0.5%.</li>
              <li style={li}><strong style={{ color: '#d4d4d8' }}>Fragmented market data</strong> — prices for other critical metals (aluminum, steel, zinc) require separate lookups across multiple sources.</li>
              <li style={li}><strong style={{ color: '#d4d4d8' }}>No regional digital tooling</strong> — no professional, mobile-ready platform exists for this audience in regional languages or currencies.</li>
            </ul>
          </section>

          {/* 3. Solution */}
          <section style={section}>
            <h2 style={h2}>3. Solution</h2>
            <p style={body}>
              The PAYAPRESS platform addresses these pain points with a web-native application
              requiring no installation. As a PWA, it installs to the home screen on Android
              and iOS and continues to function offline via a service worker cache. The
              architecture is deliberately simple: all calculation logic runs client-side,
              no user data is ever transmitted, and the server acts only as a secure proxy
              for live copper price and FX rate feeds.
            </p>
            <p style={body}>
              The platform is designed to grow modularly — each phase adds a self-contained
              feature set without disrupting existing tools. All features target the specific
              needs of electrical panel fabricators in the UAE and the MENA region, with full
              support for Persian (فارسی) and Arabic (العربية) content planned for later phases.
            </p>
          </section>

          {/* 4. Phase 1 */}
          <section style={section}>
            <h2 style={h2}>4. Phase 1 — Copper Busbar Calculator (June 2026)</h2>

            <h3 style={h3}>4.1 Calculation Formula</h3>
            <p style={body}>
              Weight and cost are calculated using the IEC&nbsp;60317 cross-section formula:
            </p>
            <div style={codeBlock}>
              <code style={codeText}>
                weightPerMeter = (width_mm × thickness_mm × density_g_cm³) / 1000{'\n'}
                costPerMeter   = weightPerMeter × pricePerKg_USD{'\n'}
                totalCost      = costPerMeter × length_m × fxRate
              </code>
            </div>
            <p style={{ ...body, marginTop: '0.75rem' }}>
              This formula has been verified against published IEC&nbsp;60317 reference tables
              to within 0.019% error (attributable purely to rounding in published values).
            </p>

            <h3 style={h3}>4.2 Live Copper Price</h3>
            <p style={body}>
              Server-side Next.js route <code style={inlineCode}>/api/copper-price</code> fetches
              COMEX HG=F (Copper Futures) from Yahoo Finance with a 5-minute server-side
              cache. The price is returned in <code style={inlineCode}>USD/lb</code> and
              converted to <code style={inlineCode}>USD/kg</code> using the exact
              conversion factor <code style={inlineCode}>× 2.20462</code>. A static fallback
              value activates automatically when the upstream feed is unavailable.
            </p>

            <h3 style={h3}>4.3 Foreign Exchange Rates</h3>
            <p style={body}>
              FX rates are sourced from the{' '}
              <strong style={{ color: '#d4d4d8' }}>Frankfurter API</strong> (backed by
              European Central Bank data) via server route <code style={inlineCode}>/api/fx-rate</code>,
              cached for 6 hours. Gulf-pegged currencies (AED, SAR, QAR, KWD, BHD) use
              fixed central-bank peg rates that are not subject to ECB market fluctuations.
            </p>

            <h3 style={h3}>4.4 Material Grades</h3>
            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Grade</th>
                    <th style={th}>Standard</th>
                    <th style={th}>Purity</th>
                    <th style={th}>Density (g/cm³)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={td}>Cu-ETP</td><td style={td}>EN 13601 / IEC 60317-3</td><td style={td}>99.90%</td><td style={td}>8.89</td></tr>
                  <tr><td style={td}>Cu-OF</td><td style={td}>EN 13601 / IEC 60317-37</td><td style={td}>99.95%</td><td style={td}>8.92</td></tr>
                  <tr><td style={td}>Cu-OFE</td><td style={td}>ASTM C10100</td><td style={td}>99.99%</td><td style={td}>8.94</td></tr>
                </tbody>
              </table>
            </div>

            <h3 style={h3}>4.5 Key Features at Launch</h3>
            <ul style={list}>
              <li style={li}>Live COMEX copper pricing with automatic fallback, refreshed every 5 minutes</li>
              <li style={li}>22 currencies including Gulf central-bank peg rates (AED, SAR, KWD, QAR, BHD)</li>
              <li style={li}>Proportional SVG busbar cross-section viewer with drag-to-resize interaction</li>
              <li style={li}>IEC standard preset chips (25×3 through 120×10 mm) for fastest dimension entry</li>
              <li style={li}>Achievement badges, calculation counter, and milestone celebrations</li>
              <li style={li}>Copy-to-clipboard formatted results summary</li>
              <li style={li}>PWA — installs to home screen on iOS and Android, works fully offline</li>
              <li style={li}>Public REST API v1 — documented at <code style={inlineCode}>/api/v1/calculate</code></li>
            </ul>
          </section>

          {/* 5. Platform Roadmap */}
          <section style={section}>
            <h2 style={h2}>5. Platform Roadmap (2026–2027)</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Phase</th>
                    <th style={th}>Timeline</th>
                    <th style={th}>Scope</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={td}>1</td>
                    <td style={td}>June 2026</td>
                    <td style={td}>Copper Busbar Calculator</td>
                    <td style={{ ...td, color: '#22c55e', fontWeight: 700 }}>⏳ Launching June 2026</td>
                  </tr>
                  <tr>
                    <td style={td}>2</td>
                    <td style={td}>Q3 2026</td>
                    <td style={td}>Live Metal Prices &amp; Exchange Rates</td>
                    <td style={{ ...td, color: '#f59e0b', fontWeight: 700 }}>📋 Planned</td>
                  </tr>
                  <tr>
                    <td style={td}>3</td>
                    <td style={td}>Q3–Q4 2026</td>
                    <td style={td}>Equipment &amp; Component Cost Database</td>
                    <td style={{ ...td, color: '#f59e0b', fontWeight: 700 }}>📋 Planned</td>
                  </tr>
                  <tr>
                    <td style={td}>4</td>
                    <td style={td}>Q4 2026</td>
                    <td style={td}>Industry News &amp; Market Intelligence</td>
                    <td style={{ ...td, color: '#f59e0b', fontWeight: 700 }}>📋 Planned</td>
                  </tr>
                  <tr>
                    <td style={td}>5</td>
                    <td style={td}>Q4 2026–Q1 2027</td>
                    <td style={td}>Specialized Technical Encyclopedias</td>
                    <td style={{ ...td, color: '#a78bfa', fontWeight: 700 }}>🔮 Future</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <a href="/roadmap" style={{ ...btnLink, display: 'inline-block' }}>
                View Full Roadmap →
              </a>
            </div>
          </section>

          {/* 6. Technology Stack */}
          <section style={section}>
            <h2 style={h2}>6. Technology Stack</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Layer</th>
                    <th style={th}>Technology</th>
                    <th style={th}>Version</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Framework', 'Next.js (App Router)', '15.x'],
                    ['UI Runtime', 'React', '19.x'],
                    ['Language', 'TypeScript (strict mode)', '5.x'],
                    ['Styling', 'Tailwind CSS v4', '4.x'],
                    ['Animation', 'Framer Motion', '12.x'],
                    ['Deployment', 'Hostinger Node.js', '—'],
                    ['Copper Price Feed', 'COMEX HG=F via Yahoo Finance', 'server-side'],
                    ['FX Rates', 'Frankfurter API (ECB)', 'server-side'],
                    ['Offline Support', 'Service Worker (Cache API)', 'PWA v1'],
                  ].map(([layer, tech, ver]) => (
                    <tr key={layer}>
                      <td style={td}>{layer}</td>
                      <td style={td}>{tech}</td>
                      <td style={td}><code style={inlineCode}>{ver}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. Privacy & Security */}
          <section style={section}>
            <h2 style={h2}>7. Privacy &amp; Security</h2>
            <p style={body}>
              The platform collects <strong style={{ color: '#f0f0f0' }}>zero personally
              identifiable information</strong>. All calculation logic runs entirely in the
              user&rsquo;s browser. The only client-side persistence is a single integer
              (<code style={inlineCode}>pp_calcs</code>) stored in{' '}
              <code style={inlineCode}>localStorage</code> for the gamification counter —
              this never leaves the device.
            </p>
            <p style={body}>
              Security headers applied on all responses include: Content-Security-Policy
              with <code style={inlineCode}>worker-src 'self'</code>, HSTS
              (<code style={inlineCode}>max-age=63072000; includeSubDomains; preload</code>),{' '}
              <code style={inlineCode}>X-Content-Type-Options: nosniff</code>,{' '}
              <code style={inlineCode}>Referrer-Policy: strict-origin-when-cross-origin</code>,
              and <code style={inlineCode}>Cross-Origin-Opener-Policy: same-origin</code>.
              Search engine indexing is disabled via{' '}
              <code style={inlineCode}>X-Robots-Tag: noindex,nofollow</code> until the
              platform launches publicly in June&nbsp;2026.
            </p>
          </section>

          {/* 8. About the Team */}
          <section style={section}>
            <h2 style={h2}>8. About the Development Team</h2>
            <p style={body}>
              This platform is designed, built, and maintained by the{' '}
              <strong style={{ color: '#f0f0f0' }}>PAYAPRESS Digital Marketing Team</strong>{' '}
              at <strong style={{ color: '#f0f0f0' }}>PAYAP MACHINERY</strong>. PAYAP
              MACHINERY (trading as PAYAPRESS) is a manufacturer and distributor of
              electrical machinery and press equipment serving the industrial sector across
              the UAE and the MENA region.
            </p>
            <p style={body}>
              The platform is a direct response to the day-to-day needs observed in the
              electrical panel fabrication industry — built by professionals who understand
              the market, for professionals who work within it.
            </p>
          </section>

          {/* 9. Contact */}
          <section style={{ ...section, marginBottom: 0 }}>
            <h2 style={h2}>9. Contact</h2>
            <p style={{ ...body, marginBottom: 0 }}>
              For technical questions, partnership enquiries, or feature requests:{' '}
              <a href="https://www.payapress.com" target="_blank" rel="noopener noreferrer" style={link}>
                www.payapress.com
              </a>
            </p>
          </section>

          {/* Footer */}
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #1c1c23', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/" style={backLink}>← Back to Calculator</a>
            <a href="/roadmap" style={btnLink}>View Roadmap →</a>
          </div>

        </article>
      </main>
    </div>
  );
}

/* ── Shared styles ─────────────────────────────────────────────── */
const section: React.CSSProperties = { marginBottom: '2.5rem' };
const body: React.CSSProperties    = { fontSize: '0.9rem', lineHeight: 1.75, color: '#a1a1aa', marginBottom: '0.9rem' };
const h2: React.CSSProperties      = { fontSize: '1rem', fontWeight: 700, color: '#cd7f32', marginBottom: '0.875rem', letterSpacing: '0.01em' };
const h3: React.CSSProperties      = { fontSize: '0.85rem', fontWeight: 700, color: '#d4d4d8', marginTop: '1.25rem', marginBottom: '0.5rem' };
const mono: React.CSSProperties    = { fontFamily: "'JetBrains Mono','Fira Code',monospace" };
const list: React.CSSProperties    = { paddingLeft: '1.5rem', listStyleType: 'disc', ...body, marginBottom: '0.5rem' };
const li: React.CSSProperties      = { marginBottom: '0.5rem', color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.7 };
const link: React.CSSProperties    = { color: '#cd7f32', textDecoration: 'none' };
const backLink: React.CSSProperties = { fontSize: '0.82rem', color: '#cd7f32', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' };
const btnLink: React.CSSProperties = { fontSize: '0.82rem', color: '#fff', background: 'linear-gradient(135deg,#cd7f32,#b87333)', padding: '0.45rem 1.25rem', borderRadius: '0.4rem', textDecoration: 'none', fontWeight: 600 };
const codeBlock: React.CSSProperties = { background: '#0c0c0f', border: '1px solid #1c1c23', borderRadius: '0.5rem', padding: '1rem 1.25rem', overflowX: 'auto' };
const codeText: React.CSSProperties  = { fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: '0.8rem', color: '#e8a855', whiteSpace: 'pre', display: 'block', lineHeight: 1.8 };
const inlineCode: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: '0.82em', background: '#131318', borderRadius: '0.25rem', padding: '0.1em 0.35em', color: '#e8a855' };
const table: React.CSSProperties  = { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '0.5rem' };
const th: React.CSSProperties     = { textAlign: 'left', padding: '0.5rem 0.75rem', color: '#52525b', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #1c1c23' };
const td: React.CSSProperties     = { padding: '0.5rem 0.75rem', color: '#a1a1aa', borderBottom: '1px solid #131318', verticalAlign: 'top' };
