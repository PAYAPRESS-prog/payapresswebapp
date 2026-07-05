import { NextRequest, NextResponse } from 'next/server';
import { getActiveSurvey, isValidTrigger } from '@/lib/pulse';
import { isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public: the matching active survey for a trigger (tiny payload) or 204.
export async function GET(req: NextRequest) {
  if (!isDbConfigured()) return new NextResponse(null, { status: 204 });
  const t = req.nextUrl.searchParams.get('trigger') ?? 'manual';
  if (!isValidTrigger(t)) return new NextResponse(null, { status: 204 });
  try {
    let s = await getActiveSurvey(t);
    // Manual entry points fall back to the default survey so the
    // "Give feedback" row always has something to show.
    if (!s && t === 'manual') s = await getActiveSurvey('post_calculate');
    if (!s) return new NextResponse(null, { status: 204 });
    return NextResponse.json({
      id: s.id, slug: s.slug, title: s.title,
      trigger: s.trigger_kind, triggerN: s.trigger_n, questions: s.questions,
    });
  } catch (err) {
    console.error('[survey/active]', err);
    return new NextResponse(null, { status: 204 });
  }
}
