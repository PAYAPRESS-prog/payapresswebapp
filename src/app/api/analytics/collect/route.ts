import { NextResponse } from 'next/server';
import { recordPageview } from '@/lib/analytics';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Pageview beacon. Fire-and-forget: always answers 204 quickly and never
// blocks the client; records are best-effort.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  // Generous cap — a single reader browsing many pages is fine; this only
  // stops a flood from one source.
  if (!checkRateLimit(`an:${ip}`, 240, 60_000)) {
    return new NextResponse(null, { status: 204 });
  }

  let path = '/';
  let referrer = '';
  try {
    const body = await req.json();
    if (typeof body?.path === 'string') path = body.path;
    if (typeof body?.ref === 'string') referrer = body.ref;
  } catch { /* empty/invalid body → default path */ }

  recordPageview({
    path,
    referrer,
    ip,
    ua: req.headers.get('user-agent') ?? '',
  }).catch(err => console.error('[analytics] record failed:', err));

  return new NextResponse(null, { status: 204 });
}
