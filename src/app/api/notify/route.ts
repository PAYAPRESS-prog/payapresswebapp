import { NextRequest, NextResponse } from 'next/server';
import { getPool, isDbConfigured } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendMail, subscribeConfirmEmail } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_subscriptions (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      email      VARCHAR(255) NOT NULL,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_sub_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  tableReady = true;
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 subscriptions per IP per 10 minutes.
  const ip = getClientIp(req);
  if (!checkRateLimit(`notify:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'server_error' }, { status: 503 });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }
    await ensureTable();
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT IGNORE INTO email_subscriptions (email) VALUES (?)',
      [trimmed],
    ) as [{ affectedRows: number }, unknown];

    // Send confirmation only on first subscription (affectedRows=0 means duplicate).
    if (result.affectedRows > 0) {
      const c = subscribeConfirmEmail(trimmed);
      // Awaited: Passenger freezes the process after the response goes out,
      // so a fire-and-forget send silently never leaves the server.
      await sendMail({ to: trimmed, subject: c.subject, html: c.html, text: c.text })
        .catch(err => console.error('[notify] confirm email failed:', err));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
