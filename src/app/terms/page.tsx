import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use and Intellectual Property Notice for the Busbar Calculator platform.',
};

const h2Style: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: '#cd7f32',
  marginBottom: '0.6rem',
  letterSpacing: '0.01em',
};

const pStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  lineHeight: 1.75,
  color: '#a1a1aa',
};

const listStyle: React.CSSProperties = {
  ...pStyle,
  paddingLeft: '1.5rem',
  listStyleType: 'disc',
};

export default function TermsPage() {
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
          Terms of Use
        </h1>
        <p style={{ color: '#52525b', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Last updated: June 2025 &nbsp;·&nbsp; Effective immediately
        </p>

        {/* 1 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>1. Ownership</h2>
          <p style={pStyle}>
            This platform — including all source code, algorithms, calculation methodologies,
            user interface designs, visual assets, database schemas, API structures, and all
            associated materials — is the exclusive proprietary property of{' '}
            <strong style={{ color: '#f0f0f0' }}>PAYAP MACHINERY</strong> (trading as{' '}
            <strong style={{ color: '#f0f0f0' }}>PAYAPRESS</strong>). All intellectual property
            rights are reserved. No ownership rights are transferred to you through your use
            of this platform.
          </p>
        </section>

        {/* 2 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>2. License to Use</h2>
          <p style={pStyle}>
            Subject to these Terms, PAYAP MACHINERY grants you a limited, non-exclusive,
            non-transferable, revocable license to access and use this platform solely for
            your personal or internal professional purposes. This license does not include
            the right to:
          </p>
          <ul style={{ ...listStyle, marginTop: '0.75rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>reproduce, copy, or duplicate any part of the platform;</li>
            <li style={{ marginBottom: '0.4rem' }}>sell, resell, or commercially exploit any part of the platform;</li>
            <li style={{ marginBottom: '0.4rem' }}>
              reverse engineer, decompile, disassemble, or attempt to derive the source code,
              algorithms, or underlying methodology;
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              create derivative works, competing products, or substantially similar services;
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              scrape, crawl, or systematically extract data from the platform;
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              use the platform for training, fine-tuning, or developing artificial intelligence
              or machine learning models.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>3. Intellectual Property</h2>
          <p style={pStyle}>
            All intellectual property on this platform — including but not limited to copyrights,
            trademarks, trade secrets, patents, design rights, and know-how — is owned exclusively
            by PAYAP MACHINERY. The busbar cost calculation methodology, pricing algorithms,
            currency conversion processes, and all associated business logic are proprietary and
            constitute protected trade secrets.
          </p>
          <p style={{ ...pStyle, marginTop: '0.75rem' }}>
            You may not challenge or contest PAYAP MACHINERY&rsquo;s ownership of any intellectual
            property rights in this platform.
          </p>
        </section>

        {/* 4 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>4. Prohibited Uses</h2>
          <p style={pStyle}>You agree not to:</p>
          <ul style={{ ...listStyle, marginTop: '0.75rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>use the platform for any unlawful purpose;</li>
            <li style={{ marginBottom: '0.4rem' }}>
              circumvent, disable, or interfere with security-related features of the platform;
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              transmit any automated requests (bots, scrapers, or crawlers) without prior
              written permission;
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              impersonate or misrepresent your affiliation with any person or entity;
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              use the platform in any way that could damage, disable, overburden, or impair it.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>5. Accuracy of Calculations</h2>
          <p style={pStyle}>
            All price calculations are provided for informational purposes only, based on live
            market data (COMEX, ECB) fetched at the time of the request. Prices may vary.
            PAYAP MACHINERY makes no warranty as to the accuracy, completeness, or fitness
            for purpose of any calculation. You assume sole responsibility for any decisions
            made based on information provided by this platform.
          </p>
        </section>

        {/* 6 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>6. Disclaimer of Warranties</h2>
          <p style={pStyle}>
            This platform is provided &ldquo;as is&rdquo; without warranty of any kind, express or
            implied, including but not limited to warranties of merchantability, fitness for a
            particular purpose, or non-infringement. PAYAP MACHINERY does not warrant that the
            platform will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
        </section>

        {/* 7 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>7. Limitation of Liability</h2>
          <p style={pStyle}>
            To the maximum extent permitted by applicable law, PAYAP MACHINERY shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages
            arising out of or relating to your use of this platform, even if advised of the
            possibility of such damages.
          </p>
        </section>

        {/* 8 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>8. Governing Law</h2>
          <p style={pStyle}>
            These Terms are governed by and construed in accordance with applicable law.
            Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
            of the competent courts. PAYAP MACHINERY reserves the right to seek injunctive or
            other equitable relief in any jurisdiction to protect its intellectual property rights.
          </p>
        </section>

        {/* 9 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>9. Changes to These Terms</h2>
          <p style={pStyle}>
            We may update these Terms at any time. The &ldquo;Last updated&rdquo; date at the top
            of this page reflects the most recent revision. Continued use of the platform following
            any changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        {/* 10 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={h2Style}>10. Contact</h2>
          <p style={pStyle}>
            For legal inquiries, licensing requests, or intellectual property matters:
          </p>
          <p style={{ ...pStyle, marginTop: '0.5rem' }}>
            <strong style={{ color: '#f0f0f0' }}>PAYAP MACHINERY</strong> (trading as PAYAPRESS)
            <br />
            Email:{' '}
            <a href="mailto:info@payapress.com" style={{ color: '#cd7f32' }}>
              info@payapress.com
            </a>
            <br />
            Website:{' '}
            <a href="https://www.payapress.com" style={{ color: '#cd7f32' }}>
              www.payapress.com
            </a>
          </p>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #1c1c23', margin: '2.5rem 0 1.5rem' }} />

        <p style={{ color: '#3f3f46', fontSize: '0.75rem' }}>
          © 2025 PAYAP MACHINERY · Trading as PAYAPRESS · All Rights Reserved
        </p>
      </div>
    </div>
  );
}
