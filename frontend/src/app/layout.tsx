import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

const BASE_URL = 'https://guileless-torrone-f24c5e.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default:  'PAYAPRESS — Copper Busbar Cost Calculator',
    template: '%s | PAYAPRESS',
  },
  description:
    'Professional real-time copper busbar cost calculator for electrical panel fabricators. ' +
    'Live COMEX pricing, manual dimension inputs, 22 currencies, IEC/DIN standards.',
  keywords: [
    'copper busbar', 'cost calculator', 'electrical panel', 'IEC 60317',
    'Cu-ETP', 'live copper price', 'COMEX', 'busbar weight',
    'شینه مسی', 'قیمت شینه مسی', 'محاسبه قیمت مس',
  ],
  authors:   [{ name: 'PAYAP MACHINERY', url: 'https://www.payapress.com' }],
  creator:   'PAYAP MACHINERY',
  publisher: 'PAYAPRESS',

  robots: {
    index:    true,
    follow:   true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:          BASE_URL,
    siteName:    'PAYAPRESS PRO',
    title:       'PAYAPRESS — Copper Busbar Cost Calculator',
    description: 'Live COMEX copper pricing · manual dimension inputs · 22 currencies · IEC/DIN standards.',
    images: [
      {
        url:    '/og-image.png',
        width:   1200,
        height:  630,
        alt:    'PAYAPRESS Copper Busbar Cost Calculator',
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'PAYAPRESS — Copper Busbar Cost Calculator',
    description: 'Live COMEX copper pricing · 22 currencies · IEC/DIN standards.',
    images:      ['/og-image.png'],
    creator:     '@payapress',
  },

  icons: {
    icon:    [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple:    '/favicon.svg',
  },

  manifest: '/manifest.json',

  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  width:         'device-width',
  initialScale:   1,
  themeColor:    '#cd7f32',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
