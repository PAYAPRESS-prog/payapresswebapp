import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import Link from 'next/link';
import { PanelCostTool } from '@/components/panel/PanelCostTool';
import { FxFooter } from '@/components/figma/FxFooter';
import { fetchCopperPrice, fetchAluminumPrice } from '@/lib/serverPrices';

const BASE_URL = SITE_URL;

// Public SEO landing — EPLAN import → net panel busbar cost.
export const metadata: Metadata = {
  title: { absolute: 'Electrical Panel Busbar Cost Calculator — EPLAN Import, Waste & Live Prices' },
  description:
    'Free electrical panel busbar cost calculator: import your EPLAN copper parts list, ' +
    'subtract kerf, offcut and punch-out waste, and price the busbar at live copper & aluminum rates.',
  keywords: [
    'electrical panel busbar cost calculator', 'EPLAN busbar export', 'panel copper cost',
    'EPLAN copper parts list', 'busbar BOM calculator', 'switchgear copper calculator',
  ],
  alternates: { canonical: '/electrical-panel-busbar-cost-calculator' },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/electrical-panel-busbar-cost-calculator`,
    title: 'Electrical Panel Busbar Cost Calculator — EPLAN Import',
    description:
      'Import an EPLAN busbar list, subtract cutting waste, and get the panel copper cost at live market prices.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Electrical Panel Busbar Cost Calculator — EPLAN Import',
    description:
      'Import an EPLAN busbar list, subtract cutting waste, and get the panel copper cost at live market prices.',
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${BASE_URL}/electrical-panel-busbar-cost-calculator#app`,
      name: 'Electrical Panel Busbar Cost Calculator',
      url: `${BASE_URL}/electrical-panel-busbar-cost-calculator`,
      description:
        'Imports an EPLAN copper parts list, computes total busbar used in an electrical panel, subtracts kerf, offcut and punch-out waste, and prices the result at live copper and aluminum rates.',
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
        { '@type': 'ListItem', position: 3, name: 'Panel Cost Calculator', item: `${BASE_URL}/electrical-panel-busbar-cost-calculator` },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to calculate electrical panel busbar cost from an EPLAN export',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Import', text: 'Export the copper parts list from EPLAN Pro Panel or Electric P8 as CSV and drop it in — parsing happens in your browser only.' },
        { '@type': 'HowToStep', position: 2, name: 'Map columns', text: 'German and English EPLAN headers (Menge, Breite, Höhe, Länge…) are detected automatically and can be corrected.' },
        { '@type': 'HowToStep', position: 3, name: 'Review and set waste', text: 'Check the parsed pieces, then set stock bar length, blade diameter, punch-outs and extra scrap.' },
        { '@type': 'HowToStep', position: 4, name: 'Read the cost', text: 'Net weight, waste breakdown and total cost are priced at live copper or aluminum market rates.' },
      ],
    },
  ],
};

export default async function PanelCostLanding() {
  const [copper, aluminum] = await Promise.allSettled([
    fetchCopperPrice(),
    fetchAluminumPrice(),
  ]);
  return (
    <>
    <main className="pnl-page pnl-page-public">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <div className="pnl-backrow">
        <Link href="/busbar-calculator" className="pnl-back">← Busbar Calculator</Link>
        <Link href="/app" className="pnl-back">☰ Menu</Link>
      </div>
      <h1 className="pnl-page-title">Electrical Panel Busbar Cost Calculator</h1>
      <p className="pnl-page-sub">
        Import the busbar list straight from <b>EPLAN</b>, subtract cutting waste
        and offcuts, and see what the copper in your panel really costs — at live
        market prices. Your file is parsed in the browser and never uploaded.
      </p>

      <PanelCostTool
        copperPricePerKg={copper.status === 'fulfilled' ? copper.value.pricePerKg : null}
        aluminumPricePerKg={aluminum.status === 'fulfilled' ? aluminum.value.pricePerKg : null}
      />

      <section className="pnl-seo">
        <h2>From EPLAN parts list to a priced panel in one minute</h2>
        <p>
          EPLAN Pro Panel and Electric P8 export the busbar bill of materials with
          German or English headers — Menge, Breite, Höhe, Länge or Quantity, Width,
          Thickness, Length. This tool reads either, groups the pieces by
          cross-section and packs them into stock bars to find the real offcut scrap.
        </p>
        <h2>Waste is where panel budgets die</h2>
        <p>
          Every saw cut eats a kerf (estimated at 1.5% of the blade diameter, never
          below 0.5&nbsp;mm), every punched hole removes a slug, and every stock bar
          leaves an unusable end. All three are computed separately, weighed with the
          exact alloy density and priced — so quotes include the metal you buy, not
          just the metal you ship. Also try the{' '}
          <Link href="/busbar-waste-calculator">single-cut waste calculator</Link> and
          the <Link href="/busbar-calculator">live busbar price calculator</Link>.
        </p>
      </section>
    </main>
    <div className="fx-dl-footer-wrap">
      <FxFooter
        copperPrice={copper.status === 'fulfilled' ? copper.value.pricePerKg : null}
        aluminumPrice={aluminum.status === 'fulfilled' ? aluminum.value.pricePerKg : null}
      />
    </div>
    </>
  );
}
