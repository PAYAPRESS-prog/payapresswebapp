import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import SplashScreen from '@/components/SplashScreen';
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
  minimumScale:   1,
  viewportFit:   'cover',
  themeColor:    '#cd7f32',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#060608' }} suppressHydrationWarning>
      {/* Tell browsers and CDNs never to cache HTML pages */}
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      {/* Critical inline styles — dark background guaranteed even if CSS bundle fails to load */}
      <style dangerouslySetInnerHTML={{ __html:
        'html,body{background:#060608!important;color:#f0f0f0;margin:0;padding:0;' +
        'font-family:ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}' +
        '*{box-sizing:border-box}'
      }} />
      <body style={{ background: '#060608' }}>
        <SplashScreen />
        {children}
        {/* Global error capture — shows error on screen even if React can't mount */}
        <Script id="err-capture" strategy="beforeInteractive">{`
          window.__pp_errs = [];
          var __pp_errDiv = null;
          function __pp_showErr(msg) {
            try {
              if (!__pp_errDiv) {
                __pp_errDiv = document.createElement('div');
                __pp_errDiv.setAttribute('style',
                  'position:fixed;top:0;left:0;right:0;z-index:99999;' +
                  'background:#1a0000;border-bottom:2px solid #ef4444;' +
                  'color:#fca5a5;padding:12px 16px;font:12px/1.5 monospace;' +
                  'white-space:pre-wrap;word-break:break-all;max-height:60vh;overflow:auto;');
                __pp_errDiv.innerHTML = '<b style="color:#ef4444">PAYAPRESS JS ERROR (send this to dev):</b>\n';
                document.body.appendChild(__pp_errDiv);
              }
              __pp_errDiv.innerHTML += msg + '\n';
            } catch(ex) {}
          }
          window.addEventListener('error', function(e) {
            var m = (e.message||'?') + '\\n  @ ' + (e.filename||'?') + ':' + e.lineno + ':' + e.colno;
            if (e.error && e.error.stack) m += '\\n' + e.error.stack;
            window.__pp_errs.push(m);
            __pp_showErr(m);
          });
          window.addEventListener('unhandledrejection', function(e) {
            var m = 'Unhandled Promise: ' + String(e.reason);
            if (e.reason && e.reason.stack) m += '\\n' + e.reason.stack;
            window.__pp_errs.push(m);
            __pp_showErr(m);
          });
        `}</Script>
        {/* Register service worker; auto-fix stale cache if CSS bundle failed to load */}
        <Script id="sw-register" strategy="afterInteractive">{`
          (function() {
            function run() {
              // Clean up cache-bust param from URL if present
              if (window.location.search.indexOf('_pp=') !== -1) {
                try { history.replaceState(null, '', window.location.pathname + window.location.hash); } catch(e) {}
              }

              var cssLoaded = !!(getComputedStyle(document.documentElement)
                .getPropertyValue('--color-copper-500') || '').trim();

              var ssAlreadyFixed = false;
              try { ssAlreadyFixed = !!sessionStorage.getItem('pp_css_fix'); } catch(e) {}

              if (!cssLoaded && !ssAlreadyFixed) {
                try { sessionStorage.setItem('pp_css_fix', '1'); } catch(e) {}
                // Clear SW + all caches first, then redirect with cache-busting param
                // (cache-busting param forces CDN to fetch fresh copy instead of serving stale)
                var hasSW = 'serviceWorker' in navigator;
                var hasCaches = 'caches' in window;
                var p = (hasSW && hasCaches)
                  ? navigator.serviceWorker.getRegistrations()
                      .then(function(r) { return Promise.all(r.map(function(x) { return x.unregister(); })); })
                      .then(function() { return caches.keys(); })
                      .then(function(k) { return Promise.all(k.map(function(c) { return caches.delete(c); })); })
                  : Promise.resolve();
                p.then(function() {
                  window.location.href = window.location.pathname + '?_pp=' + Date.now() + window.location.hash;
                }).catch(function() {
                  window.location.href = window.location.pathname + '?_pp=' + Date.now() + window.location.hash;
                });
                return;
              }

              try { sessionStorage.removeItem('pp_css_fix'); } catch(e) {}
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(function(){});
              }
            }
            if (document.readyState === 'complete') {
              run();
            } else {
              window.addEventListener('load', run);
            }
          })();
        `}</Script>
      </body>
    </html>
  );
}
