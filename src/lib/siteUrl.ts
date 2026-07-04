// Canonical site origin for SEO surfaces (schema, canonicals, sitemap,
// robots, email links).
//
// Hardened against a misconfigured NEXT_PUBLIC_BASE_URL: production once
// had it set to the bare apex domain, which silently produced schema and
// reset links pointing at the wrong host. The env value is honored ONLY
// when it matches the real deployment origin.
const raw = (process.env.NEXT_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');

export const SITE_URL =
  raw.startsWith('https://calculator.payapress.com')
    ? raw
    : 'https://calculator.payapress.com';
