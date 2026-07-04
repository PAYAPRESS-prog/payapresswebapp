// First-party, GA-grade analytics — no third-party scripts, no data sent
// anywhere but our own server, no third-party cookies. Advantages over
// Google Analytics: ad-blocker resistant (first-party /api endpoint),
// full unsampled data, data ownership, bot filtering, PII-light.
//
// Identity model (first-party only, disclosed in the privacy policy):
//   visitor_id  — random UUID in localStorage → returning-visitor & uniques
//   session_id  — random UUID in sessionStorage (30-min idle) → sessions
// Neither is a tracking cookie and neither leaves our domain.

import { getPool, isDbConfigured } from './db';
import type { RowDataPacket } from 'mysql2';

let _ready = false;

async function ensureTables(): Promise<void> {
  if (_ready) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      event         VARCHAR(32)  NOT NULL DEFAULT 'pageview',
      path          VARCHAR(255) NOT NULL DEFAULT '/',
      visitor_id    CHAR(36)     NOT NULL,
      session_id    CHAR(36)     NOT NULL,
      is_new        TINYINT(1)   NOT NULL DEFAULT 0,
      country       VARCHAR(64)  NULL,
      city          VARCHAR(96)  NULL,
      browser       VARCHAR(32)  NULL,
      os            VARCHAR(32)  NULL,
      device        VARCHAR(16)  NOT NULL DEFAULT 'other',
      referrer_host VARCHAR(255) NULL,
      channel       VARCHAR(16)  NOT NULL DEFAULT 'direct',
      utm_source    VARCHAR(96)  NULL,
      utm_medium    VARCHAR(96)  NULL,
      utm_campaign  VARCHAR(96)  NULL,
      lang          VARCHAR(16)  NULL,
      screen_w      SMALLINT UNSIGNED NULL,
      duration_ms   INT UNSIGNED NULL,
      meta          VARCHAR(255) NULL,
      created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_an_created (created_at),
      INDEX idx_an_session (session_id),
      INDEX idx_an_event (event),
      INDEX idx_an_path (path(64))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics_visitors (
      visitor_id CHAR(36) NOT NULL,
      first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (visitor_id),
      INDEX idx_av_first (first_seen)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  _ready = true;
}

// ── UA parsing (no external lib) ──────────────────────────────────
export function parseUA(ua: string): { browser: string; os: string; device: string } {
  const s = ua || '';
  const l = s.toLowerCase();
  const bot = /bot|crawler|spider|crawling|facebookexternalhit|slurp|preview|monitor/.test(l);
  let device: string = bot ? 'bot'
    : /ipad|tablet|playbook|silk/.test(l) ? 'tablet'
    : /mobi|android|iphone|ipod|phone/.test(l) ? 'mobile'
    : 'desktop';
  let browser =
    /edg\//i.test(s) ? 'Edge'
    : /opr\/|opera/i.test(s) ? 'Opera'
    : /samsungbrowser/i.test(s) ? 'Samsung'
    : /chrome|crios/i.test(s) ? 'Chrome'
    : /firefox|fxios/i.test(s) ? 'Firefox'
    : /safari/i.test(s) ? 'Safari'
    : 'Other';
  if (bot) browser = 'Bot';
  const os =
    /windows/i.test(s) ? 'Windows'
    : /iphone|ipad|ipod|ios/i.test(s) ? 'iOS'
    : /mac os x|macintosh/i.test(s) ? 'macOS'
    : /android/i.test(s) ? 'Android'
    : /linux/i.test(s) ? 'Linux'
    : 'Other';
  return { browser, os, device };
}

// ── Referrer → channel classification (GA-style) ──────────────────
const SEARCH = /google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|brave/;
const SOCIAL = /facebook|fb\.com|instagram|twitter|t\.co|x\.com|linkedin|reddit|youtube|pinterest|telegram|whatsapp|tiktok/;

export function classifyChannel(referrerHost: string | null, utmMedium: string | null): string {
  if (utmMedium) {
    const m = utmMedium.toLowerCase();
    if (/cpc|ppc|paid/.test(m)) return 'paid';
    if (/email/.test(m)) return 'email';
    if (/social/.test(m)) return 'social';
    if (/organic/.test(m)) return 'organic';
    return 'referral';
  }
  if (!referrerHost) return 'direct';
  if (SEARCH.test(referrerHost)) return 'organic';
  if (SOCIAL.test(referrerHost)) return 'social';
  return 'referral';
}

// ── Geo lookup, cached in-process (avoids per-hit external calls) ──
const _geoCache = new Map<string, { country: string; city: string; exp: number }>();
const GEO_TTL = 6 * 60 * 60 * 1000;

async function lookupGeo(ip: string): Promise<{ country: string; city: string }> {
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('::1')) {
    return { country: 'Local', city: '' };
  }
  const hit = _geoCache.get(ip);
  if (hit && hit.exp > Date.now()) return { country: hit.country, city: hit.city };
  try {
    const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,city`, {
      signal: AbortSignal.timeout(3500),
    });
    const d = r.ok ? await r.json() : null;
    const country = d?.success ? String(d.country ?? '').slice(0, 64) : 'Unknown';
    const city = d?.success ? String(d.city ?? '').slice(0, 96) : '';
    _geoCache.set(ip, { country: country || 'Unknown', city, exp: Date.now() + GEO_TTL });
    return { country: country || 'Unknown', city };
  } catch {
    return { country: 'Unknown', city: '' };
  }
}

function safeHost(referrer: string): string | null {
  if (!referrer) return null;
  try { return new URL(referrer).host.toLowerCase().slice(0, 255) || null; } catch { return null; }
}
const cut = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : null);

export interface TrackInput {
  event?: string;
  path?: string;
  visitorId: string;
  sessionId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  lang?: string;
  screenW?: number;
  durationMs?: number;
  meta?: string;
  ip: string;
  ua: string;
}

const UUID = /^[0-9a-f-]{10,40}$/i;

export async function track(inp: TrackInput): Promise<void> {
  if (!isDbConfigured()) return;
  if (!UUID.test(inp.visitorId) || !UUID.test(inp.sessionId)) return;
  const { browser, os, device } = parseUA(inp.ua);
  if (device === 'bot') return;
  await ensureTables();
  const pool = getPool();

  // Upsert visitor; MySQL affectedRows: 1 = brand-new, 2 = returning.
  const [ins] = await pool.query(
    `INSERT INTO analytics_visitors (visitor_id) VALUES (?)
     ON DUPLICATE KEY UPDATE last_seen = CURRENT_TIMESTAMP`,
    [inp.visitorId],
  ) as [{ affectedRows: number }, unknown];
  const isNew = ins.affectedRows === 1 ? 1 : 0;

  const referrerHost = safeHost(inp.referrer ?? '');
  const channel = classifyChannel(referrerHost, inp.utmMedium ?? null);
  const geo = await lookupGeo(inp.ip);

  await pool.query(
    `INSERT INTO analytics_events
       (event, path, visitor_id, session_id, is_new, country, city, browser, os,
        device, referrer_host, channel, utm_source, utm_medium, utm_campaign,
        lang, screen_w, duration_ms, meta)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      cut(inp.event ?? 'pageview', 32), cut(inp.path ?? '/', 255) ?? '/',
      inp.visitorId, inp.sessionId, isNew,
      geo.country, geo.city, browser, os, device,
      referrerHost, channel,
      cut(inp.utmSource, 96), cut(inp.utmMedium, 96), cut(inp.utmCampaign, 96),
      cut(inp.lang, 16),
      Number.isFinite(inp.screenW) ? Math.min(20000, Math.max(0, Math.trunc(inp.screenW!))) : null,
      Number.isFinite(inp.durationMs) ? Math.min(86_400_000, Math.max(0, Math.trunc(inp.durationMs!))) : null,
      cut(inp.meta, 255),
    ],
  );
}

