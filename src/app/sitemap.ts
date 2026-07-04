import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://calculator.payapress.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Primary SEO target — the calculator landing (hero section)
    { url: `${BASE}/busbar-calculator`, lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: BASE,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/whitepaper`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/roadmap`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/terms`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,           lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
