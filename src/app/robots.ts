import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://calculator.payapress.com';

// Public launch: crawling enabled. API and account-only surfaces stay out
// of the index to keep crawl budget on the calculator landing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/app/',
          '/app',
          '/reset-password',
          '/offline',
          '/embed',
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
