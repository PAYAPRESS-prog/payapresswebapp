import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import Link from 'next/link';
import { DownloadButtons } from '@/components/DownloadButtons';
import { FxFooter } from '@/components/figma/FxFooter';

const BASE_URL = SITE_URL;
const REPO = 'https://github.com/PAYAPRESS-prog/payapresswebapp';

// Target keywords: "busbar calculator download", "busbar calculator windows",
// "busbar calculator android app", "busbar calculator ios".
export const metadata: Metadata = {
  title: { absolute: 'Download Busbar Calculator — Windows, Android & iOS App' },
  description:
    'Get the official Busbar Calculator apps: live copper & aluminum prices, ' +
    'busbar sizing, waste and EPLAN panel costs. Windows 10/11 installer, ' +
    'Android APK and the iPhone app — free.',
  keywords: [
    'busbar calculator download', 'busbar calculator windows',
    'busbar calculator android app', 'busbar calculator apk',
    'busbar calculator ios', 'busbar calculator iphone app',
    'busbar calculator desktop app', 'copper price app',
    'busbar software free download',
  ],
  alternates: { canonical: '/download' },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/download`,
    title: 'Download Busbar Calculator — Windows, Android & iOS App',
    description: 'The official apps — live busbar prices on Windows 10/11, Android and iPhone.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download Busbar Calculator — Windows, Android & iOS App',
    description: 'Live copper & aluminum busbar prices as native Windows, Android and iOS apps. Free.',
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Busbar Calculator for Windows',
      operatingSystem: 'Windows 10, Windows 11',
      applicationCategory: 'EngineeringApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: `${BASE_URL}/download`,
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Busbar Calculator for Android',
      operatingSystem: 'Android 7.0+',
      applicationCategory: 'EngineeringApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: `${BASE_URL}/download`,
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Busbar Calculator for iPhone & iPad',
      operatingSystem: 'iOS 15+',
      applicationCategory: 'EngineeringApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: `${BASE_URL}/download`,
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Busbar Calculator', item: `${BASE_URL}/busbar-calculator` },
        { '@type': 'ListItem', position: 3, name: 'Download — Windows & Android', item: `${BASE_URL}/download` },
      ],
    },
  ],
};

export default function DownloadPage() {
  return (
    <>
    <main className="dlw">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <Link href="/busbar-calculator" className="pnl-back">← Busbar Calculator</Link>

      <section className="dlw-hero">
        <div className="dlw-copy">
          <h1>Busbar Calculator<br />for <span>Windows, Android &amp; iOS</span></h1>
          <p>
            Live copper &amp; aluminum prices, busbar sizing, waste and EPLAN panel
            costs — as real apps. Always up to date, nothing to configure.
          </p>
          <DownloadButtons repo={REPO} />
          <p className="dlw-req">
            Windows 10 (1803+) &amp; 11 · x64 &amp; ARM64 · Android 7.0+ ·
            iOS 15+ · small download · Free
          </p>
        </div>
        <div className="dlw-mascot" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mr-busbar.png" alt="" width={150} height={431} />
        </div>
      </section>

      <section className="dlw-steps">
        <h2>Install on Windows</h2>
        <ol>
          <li><b>Download</b> the setup file above.</li>
          <li>
            <b>Run it.</b> If Windows SmartScreen appears (we&apos;re a new
            publisher), click <em>More info → Run anyway</em> — every build is
            open-source with published SHA-256 checksums.
          </li>
          <li><b>Launch</b> from the Start menu — pin it to the taskbar for one-click quotes.</li>
        </ol>
      </section>

      <section className="dlw-steps">
        <h2>Install on Android</h2>
        <ol>
          <li><b>Download</b> the APK above on your phone.</li>
          <li>
            <b>Open it.</b> Android asks once to allow installs from your
            browser (&quot;Install unknown apps&quot;) — that prompt disappears
            when the Google Play listing goes live.
          </li>
          <li><b>Launch</b> Busbar Calculator from your home screen — sign-in,
            history and saved panels are the same as on the web.</li>
        </ol>
      </section>

      <section className="dlw-steps">
        <h2>Install on iPhone &amp; iPad</h2>
        <ol>
          <li><b>TestFlight first:</b> during the beta, the button above joins
            the TestFlight test — install Apple&apos;s TestFlight app, tap the
            link, done.</li>
          <li><b>App Store:</b> once approved, the same button becomes a direct
            App Store download.</li>
          <li><b>Sign in</b> with Apple, email or your existing account —
            history and saved panels sync everywhere.</li>
        </ol>
      </section>

      <section className="dlw-faq">
        <h2>Good to know</h2>
        <p>
          Both apps are lightweight native shells around the live product, so every
          improvement we ship appears instantly — no updates to babysit. Your
          account, history and saved panels are the same everywhere. Checksums and
          all releases live on <a href={`${REPO}/releases`} target="_blank" rel="noopener noreferrer">GitHub Releases ↗</a>.
        </p>
      </section>
    </main>
    <div className="fx-dl-footer-wrap">
      <FxFooter />
    </div>
    </>
  );
}
