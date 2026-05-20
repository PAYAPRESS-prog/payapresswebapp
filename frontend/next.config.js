/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_WP_HOSTNAME || 'localhost',
      },
    ],
  },

  async headers() {
    return [
      {
        // Global security headers
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Allow /embed to be loaded inside an iframe from any origin
        source: '/embed(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ];
  },

  async rewrites() {
    const wpApiBase = process.env.NEXT_PUBLIC_WP_API_BASE || '';
    if (!wpApiBase) return [];
    return [
      {
        source: '/api/wp/:path*',
        destination: `${wpApiBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
