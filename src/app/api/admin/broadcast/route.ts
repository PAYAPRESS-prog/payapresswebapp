import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, audit } from '@/lib/adminAuth';
import { getPool, isDbConfigured } from '@/lib/db';
import { sendMail, announcementEmail, isMailerConfigured } from '@/lib/mailer';
import { getClientIp } from '@/lib/rateLimit';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Audience = 'all' | 'optin' | 'subscribers';

async function recipients(a: Audience): Promise<string[]> {
  const pool = getPool();
  const sql =
    a === 'subscribers'
      ? 'SELECT email FROM email_subscriptions'
      : a === 'optin'
        ? 'SELECT email FROM users WHERE opt_in = 1'
        : 'SELECT email FROM users';
  const [rows] = await pool.query<RowDataPacket[]>(sql);
  return Array.from(new Set(rows.map(r => String(r.email).toLowerCase()))).filter(Boolean);
}

// POST { audience, subject, message } — awaited batches of 20.
// Passenger freezes after the response, so the WHOLE send happens
// before we answer; the panel shows per-batch progress from the result.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  if (!isMailerConfigured()) {
    return NextResponse.json({ error: 'SMTP is not configured' }, { status: 503 });
  }
  let body: { audience?: Audience; subject?: string; message?: string; dryRun?: boolean };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const audience: Audience = ['all', 'optin', 'subscribers'].includes(body.audience as string)
    ? (body.audience as Audience) : 'subscribers';
  const subject = (body.subject ?? '').trim().slice(0, 160);
  const message = (body.message ?? '').trim().slice(0, 12000);
  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
  }

  try {
    const list = await recipients(audience);
    if (body.dryRun) return NextResponse.json({ ok: true, recipients: list.length });
    if (list.length === 0) {
      return NextResponse.json({ error: 'No recipients in this audience' }, { status: 400 });
    }

    const mail = announcementEmail(subject, message);
    let sent = 0; let failed = 0;
    for (let i = 0; i < list.length; i += 20) {
      const batch = list.slice(i, i + 20);
      const results = await Promise.allSettled(
        batch.map(to => sendMail({ to, subject: mail.subject, html: mail.html, text: mail.text })),
      );
      for (const r of results) r.status === 'fulfilled' ? sent++ : failed++;
    }
    await audit('broadcast', `${audience} · "${subject}" · sent ${sent}/${list.length}`, getClientIp(req));
    return NextResponse.json({ ok: true, sent, failed, total: list.length });
  } catch (err) {
    console.error('[admin/broadcast]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
