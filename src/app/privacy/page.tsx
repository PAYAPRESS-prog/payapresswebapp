import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Privacy Policy',
  description: 'Privacy policy for Busbar Calculator Copper Busbar Cost Calculator.',
};

export default function PrivacyPage() {
  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#060608',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#d4d4d8',
        padding: '2rem 1.5rem 4rem',
      }}
    >
      <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: '2rem',
            color: '#cd7f32',
            textDecoration: 'none',
            fontSize: '0.85rem',
          }}
        >
          ← Back to Calculator
        </Link>

        <h1
          style={{
            fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
            fontWeight: 900,
            color: '#f0f0f0',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: '#52525b', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Last updated: 5 July 2026 &nbsp;·&nbsp; Effective immediately
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>1. Overview</h2>
          <p style={pStyle}>
            Busbar Calculator (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the Busbar Calculator
            Copper Busbar Cost Calculator web application and its associated Progressive Web App
            (PWA). We are committed to protecting your privacy. This policy explains what information
            is collected and how it is used.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>2. Information We Collect</h2>
          <p style={pStyle}>
            <strong style={{ color: '#f0f0f0' }}>We do not collect, store, or transmit any
            personally identifiable information.</strong> All calculation inputs (busbar dimensions,
            currency preferences, material grade) are processed entirely in your browser and are
            never sent to our servers.
          </p>
          <p style={{ ...pStyle, marginTop: '0.75rem' }}>
            The only data stored locally on your device is:
          </p>
          <ul style={{ ...pStyle, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <code style={codeStyle}>pp_calcs</code> — a simple integer counter stored in
              <code style={codeStyle}> localStorage</code> that tracks how many calculations you have
              performed (used for gamification milestones). This data never leaves your device.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>3. Third-Party Services</h2>
          <p style={pStyle}>
            Our server-side API routes fetch data from the following third-party services. These
            requests originate from <strong style={{ color: '#f0f0f0' }}>our server</strong>, not
            from your device:
          </p>
          <ul style={{ ...pStyle, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong style={{ color: '#f0f0f0' }}>Yahoo Finance</strong> (finance.yahoo.com) — live
              COMEX copper price (HG=F). No personal data is transmitted.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong style={{ color: '#f0f0f0' }}>Frankfurter API</strong> (api.frankfurter.app) —
              live foreign-exchange rates sourced from the European Central Bank. No personal data
              is transmitted.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong style={{ color: '#f0f0f0' }}>FlagCDN</strong> (flagcdn.com) — flag images for
              the currency selector. Your browser fetches flag images directly from flagcdn.com; no
              personal data is included in these requests.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>4. Cookies</h2>
          <p style={pStyle}>
            We do not use cookies, tracking pixels, or any cross-site tracking technology.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>5. Analytics</h2>
          <p style={pStyle}>
            We do not use any analytics or telemetry service (no Google Analytics, no Mixpanel,
            no similar tools).
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>6. Children&rsquo;s Privacy</h2>
          <p style={pStyle}>
            This application is a professional industrial tool. We do not knowingly collect any
            information from children under 13 years of age.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>7. Account Deletion &amp; Data Retention</h2>
          <p style={pStyle}>
            You can permanently delete your account at any time from your profile page.
            Deleting your account removes your profile information, saved calculation
            history and email subscriptions from our active systems.
          </p>
          <p style={pStyle}>
            After deletion, we may retain a minimal record (such as the account email
            address, registration and deletion dates, and basic technical metadata)
            for fraud prevention, security auditing, support and compliance with legal
            obligations. These records are not used for marketing and are kept only as
            long as necessary for those purposes.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>8. Changes to This Policy</h2>
          <p style={pStyle}>
            We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date
            at the top of this page will reflect any changes. Continued use of the application
            after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>9. Contact</h2>
          <p style={pStyle}>
            For privacy-related questions, please contact us at:
          </p>
          <p style={{ ...pStyle, marginTop: '0.5rem' }}>
            <strong style={{ color: '#f0f0f0' }}>Busbar Calculator</strong> (trading as Busbar Calculator)
            <br />
            Website:{' '}
            <a href="https://www.payapress.com" style={{ color: '#cd7f32' }}>
              www.payapress.com
            </a>
          </p>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #1c1c23', margin: '2.5rem 0 1.5rem' }} />

        <p style={{ color: '#3f3f46', fontSize: '0.75rem' }}>
          © 2025 Busbar Calculator · Trading as Busbar Calculator
        </p>
      </div>
    </div>
  );
}

const h2Style: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: '#cd7f32',
  marginBottom: '0.6rem',
  letterSpacing: '0.01em',
};

const pStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  lineHeight: 1.7,
  color: '#a1a1aa',
};

const codeStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: '0.82em',
  background: '#131318',
  borderRadius: '0.25rem',
  padding: '0.1em 0.35em',
  color: '#e8a855',
};
