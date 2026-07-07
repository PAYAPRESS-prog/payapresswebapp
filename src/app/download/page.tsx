import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import Link from 'next/link';
import { DownloadButtons } from '@/components/DownloadButtons';

const BASE_URL = SITE_URL;
const REPO = 'https://github.com/PAYAPRESS-prog/payapresswebapp';
const DL = `${REPO}/releases/latest/download`;

// Target keywords: "busbar calculator download", "busbar calculator windows".
export const metadata: Metadata = {
  title: { absolute: 'Download Busbar Calculator for Windows — Free Desktop App' },
  description:
    'Get the official Busbar Calculator Windows app: live copper & aluminum prices, ' +
    'busbar sizing, waste and EPLAN panel costs on your desktop. Windows 10 & 11, ~8 MB.',
  keywords: [
    'busbar calculator download', 'busbar calculator windows',
    'busbar calculator desktop app', 'copper price desktop app',
    'busbar software free download',
  ],
  alternates: { canonical: '/download' },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/download`,
    title: 'Download Busbar Calculator for Windows — Free Desktop App',
    description: 'The official desktop app — live busbar prices on Windows 10 & 11.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download Busbar Calculator for Windows — Free Desktop App',
    description: 'Live copper & aluminum busbar prices as a native Windows 10/11 app. Free, ~8 MB.',
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
      downloadUrl: `${DL}/Busbar-Calculator-Setup-x64.exe`,
      url: `${BASE_URL}/download`,
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Busbar Calculator', item: `${BASE_URL}/busbar-calculator` },
        { '@type': 'ListItem', position: 3, name: 'Download for Windows', item: `${BASE_URL}/download` },
      ],
    },
  ],
};

export default function DownloadPage() {
  return (
    <main className="dlw">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <Link href="/busbar-calculator" className="pnl-back">← Busbar Calculator</Link>

      <section className="dlw-hero">
        <div className="dlw-copy">
          <h1>Busbar Calculator<br />for <span>Windows</span></h1>
          <p>
            Live copper &amp; aluminum prices, busbar sizing, waste and EPLAN panel
            costs — as a real desktop app. Always up to date, nothing to configure.
          </p>
          <DownloadButtons dlBase={DL} repo={REPO} />
          <p className="dlw-req">
            Windows 10 (1803+) &amp; Windows 11 · x64 &amp; ARM64 · ~8 MB ·
            WebView2 installs automatically · Free
          </p>
        </div>
        <div className="dlw-mascot" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mr-busbar.png" alt="" width={150} height={431} />
        </div>
      </section>

      <section className="dlw-steps">
        <h2>Install in three steps</h2>
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

      <section className="dlw-faq">
        <h2>Good to know</h2>
        <p>
          The app is a lightweight native shell around the live product, so every
          improvement we ship appears instantly — no updates to babysit. Your
          account, history and saved panels are the same everywhere. Checksums and
          all releases live on <a href={`${REPO}/releases`} target="_blank" rel="noopener noreferrer">GitHub Releases ↗</a>.
        </p>
      </section>
    </main>
  );
}
