import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import { FxSwipeApp } from '@/components/figma/FxSwipeApp';
import { FxDesktopLanding } from '@/components/figma/FxDesktopLanding';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { fetchCopperPrice, fetchAluminumPrice, fetchFxRates } from '@/lib/serverPrices';

const BASE_URL = SITE_URL;

// ── Primary SEO target ────────────────────────────────────────────
// Keywords: "busbar calculator" · "busbar sizing calculator" ·
// "busbar price calculator"
export const metadata: Metadata = {
  title: {
    absolute: 'Busbar Calculator — Free Busbar Sizing & Price Calculator',
  },
  description:
    'Free online busbar calculator for copper & aluminum. Busbar sizing to IEC ' +
    'standards plus live price calculation — weight, ampacity and cost in 17 ' +
    'currencies with real-time COMEX/LME rates.',
  keywords: [
    'busbar calculator', 'busbar sizing calculator', 'busbar price calculator',
    'copper busbar calculator', 'aluminum busbar calculator', 'busbar ampacity',
    'busbar weight calculator', 'busbar cross section', 'IEC busbar sizing',
    'live copper price', 'COMEX', 'LME',
  ],
  alternates: { canonical: '/busbar-calculator' },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/busbar-calculator`,
    title: 'Busbar Calculator — Free Busbar Sizing & Price Calculator',
    description:
      'Size copper & aluminum busbars to IEC standards and price them live. ' +
      'Weight, ampacity and cost in 17 currencies — free, no sign-up needed.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Busbar Calculator — Free Busbar Sizing & Price Calculator',
    description:
      'Size copper & aluminum busbars to IEC standards and price them live in 17 currencies.',
  },
};

// Structured data — Organization + WebSite + WebApplication + Breadcrumb +
// HowTo (mirrors the visible "How It Works" section). No fabricated ratings.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Busbar Calculator',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@calculator.payapress.com',
        contactType: 'customer support',
        availableLanguage: ['en'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Busbar Calculator',
      alternateName: 'Busbar Calculator',
      publisher: { '@id': `${BASE_URL}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'WebApplication',
      '@id': `${BASE_URL}/busbar-calculator#app`,
      name: 'Busbar Calculator',
      alternateName: ['Busbar Sizing Calculator', 'Busbar Price Calculator'],
      url: `${BASE_URL}/busbar-calculator`,
      description:
        'Free online busbar calculator: size copper and aluminum busbars to IEC ' +
        'standards and calculate live prices — weight, ampacity and cost in 17 currencies.',
      applicationCategory: 'EngineeringApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      image: `${BASE_URL}/opengraph-image`,
      screenshot: `${BASE_URL}/opengraph-image`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Copper & aluminum busbar sizing (IEC cross-sections)',
        'Live COMEX copper and LME aluminum pricing',
        'Weight, ampacity and total cost calculation',
        '17 currencies with live FX rates',
        'Historical price chart up to 1 year',
        'Configuration compare, saved history and waste (kerf/punch) calculator',
      ],
      publisher: { '@id': `${BASE_URL}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Busbar Calculator', item: `${BASE_URL}/busbar-calculator` },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to size and price a busbar',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Select Material',
          text: 'Choose Copper or Aluminum based on your project requirements.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Enter Electrical Parameters',
          text: 'Input length, width, thickness, material grade and currency.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Get Instant Results',
          text: 'Receive busbar weight, ampacity and live price calculations instantly.',
        },
      ],
    },
  ],
};

export default async function CalculatorPage() {
  const [copper, aluminum, fx] = await Promise.allSettled([
    fetchCopperPrice(),
    fetchAluminumPrice(),
    fetchFxRates(),
  ]);

  const copperVal   = copper.status   === 'fulfilled' ? copper.value   : null;
  const aluminumVal = aluminum.status === 'fulfilled' ? aluminum.value : null;

  const initialData = {
    copper:   copperVal,
    aluminum: aluminumVal,
    fx:       fx.status === 'fulfilled' ? fx.value : null,
  };

  return (
    <SectionErrorBoundary>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* Desktop-only landing (Figma page 114:299) — hidden below 1024px */}
      <FxDesktopLanding />
      <div id="fx-app-anchor">
        <FxSwipeApp
          initialData={initialData}
          copperPrice={copperVal?.pricePerKg ?? null}
          aluminumPrice={aluminumVal?.pricePerKg ?? null}
        />
      </div>
    </SectionErrorBoundary>
  );
}
