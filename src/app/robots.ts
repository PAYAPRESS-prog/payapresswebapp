import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteUrl';

const BASE = SITE_URL;

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
