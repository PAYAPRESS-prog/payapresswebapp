import { APPLE_APP_SITE_ASSOCIATION } from '@/lib/appleAppSiteAssociation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Serves /.well-known/apple-app-site-association (beforeFiles rewrite in
// next.config.js). Apple's CDN requires HTTP 200 + application/json and
// re-fetches roughly daily — keep it short-cached and never SW-cached
// (the SW already bypasses /.well-known/*).
export async function GET() {
  return new Response(JSON.stringify(APPLE_APP_SITE_ASSOCIATION), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
