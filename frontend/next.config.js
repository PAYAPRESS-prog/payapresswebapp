/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows fetching images from your WordPress domain
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_WP_HOSTNAME || 'localhost',
      },
    ],
  },

  // Rewrites so /api/wp/* proxies to WordPress REST API
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
