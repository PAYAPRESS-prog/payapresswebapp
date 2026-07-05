import { NextRequest, NextResponse } from 'next/server';
import { ensurePulseTables, getSurveyById, validateAnswers } from '@/lib/pulse';
import { getPool, isDbConfigured } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Upsert one response per (survey, visitor). Awaited before responding
// (Passenger). Honeypot: the hidden `website` field must stay empty.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`pulse:${ip}`, 10, 60 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
  let b: {
    surveyId?: number; visitorId?: string; answers?: unknown; partial?: boolean;
    email?: string; page?: string; device?: string; website?: string;
  };
  try { b = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (b.website) return NextResponse.json({ ok: true }); // bot: pretend success

  const surveyId = Number(b.surveyId);
  const visitorId = String(b.visitorId ?? '').slice(0, 64);
  if (!Number.isInteger(surveyId) || surveyId <= 0 || !visitorId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    await ensurePulseTables();
    const survey = await getSurveyById(surveyId);
    if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const answers = validateAnswers(survey.questions, b.answers ?? {});
    if (answers === null) {
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
    }

    let userId: number | null = null;
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (token) userId = (await verifySessionToken(token))?.uid ?? null;

    const email = (b.email ?? '').trim().slice(0, 190) || null;
    const page = String(b.page ?? '').slice(0, 190);
    const device = String(b.device ?? '').slice(0, 32);

    await getPool().query(
      `INSERT INTO survey_responses
         (survey_id, visitor_id, user_id, answers, partial, email, page, device)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         answers = VALUES(answers), partial = VALUES(partial),
         email = COALESCE(VALUES(email), email), user_id = COALESCE(VALUES(user_id), user_id)`,
      [surveyId, visitorId, userId, JSON.stringify(answers),
       b.partial === false ? 0 : 1, email, page, device],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[survey/respond]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
