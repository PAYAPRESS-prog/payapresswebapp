import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://payapress.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default:  'Busbar Calculator — PAYAPRESS',
    template: '%s | Busbar Calculator',
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

  // Indexing disabled until launch — update to index:true when ready
  robots: {
    index:    false,
    follow:   false,
    googleBot: { index: false, follow: false },
  },

  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:          BASE_URL,
    siteName:    'Busbar Calculator',
    title:       'Busbar Calculator — PAYAPRESS',
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
    title:       'Busbar Calculator — PAYAPRESS',
    description: 'Live COMEX copper pricing · 22 currencies · IEC/DIN standards.',
    images:      ['/og-image.png'],
    creator:     '@payapress',
  },

  icons: {
    icon:    [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple:   [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    other:   [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#cd7f32' },
    ],
  },

  // App Store / PWA
  appLinks: {},
  appleWebApp: {
    capable: true,
    title: 'Busbar Calc',
    statusBarStyle: 'black-translucent',
    startupImage: [],
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
      <body>
        {children}
        {/* Register service worker for PWA / offline support */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(){});
            });
          }
        `}</Script>
      </body>
    </html>
  );
}
