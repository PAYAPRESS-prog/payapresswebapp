import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

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
    await pool.query(
      'INSERT IGNORE INTO email_subscriptions (email) VALUES (?)',
      [trimmed],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
