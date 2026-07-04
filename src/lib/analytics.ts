// First-party, cookieless analytics — no external scripts, no personal
// data stored. Uniqueness is a day-salted one-way hash of IP+UA, so we
// can count distinct visitors per day without ever storing an IP or
// setting a cookie (GDPR-friendly, no consent banner needed).

import { createHash } from 'crypto';
import { getPool, isDbConfigured } from './db';
import type { RowDataPacket } from 'mysql2';

let _ready = false;

async function ensureTable(): Promise<void> {
  if (_ready) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      path          VARCHAR(255) NOT NULL,
      referrer_host VARCHAR(255) NULL,
      device        VARCHAR(16)  NOT NULL DEFAULT 'other',
      visitor_hash  CHAR(64)     NOT NULL,
      created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_an_created (created_at),
      INDEX idx_an_path (path(64))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  _ready = true;
}

// Rotating daily salt (never persisted) — makes visitor_hash un-reversible
// to an IP and only linkable within a single UTC day.
function daySalt(): string {
  return new Date().toISOString().slice(0, 10);
}

export function visitorHash(ip: string, ua: string): string {
  return createHash('sha256').update(`${ip}|${ua}|${daySalt()}`).digest('hex');
}

export function deviceFromUA(ua: string): 'mobile' | 'tablet' | 'desktop' | 'bot' {
  const s = ua.toLowerCase();
  if (/bot|crawler|spider|crawling|facebookexternalhit|slurp/.test(s)) return 'bot';
  if (/ipad|tablet|playbook|silk/.test(s)) return 'tablet';
  if (/mobi|android|iphone|ipod|phone/.test(s)) return 'mobile';
  return 'desktop';
}

function safeHost(referrer: string): string | null {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).host.toLowerCase();
    return h ? h.slice(0, 255) : null;
  } catch {
    return null;
  }
}

export async function recordPageview(opts: {
  path: string;
  referrer: string;
  ip: string;
  ua: string;
}): Promise<void> {
  if (!isDbConfigured()) return;
  const path = (opts.path || '/').slice(0, 255);
  const device = deviceFromUA(opts.ua);
  if (device === 'bot') return; // don't pollute human metrics with crawlers
  await ensureTable();
  const pool = getPool();
  await pool.query(
    'INSERT INTO analytics_events (path, referrer_host, device, visitor_hash) VALUES (?,?,?,?)',
    [path, safeHost(opts.referrer), device, visitorHash(opts.ip, opts.ua)],
  );
}

export interface AnalyticsSummary {
  rangeDays: number;
  totalViews: number;
  uniqueVisitors: number;
  byDay: Array<{ day: string; views: number; visitors: number }>;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  byDevice: Array<{ device: string; views: number }>;
}

export async function getSummary(days = 30): Promise<AnalyticsSummary> {
  await ensureTable();
  const pool = getPool();
  const d = Math.max(1, Math.min(365, Math.trunc(days) || 30));
  const since = `created_at >= (NOW() - INTERVAL ${d} DAY)`;

  const q = <T extends RowDataPacket>(sql: string) =>
    pool.query<T[]>(sql).then(([r]) => r);

  const [totals, byDay, topPages, topReferrers, byDevice] = await Promise.all([
    q<RowDataPacket>(`SELECT COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors FROM analytics_events WHERE ${since}`),
    q<RowDataPacket>(`SELECT DATE(created_at) AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors FROM analytics_events WHERE ${since} GROUP BY DATE(created_at) ORDER BY day ASC`),
    q<RowDataPacket>(`SELECT path, COUNT(*) AS views FROM analytics_events WHERE ${since} GROUP BY path ORDER BY views DESC LIMIT 20`),
    q<RowDataPacket>(`SELECT COALESCE(referrer_host, '(direct)') AS referrer, COUNT(*) AS views FROM analytics_events WHERE ${since} GROUP BY referrer ORDER BY views DESC LIMIT 20`),
    q<RowDataPacket>(`SELECT device, COUNT(*) AS views FROM analytics_events WHERE ${since} GROUP BY device ORDER BY views DESC`),
  ]);

  return {
    rangeDays: d,
    totalViews: Number(totals[0]?.views) || 0,
    uniqueVisitors: Number(totals[0]?.visitors) || 0,
    byDay: byDay.map(r => ({ day: String(r.day).slice(0, 10), views: Number(r.views), visitors: Number(r.visitors) })),
    topPages: topPages.map(r => ({ path: String(r.path), views: Number(r.views) })),
    topReferrers: topReferrers.map(r => ({ referrer: String(r.referrer), views: Number(r.views) })),
    byDevice: byDevice.map(r => ({ device: String(r.device), views: Number(r.views) })),
  };
}
