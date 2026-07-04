import { NextRequest, NextResponse } from 'next/server';
import { getPool, isDbConfigured } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Owner-only signup report.
//
// Protected by the ADMIN_KEY env var (set it in Hostinger's panel, >=16
// chars, keep it in your password manager). Without the exact key the
// endpoint reveals nothing — same 404 for wrong key and missing config,
// so it can't be used to probe whether an admin API exists.
//
// Usage:
//   GET /api/admin/users
//   Header:  x-admin-key: <ADMIN_KEY>
//   (or ?key=<ADMIN_KEY> for quick browser checks)

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`admin:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const adminKey = process.env.ADMIN_KEY;
  const provided =
    req.headers.get('x-admin-key') ?? req.nextUrl.searchParams.get('key') ?? '';

  if (!adminKey || adminKey.length < 16 || provided !== adminKey) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const pool = getPool();
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, opt_in, created_at,
              first_name, last_name, company, phone
       FROM users ORDER BY created_at DESC LIMIT 1000`,
    );
    const [subs] = await pool.query<RowDataPacket[]>(
      `SELECT email, created_at FROM email_subscriptions
       ORDER BY created_at DESC LIMIT 1000`,
    ).catch(() => [[] as RowDataPacket[]] as never);
    // Deleted-account audit archive (who deleted, when, what it looked like)
    const [deleted] = await pool.query<RowDataPacket[]>(
      `SELECT original_uid, email, first_name, last_name, company, phone,
              opt_in, history_count, registered_at, deleted_at, ip, user_agent
       FROM deleted_accounts ORDER BY deleted_at DESC LIMIT 1000`,
    ).catch(() => [[] as RowDataPacket[]] as never);

    return NextResponse.json({
      totalUsers: users.length,
      users,
      totalSubscribers: subs.length,
      subscribers: subs,
      totalDeleted: deleted.length,
      deletedAccounts: deleted,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[admin/users]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
