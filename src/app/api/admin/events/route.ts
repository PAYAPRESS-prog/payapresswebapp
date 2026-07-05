import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getPool, isDbConfigured } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Filterable event explorer + funnel. All filters are whitelisted
// column/equality pairs; values travel as bound parameters and the
// LIMIT is an inlined sanitized integer (mysql2 execute quirk).
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const p = req.nextUrl.searchParams;
  const days = Math.max(1, Math.min(365, parseInt(p.get('days') ?? '30', 10) || 30));

  const where: string[] = ['created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)'];
  const args: unknown[] = [days];
  const eqFilters: Array<[string, string]> = [
    ['event', 'event'], ['country', 'country'], ['device', 'device'],
    ['browser', 'browser'], ['os', 'os'],
  ];
  for (const [param, col] of eqFilters) {
    const v = p.get(param);
    if (v) { where.push(`${col} = ?`); args.push(v.slice(0, 80)); }
  }
  const q = p.get('q');
  if (q) { where.push('path LIKE ?'); args.push(`%${q.slice(0, 120)}%`); }

  try {
    const pool = getPool();
    const W = where.join(' AND ');
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT event, path, referrer, utm_source, utm_medium, country, city,
              browser, os, device, duration_ms, created_at
       FROM analytics_events WHERE ${W}
       ORDER BY created_at DESC LIMIT 500`, args);

    const [byEvent] = await pool.query<RowDataPacket[]>(
      `SELECT event, COUNT(*) count, COUNT(DISTINCT session_id) sessions
       FROM analytics_events WHERE ${W}
       GROUP BY event ORDER BY count DESC LIMIT 40`, args);

    // Funnel: distinct sessions in range that reached each stage.
    const [funnel] = await pool.query<RowDataPacket[]>(
      `SELECT
         COUNT(DISTINCT session_id) visit,
         COUNT(DISTINCT CASE WHEN event = 'calculate' THEN session_id END) calc,
         COUNT(DISTINCT CASE WHEN event IN ('signup','google_auth') THEN session_id END) signup,
         COUNT(DISTINCT CASE WHEN event IN ('bookmark','share','compare','waste') THEN session_id END) engaged
       FROM analytics_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`, [days]);

    return NextResponse.json({ rows, byEvent, funnel: funnel[0] ?? null });
  } catch (err) {
    console.error('[admin/events]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
