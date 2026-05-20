/** @type {import('next').NextConfig} */

// Content-Security-Policy
// - script-src: 'unsafe-inline' + 'unsafe-eval' required by Next.js App Router & Framer Motion
// - style-src:  'unsafe-inline' required by Tailwind CSS v4 (atomic inline styles)
// - img-src:    flagcdn.com for country flag images in the currency selector
// - connect-src: self only (all external fetches happen server-side in API routes)
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://flagcdn.com",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
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
        // ── Global security headers ────────────────────────────────
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',    value: CSP },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
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
    ];
  },

  async rewrites() {
    const wpApiBase = process.env.NEXT_PUBLIC_WP_API_BASE || '';
    if (!wpApiBase) return [];
    return [
      {
        source:      '/api/wp/:path*',
        destination: `${wpApiBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
