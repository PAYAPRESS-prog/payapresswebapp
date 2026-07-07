import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import Link from 'next/link';
import { FxFooter } from '@/components/figma/FxFooter';

const BASE_URL = SITE_URL;

// Public SEO landing for the (account-gated) waste calculator.
// Target keywords: busbar waste calculator, kerf calculator, punch-out waste.
export const metadata: Metadata = {
  title: { absolute: 'Busbar Waste Calculator — Kerf & Punch-Out Loss Calculator' },
  description:
    'Free busbar waste calculator: estimate blade kerf loss per cut and punch-out ' +
    'material waste for copper & aluminum busbars — in kilograms and live market cost.',
  keywords: [
    'busbar waste calculator', 'kerf calculator', 'blade kerf loss',
    'punch-out waste', 'copper waste calculator', 'busbar scrap cost',
  ],
  alternates: { canonical: '/busbar-waste-calculator' },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/busbar-waste-calculator`,
    title: 'Busbar Waste Calculator — Kerf & Punch-Out Loss',
    description:
      'Estimate blade kerf and punch-out waste for copper & aluminum busbars, priced at live market rates.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Busbar Waste Calculator — Kerf & Punch-Out Loss',
    description:
      'Estimate blade kerf and punch-out waste for copper & aluminum busbars, priced at live market rates.',
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${BASE_URL}/busbar-waste-calculator#app`,
      name: 'Busbar Waste Calculator',
      url: `${BASE_URL}/busbar-waste-calculator`,
      description:
        'Calculates blade kerf loss per cut and punch-out material waste for copper and aluminum busbars, in kg and live market cost.',
      applicationCategory: 'EngineeringApplication',
      operatingSystem: 'Any (web browser)',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@id': `${BASE_URL}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Busbar Calculator', item: `${BASE_URL}/busbar-calculator` },
        { '@type': 'ListItem', position: 3, name: 'Waste Calculator', item: `${BASE_URL}/busbar-waste-calculator` },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to calculate busbar cutting and punching waste',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Enter the cross-section', text: 'Set the busbar width and thickness in millimeters.' },
        { '@type': 'HowToStep', position: 2, name: 'Blade kerf', text: 'Enter the saw blade diameter — kerf width is estimated at 1.5% of the diameter (minimum 0.5 mm) and converted to lost material per cut.' },
        { '@type': 'HowToStep', position: 3, name: 'Punch-out', text: 'Enter the punch diameter — the removed slug volume is computed from the hole area times the busbar thickness.' },
        { '@type': 'HowToStep', position: 4, name: 'Read the cost', text: 'Waste is shown in kilograms and priced at the live copper or aluminum market rate.' },
      ],
    },
  ],
};

export default function WasteLandingPage() {
  return (
    <>
    <main className="fx-wl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <h1 className="fx-wl-title">Busbar Waste Calculator</h1>
      <p className="fx-wl-sub">
        Every saw cut and every punched hole throws away metal. This free tool tells
        you exactly how much — in kilograms and in money, at live copper &amp;
        aluminum prices.
      </p>

      <h2 className="fx-wl-h2">Blade kerf loss per cut</h2>
      <p className="fx-wl-p">
        The kerf — the slot a saw blade eats — is estimated at 1.5% of the blade
        diameter (never less than 0.5&nbsp;mm), multiplied by your busbar
        cross-section. A 300&nbsp;mm blade on a 100×10&nbsp;mm copper bar wastes
        roughly 40&nbsp;grams of copper on every single cut.
      </p>

      <h2 className="fx-wl-h2">Punch-out waste</h2>
      <p className="fx-wl-p">
        Every punched hole removes a slug of metal: hole area × busbar thickness.
        The calculator converts it to weight with the exact alloy density and
        prices it at the live market rate — so you can quote scrap loss honestly.
      </p>

      <h2 className="fx-wl-h2">Try it now</h2>
      <p className="fx-wl-p">
        The waste calculator is part of the free Busbar Calculator — create an
        account (10 seconds) and it unlocks together with saved history and
        configuration compare.
      </p>

      <div className="fx-wl-cta-row">
        <Link href="/busbar-calculator" className="fx-wl-cta">Open Busbar Calculator</Link>
        <Link href="/app/waste" className="fx-wl-cta-ghost">Go to Waste Calculator</Link>
      </div>
      <p className="fx-wl-p">
        Building a whole panel?{' '}
        <Link href="/electrical-panel-busbar-cost-calculator">
          Try the EPLAN panel cost calculator →
        </Link>
      </p>
    </main>
    <div className="fx-dl-footer-wrap">
      <FxFooter />
    </div>
    </>
  );
}
