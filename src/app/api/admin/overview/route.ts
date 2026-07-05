import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, ensureAdminTables } from '@/lib/adminAuth';
import { getSummary } from '@/lib/analytics';
import { getPool, isDbConfigured } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const days = Math.max(1, Math.min(365,
    parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10) || 30));

  try {
    await ensureAdminTables();
    const pool = getPool();
    const [summary, [userRows], [subRows], [bookRows], [recent], [signup7]] =
      await Promise.all([
        getSummary(days),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) c FROM users'),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) c FROM email_subscriptions')
          .catch(() => [[{ c: 0 }] as RowDataPacket[]] as never),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) c FROM busbar_history')
          .catch(() => [[{ c: 0 }] as RowDataPacket[]] as never),
        pool.query<RowDataPacket[]>(
          `SELECT event, path, country, device, created_at
           FROM analytics_events ORDER BY created_at DESC LIMIT 10`),
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) c FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`),
      ]);

    return NextResponse.json({
      summary,
      totals: {
        users: Number(userRows[0]?.c) || 0,
        usersLast7d: Number(signup7[0]?.c) || 0,
        subscribers: Number(subRows[0]?.c) || 0,
        bookmarks: Number(bookRows[0]?.c) || 0,
      },
      recent,
    });
  } catch (err) {
    console.error('[admin/overview]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
