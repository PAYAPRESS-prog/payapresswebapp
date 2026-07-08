/** @type {import('next').NextConfig} */
const path = require('path');

// Content-Security-Policy
// - script-src: 'unsafe-inline' + 'unsafe-eval' required by Next.js App Router & Framer Motion
// - style-src:  'unsafe-inline' required by Tailwind CSS v4 (atomic inline styles)
// - img-src:    flagcdn.com for country flag images in the currency selector
// - connect-src: self only (all external fetches happen server-side in API routes)
// Google Analytics (gtag.js) hosts — required in the CSP or the browser
// blocks the tag. Our own first-party analytics needs no exceptions;
// these lines exist ONLY for GA4.
const GA_SCRIPT = 'https://www.googletagmanager.com';
const GA_CONNECT = 'https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com';
const GA_IMG = 'https://www.google-analytics.com https://www.googletagmanager.com';

// Google Identity Services ("Sign in with Google"). The GIS client script
// runs an iframe (frame-src), fetches from accounts.google.com (connect),
// and shows the user's avatar (img). Required or the button won't load.
const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';
const GIS_FRAME  = 'https://accounts.google.com/gsi/';
const GIS_CONNECT = 'https://accounts.google.com/gsi/';
const GIS_STYLE  = 'https://accounts.google.com/gsi/style';
const GIS_IMG    = 'https://lh3.googleusercontent.com';

// Sign in with Apple (web flow): the JS loads from Apple's CDN and the
// popup/frame talks to appleid.apple.com.
const APPLE_SCRIPT  = 'https://appleid.cdn-apple.com';
const APPLE_CONNECT = 'https://appleid.apple.com';
const APPLE_FRAME   = 'https://appleid.apple.com';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${GA_SCRIPT} ${GIS_SCRIPT} ${APPLE_SCRIPT}`,
  `style-src 'self' 'unsafe-inline' ${GIS_STYLE}`,
  `img-src 'self' data: https://flagcdn.com ${GA_IMG} ${GIS_IMG}`,
  "font-src 'self'",
  `connect-src 'self' ${GA_CONNECT} ${GIS_CONNECT} ${APPLE_CONNECT} https://api.github.com`,
  "worker-src 'self'",
  `frame-src ${GIS_FRAME} ${APPLE_FRAME}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

// CSP for /embed — allow framing from any origin (WordPress iframe)
const CSP_EMBED = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://flagcdn.com",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig = {
  poweredByHeader: false,  // Don't expose "X-Powered-By: Next.js"
  compress: true,          // Enable gzip for HTML/JSON responses (Next.js built-in)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_WP_HOSTNAME || 'localhost',
      },
    ],
  },

  async headers() {
    return [
      {
        // ── HTML navigation pages: NEVER cache — new builds change JS/CSS hashes ──
        // Excludes _next/* (static assets) and api/* (dynamic routes with their own caching)
        // sw.js and manifest.json have their own entries below that override this
        source: '/((?!_next|api).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
      {
        // ── Global security headers ────────────────────────────────
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',    value: CSP },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // X-Robots-Tag noindex REMOVED at public launch — this header
          // overrides all page metadata; private pages opt out via their
          // own metadata + robots.txt instead.
          { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
          // COOP must be same-origin-allow-popups (NOT same-origin): the
          // Google Sign-In popup needs the opener channel to hand the
          // credential back — plain same-origin severs it and the popup
          // hangs on a blank accounts.google.com/gsi/transform page.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      {
        // ── /embed: allow iframe from any origin (WordPress plugin) ─
        source: '/embed(.*)',
        headers: [
          { key: 'Content-Security-Policy',      value: CSP_EMBED },
          { key: 'X-Frame-Options',              value: 'ALLOWALL' },
          { key: 'Cross-Origin-Opener-Policy',   value: 'unsafe-none' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
      {
        // ── Public API v1: CORS + no caching directive ─────────────
        source: '/api/v1/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control',                value: 'public, s-maxage=300, stale-while-revalidate=60' },
        ],
      },
      {
        // ── Service worker: must not be cached by browser ──────────
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // ── Manifest: short-lived cache ────────────────────────────
        // CORS open: the Windows shell's bundled bootstrap page (origin
        // http://tauri.localhost) pings this file as its connectivity
        // probe — without ACAO the fetch is blocked and the app shows
        // "You're offline" even when online. The manifest is public data.
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },

  webpack(config) {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },

  async rewrites() {
    // beforeFiles: must win over public/ so the AASA JSON is served by the
    // route handler with content-type application/json (Apple requirement —
    // the extensionless public file would ship as octet-stream).
    const beforeFiles = [
      {
        source:      '/.well-known/apple-app-site-association',
        destination: '/api/well-known/aasa',
      },
    ];
    const wpApiBase = process.env.NEXT_PUBLIC_WP_API_BASE || '';
    const afterFiles = wpApiBase
      ? [{ source: '/api/wp/:path*', destination: `${wpApiBase}/:path*` }]
      : [];
    return { beforeFiles, afterFiles, fallback: [] };
  },
};

module.exports = nextConfig;
