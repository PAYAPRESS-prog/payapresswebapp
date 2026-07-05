import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, ensureAdminTables, audit } from '@/lib/adminAuth';
import { getPool, isDbConfigured } from '@/lib/db';
import { fetchCopperPrice, fetchAluminumPrice, fetchFxRates } from '@/lib/serverPrices';
import { sendMail, announcementEmail, isMailerConfigured } from '@/lib/mailer';
import { getClientIp } from '@/lib/rateLimit';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ENV_NAMES = [
  'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'JWT_SECRET', 'ADMIN_KEY',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
];

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    await ensureAdminTables();
    const pool = isDbConfigured() ? getPool() : null;

    const t0 = Date.now();
    let dbLatencyMs: number | null = null;
    if (pool) {
      try { await pool.query('SELECT 1'); dbLatencyMs = Date.now() - t0; } catch { dbLatencyMs = null; }
    }

    const [copper, aluminum, fx] = await Promise.all([
      fetchCopperPrice().catch(() => null),
      fetchAluminumPrice().catch(() => null),
      fetchFxRates().catch(() => null),
    ]);

    let cronRuns: RowDataPacket[] = [];
    let errors: RowDataPacket[] = [];
    if (pool) {
      [cronRuns] = await pool.query<RowDataPacket[]>(
        `SELECT name, detail, created_at FROM cron_runs
         ORDER BY created_at DESC LIMIT 20`).catch(() => [[] as RowDataPacket[]] as never);
      [errors] = await pool.query<RowDataPacket[]>(
        `SELECT route, message, hits, last_seen FROM app_errors
         ORDER BY last_seen DESC LIMIT 30`).catch(() => [[] as RowDataPacket[]] as never);
    }

    return NextResponse.json({
      dbLatencyMs,
      feeds: {
        copper: copper ? { pricePerKg: copper.pricePerKg, isFallback: !!copper.isFallback, updatedAt: copper.updatedAt } : null,
        aluminum: aluminum ? { pricePerKg: aluminum.pricePerKg, isFallback: !!aluminum.isFallback, updatedAt: aluminum.updatedAt } : null,
        fx: fx ? { eur: (fx as unknown as Record<string, unknown>).EUR ?? null, ok: typeof (fx as unknown as Record<string, unknown>).EUR === 'number' } : null,
      },
      cronRuns,
      errors,
      env: ENV_NAMES.map(name => ({ name, present: Boolean(process.env[name]) })),
      smtpConfigured: isMailerConfigured(),
    });
  } catch (err) {
    console.error('[admin/monitor]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST { action: 'test-mail' } — awaited SMTP round-trip check.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  let body: { action?: string };
  try { body = await req.json(); } catch { body = {}; }
  if (body.action !== 'test-mail') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
  if (!isMailerConfigured()) {
    return NextResponse.json({ error: 'SMTP is not configured' }, { status: 503 });
  }
  const to = (process.env.ADMIN_EMAIL ?? 'web3.payapress@gmail.com').split(',')[0].trim();
  try {
    const mail = announcementEmail(
      'Busbar Admin — SMTP test',
      'This is a test email sent from the Busbar Admin panel.\n\nIf you can read this, outbound mail is working.',
    );
    await sendMail({ to, subject: mail.subject, html: mail.html, text: mail.text });
    await audit('smtp-test', to, getClientIp(req));
    return NextResponse.json({ ok: true, to });
  } catch (err) {
    console.error('[admin/monitor test-mail]', err);
    return NextResponse.json({ error: 'Send failed — check SMTP settings' }, { status: 502 });
  }
}
