import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/embed'],
      },
    ],
    sitemap: 'https://guileless-torrone-f24c5e.netlify.app/sitemap.xml',
    host:    'https://guileless-torrone-f24c5e.netlify.app',
  };
}
