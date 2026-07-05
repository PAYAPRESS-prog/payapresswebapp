import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, audit } from '@/lib/adminAuth';
import {
  ensurePulseTables, validateQuestions, bustSurveyCache, isValidTrigger,
} from '@/lib/pulse';
import { getPool, isDbConfigured } from '@/lib/db';
import { getClientIp } from '@/lib/rateLimit';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: ?insights=<id>&days=30 → per-survey insights + raw responses.
// Without params → survey list with response counts.
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  try {
    await ensurePulseTables();
    const pool = getPool();
    const p = req.nextUrl.searchParams;
    const id = parseInt(p.get('insights') ?? '', 10);

    if (Number.isInteger(id) && id > 0) {
      const days = Math.max(1, Math.min(365, parseInt(p.get('days') ?? '30', 10) || 30));
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT r.visitor_id, r.user_id, r.answers, r.partial, r.email, r.page,
                r.device, r.country, r.created_at, u.email AS user_email
         FROM survey_responses r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.survey_id = ? AND r.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY r.created_at DESC LIMIT 1000`, [id, days]);
      const responses = rows.map(r => ({
        ...r,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
      }));
      return NextResponse.json({ responses });
    }

    const [surveys] = await pool.query<RowDataPacket[]>(
      `SELECT s.id, s.slug, s.title, s.active, s.trigger_kind, s.trigger_n,
              s.questions, s.created_at,
              (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id) AS responses,
              (SELECT COUNT(*) FROM survey_responses r
               WHERE r.survey_id = s.id AND r.partial = 0) AS completed
       FROM surveys s ORDER BY s.id`);
    return NextResponse.json({
      surveys: surveys.map(s => ({
        ...s,
        questions: typeof s.questions === 'string' ? JSON.parse(s.questions) : s.questions,
      })),
    });
  } catch (err) {
    console.error('[admin/surveys GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: { action: 'toggle'|'save', ... } — audited writes.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const ip = getClientIp(req);
  let b: {
    action?: string; id?: number; active?: boolean; title?: string;
    slug?: string; trigger?: string; triggerN?: number; questions?: unknown;
  };
  try { b = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    await ensurePulseTables();
    const pool = getPool();

    if (b.action === 'toggle') {
      const id = Number(b.id);
      if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      await pool.query('UPDATE surveys SET active = ? WHERE id = ?', [b.active ? 1 : 0, id]);
      bustSurveyCache();
      await audit('survey-toggle', `#${id} → ${b.active ? 'on' : 'off'}`, ip);
      return NextResponse.json({ ok: true });
    }

    if (b.action === 'save') {
      const title = String(b.title ?? '').trim().slice(0, 160);
      const trigger = String(b.trigger ?? 'manual');
      const triggerN = Math.max(1, Math.min(20, Number(b.triggerN) || 1));
      const questions = validateQuestions(b.questions);
      if (!title || !isValidTrigger(trigger) || !questions) {
        return NextResponse.json(
          { error: 'Invalid survey: check title, trigger and questions' }, { status: 400 });
      }
      const id = Number(b.id);
      if (Number.isInteger(id) && id > 0) {
        await pool.query(
          `UPDATE surveys SET title = ?, trigger_kind = ?, trigger_n = ?, questions = ?
           WHERE id = ?`,
          [title, trigger, triggerN, JSON.stringify(questions), id]);
        await audit('survey-edit', `#${id} ${title}`, ip);
      } else {
        const slug = (String(b.slug ?? '') || title).toLowerCase()
          .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || `survey-${Date.now() % 100000}`;
        await pool.query(
          `INSERT INTO surveys (slug, title, active, trigger_kind, trigger_n, questions)
           VALUES (?, ?, 0, ?, ?, ?)`,
          [slug, title, trigger, triggerN, JSON.stringify(questions)]);
        await audit('survey-create', `${slug} ${title}`, ip);
      }
      bustSurveyCache();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[admin/surveys POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
