import { NextResponse } from 'next/server';
import { track } from '@/lib/analytics';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Beacon endpoint. Fire-and-forget: answers 204 immediately, records
// best-effort. Accepts pageviews AND custom events.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`an:${ip}`, 300, 60_000)) {
    return new NextResponse(null, { status: 204 });
  }

  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { /* default */ }

  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

  const visitorId = str(b.vid);
  const sessionId = str(b.sid);
  if (!visitorId || !sessionId) return new NextResponse(null, { status: 204 });

  track({
    event: str(b.event) ?? 'pageview',
    path: str(b.path) ?? '/',
    visitorId,
    sessionId,
    referrer: str(b.ref),
    utmSource: str(b.us),
    utmMedium: str(b.um),
    utmCampaign: str(b.uc),
    lang: str(b.lang),
    screenW: num(b.sw),
    durationMs: num(b.dur),
    meta: str(b.meta),
    ip,
    ua: req.headers.get('user-agent') ?? '',
  }).catch(err => console.error('[analytics] record failed:', err));

  return new NextResponse(null, { status: 204 });
}