// ── Aggregation ───────────────────────────────────────────────────
export interface AnalyticsSummary {
  rangeDays: number;
  totalViews: number;
  uniqueVisitors: number;
  sessions: number;
  newVisitors: number;
  returningVisitors: number;
  bounceRate: number;        // %
  avgSessionSec: number;
  viewsPerSession: number;
  realtimeActive: number;    // distinct visitors in last 5 min
  byDay: Array<{ day: string; views: number; visitors: number; sessions: number }>;
  topPages: Array<{ path: string; views: number }>;
  entryPages: Array<{ path: string; sessions: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  byChannel: Array<{ channel: string; sessions: number }>;
  byCountry: Array<{ country: string; visitors: number }>;
  byBrowser: Array<{ browser: string; views: number }>;
  byOS: Array<{ os: string; views: number }>;
  byDevice: Array<{ device: string; views: number }>;
  events: Array<{ event: string; count: number }>;
}

export async function getSummary(days = 30): Promise<AnalyticsSummary> {
  await ensureTables();
  const pool = getPool();
  const d = Math.max(1, Math.min(365, Math.trunc(days) || 30));
  const since = `created_at >= (NOW() - INTERVAL ${d} DAY)`;
  const pv = `event = 'pageview' AND ${since}`;
  const q = <T extends RowDataPacket>(sql: string) => pool.query<T[]>(sql).then(([r]) => r);

  const [
    totals, sess, newv, byDay, topPages, entry, refs, chan,
    country, browser, os, device, evs, bounce, realtime,
  ] = await Promise.all([
    q<RowDataPacket>(`SELECT COUNT(*) v, COUNT(DISTINCT visitor_id) u FROM analytics_events WHERE ${pv}`),
    q<RowDataPacket>(`SELECT COUNT(DISTINCT session_id) s,
        AVG(dur) adur, AVG(cnt) vps FROM (
          SELECT session_id, TIMESTAMPDIFF(SECOND, MIN(created_at), MAX(created_at)) dur, COUNT(*) cnt
          FROM analytics_events WHERE ${pv} GROUP BY session_id) t`),
    q<RowDataPacket>(`SELECT SUM(is_new) n, COUNT(DISTINCT visitor_id) u FROM analytics_events WHERE ${pv}`),
    q<RowDataPacket>(`SELECT DATE(created_at) day, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors, COUNT(DISTINCT session_id) sessions FROM analytics_events WHERE ${pv} GROUP BY DATE(created_at) ORDER BY day ASC`),
    q<RowDataPacket>(`SELECT path, COUNT(*) views FROM analytics_events WHERE ${pv} GROUP BY path ORDER BY views DESC LIMIT 20`),
    q<RowDataPacket>(`SELECT path, COUNT(*) sessions FROM (
          SELECT session_id, SUBSTRING_INDEX(GROUP_CONCAT(path ORDER BY created_at ASC), ',', 1) path
          FROM analytics_events WHERE ${pv} GROUP BY session_id) t GROUP BY path ORDER BY sessions DESC LIMIT 20`),
    q<RowDataPacket>(`SELECT COALESCE(referrer_host,'(direct)') referrer, COUNT(*) views FROM analytics_events WHERE ${pv} GROUP BY referrer ORDER BY views DESC LIMIT 20`),
    q<RowDataPacket>(`SELECT channel, COUNT(DISTINCT session_id) sessions FROM analytics_events WHERE ${pv} GROUP BY channel ORDER BY sessions DESC`),
    q<RowDataPacket>(`SELECT COALESCE(country,'Unknown') country, COUNT(DISTINCT visitor_id) visitors FROM analytics_events WHERE ${pv} GROUP BY country ORDER BY visitors DESC LIMIT 20`),
    q<RowDataPacket>(`SELECT COALESCE(browser,'Other') browser, COUNT(*) views FROM analytics_events WHERE ${pv} GROUP BY browser ORDER BY views DESC`),
    q<RowDataPacket>(`SELECT COALESCE(os,'Other') os, COUNT(*) views FROM analytics_events WHERE ${pv} GROUP BY os ORDER BY views DESC`),
    q<RowDataPacket>(`SELECT device, COUNT(*) views FROM analytics_events WHERE ${pv} GROUP BY device ORDER BY views DESC`),
    q<RowDataPacket>(`SELECT event, COUNT(*) count FROM analytics_events WHERE event <> 'pageview' AND ${since} GROUP BY event ORDER BY count DESC LIMIT 20`),
    q<RowDataPacket>(`SELECT
        SUM(cnt = 1) bounced, COUNT(*) total FROM (
          SELECT session_id, COUNT(*) cnt FROM analytics_events WHERE ${pv} GROUP BY session_id) t`),
    q<RowDataPacket>(`SELECT COUNT(DISTINCT visitor_id) a FROM analytics_events WHERE created_at >= (NOW() - INTERVAL 5 MINUTE)`),
  ]);

  const totalSessions = Number(sess[0]?.s) || 0;
  const bounced = Number(bounce[0]?.bounced) || 0;
  const bTotal = Number(bounce[0]?.total) || 0;
  const nNew = Number(newv[0]?.n) || 0;
  const nUsers = Number(newv[0]?.u) || 0;

  return {
    rangeDays: d,
    totalViews: Number(totals[0]?.v) || 0,
    uniqueVisitors: Number(totals[0]?.u) || 0,
    sessions: totalSessions,
    newVisitors: nNew,
    returningVisitors: Math.max(0, nUsers - nNew),
    bounceRate: bTotal ? Math.round((bounced / bTotal) * 100) : 0,
    avgSessionSec: Math.round(Number(sess[0]?.adur) || 0),
    viewsPerSession: Math.round((Number(sess[0]?.vps) || 0) * 10) / 10,
    realtimeActive: Number(realtime[0]?.a) || 0,
    byDay: byDay.map(r => ({ day: String(r.day).slice(0, 10), views: Number(r.views), visitors: Number(r.visitors), sessions: Number(r.sessions) })),
    topPages: topPages.map(r => ({ path: String(r.path), views: Number(r.views) })),
    entryPages: entry.map(r => ({ path: String(r.path), sessions: Number(r.sessions) })),
    topReferrers: refs.map(r => ({ referrer: String(r.referrer), views: Number(r.views) })),
    byChannel: chan.map(r => ({ channel: String(r.channel), sessions: Number(r.sessions) })),
    byCountry: country.map(r => ({ country: String(r.country), visitors: Number(r.visitors) })),
    byBrowser: browser.map(r => ({ browser: String(r.browser), views: Number(r.views) })),
    byOS: os.map(r => ({ os: String(r.os), views: Number(r.views) })),
    byDevice: device.map(r => ({ device: String(r.device), views: Number(r.views) })),
    events: evs.map(r => ({ event: String(r.event), count: Number(r.count) })),
  };
}
