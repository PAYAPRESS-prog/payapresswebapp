import type { MetadataRoute } from 'next';

// SEO indexing is currently disabled — enable when ready to launch.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
