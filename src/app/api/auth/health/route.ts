import { NextResponse } from 'next/server';
import { getPool, isDbConfigured } from '@/lib/db';

// Temporary diagnostic endpoint to debug login/signup failures on Hostinger.
// Visit https://calculator.payapress.com/api/auth/health
// It NEVER leaks the password — only reports presence/length and the actual
// MySQL connection result so we can see the real error code.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const env = {
    DB_HOST: process.env.DB_HOST ?? null,
    DB_PORT: process.env.DB_PORT ?? null,
    DB_USER_present: Boolean(process.env.DB_USER),
    DB_NAME: process.env.DB_NAME ?? null,
    DB_PASSWORD_present: Boolean(process.env.DB_PASSWORD),
    DB_PASSWORD_length: process.env.DB_PASSWORD?.length ?? 0,
    JWT_SECRET_present: Boolean(process.env.JWT_SECRET),
    JWT_SECRET_length: process.env.JWT_SECRET?.length ?? 0,
    NODE_ENV: process.env.NODE_ENV ?? null,
    isDbConfigured: isDbConfigured(),
  };

  let db: Record<string, unknown> = { ok: false };
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.query('SELECT 1');
      // Check the users table specifically
      const [tables] = await conn.query(
        "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
        [process.env.DB_NAME ?? ''],
      );
      db = { ok: true, select1: true, usersTable: tables };
    } finally {
      conn.release();
    }
  } catch (err: unknown) {
    const e = err as { code?: string; errno?: number; message?: string; sqlState?: string };
    db = {
      ok: false,
      code: e.code ?? null,
      errno: e.errno ?? null,
      sqlState: e.sqlState ?? null,
      message: e.message ?? String(err),
    };
  }

  return NextResponse.json({ env, db });
}
