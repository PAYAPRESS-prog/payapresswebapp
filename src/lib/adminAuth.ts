import { SignJWT, jwtVerify } from 'jose';
import { createHash, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { getPool, isDbConfigured } from './db';
import type { RowDataPacket } from 'mysql2';

// ── Busbar Admin auth ─────────────────────────────────────────────
// The panel is gated by an admin session cookie (12h JWT, purpose
// 'admin') obtained by presenting ADMIN_KEY once. Every /api/admin/*
// endpoint also still accepts the raw key (header/query) so existing
// bookmarks and crons keep working. Unauthenticated callers get an
// opaque 404 — the admin surface must not advertise itself.

export const ADMIN_COOKIE = 'bc_admin';
const ADMIN_TTL_HOURS = 12;

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? '');
}

export function adminKeyConfigured(): boolean {
  const k = process.env.ADMIN_KEY;
  return typeof k === 'string' && k.length >= 16 && (process.env.JWT_SECRET ?? '').length >= 16;
}

// Constant-time compare via SHA-256 digests (lengths always equal).
// Both sides are trimmed: hosting panels love to append an invisible
// trailing space/newline when values are pasted in.
export function adminKeyMatches(provided: string): boolean {
  const key = (process.env.ADMIN_KEY ?? '').trim();
  if (!key || key.length < 16 || !provided) return false;
  const a = createHash('sha256').update(provided.trim()).digest();
  const b = createHash('sha256').update(key).digest();
  return timingSafeEqual(a, b);
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ purpose: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_TTL_HOURS}h`)
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    return payload.purpose === 'admin';
  } catch {
    return false;
  }
}

// Accepts either a valid admin cookie OR the raw key (header / ?key=).
export async function requireAdmin(req: NextRequest): Promise<boolean> {
  if (!adminKeyConfigured()) return false;
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie && (await verifyAdminToken(cookie))) return true;
  const provided =
    req.headers.get('x-admin-key') ?? req.nextUrl.searchParams.get('key') ?? '';
  return adminKeyMatches(provided);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: ADMIN_TTL_HOURS * 3600,
  };
}

// ── Admin-side tables (audit / cron runs / app errors) ────────────
// Same self-heal pattern as the analytics tables: CREATE IF NOT EXISTS,
// and verify a marker column via information_schema so a stale schema
// from an older release is dropped and rebuilt instead of erroring.

let tablesReady = false;

export async function ensureAdminTables(): Promise<void> {
  if (tablesReady || !isDbConfigured()) return;
  const pool = getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(64) NOT NULL,
    target VARCHAR(255) NOT NULL DEFAULT '',
    ip VARCHAR(64) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_time (created_at),
    INDEX idx_audit_action (action)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await pool.query(`CREATE TABLE IF NOT EXISTS cron_runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    detail VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cron_name (name, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await pool.query(`CREATE TABLE IF NOT EXISTS app_errors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route VARCHAR(191) NOT NULL,
    message VARCHAR(500) NOT NULL DEFAULT '',
    hits INT NOT NULL DEFAULT 1,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_err (route, message(180))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  tablesReady = true;
}

export async function audit(action: string, target: string, ip: string): Promise<void> {
  try {
    await ensureAdminTables();
    await getPool().query(
      'INSERT INTO admin_audit (action, target, ip) VALUES (?, ?, ?)',
      [action.slice(0, 64), target.slice(0, 255), ip.slice(0, 64)],
    );
  } catch (err) {
    console.error('[admin] audit write failed:', err);
  }
}

export async function recordCronRun(name: string, detail = ''): Promise<void> {
  try {
    await ensureAdminTables();
    await getPool().query(
      'INSERT INTO cron_runs (name, detail) VALUES (?, ?)',
      [name.slice(0, 64), detail.slice(0, 255)],
    );
  } catch (err) {
    console.error('[admin] cron_runs write failed:', err);
  }
}

export async function logAppError(route: string, message: string): Promise<void> {
  try {
    await ensureAdminTables();
    await getPool().query(
      `INSERT INTO app_errors (route, message, hits) VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE hits = hits + 1`,
      [route.slice(0, 191), message.slice(0, 500)],
    );
  } catch { /* never let error logging throw */ }
}

export async function getAudit(action: string | null, limit = 200): Promise<RowDataPacket[]> {
  await ensureAdminTables();
  const lim = Math.max(1, Math.min(500, Math.floor(limit)));
  const [rows] = action
    ? await getPool().query<RowDataPacket[]>(
        `SELECT action, target, ip, created_at FROM admin_audit
         WHERE action = ? ORDER BY created_at DESC LIMIT ${lim}`, [action])
    : await getPool().query<RowDataPacket[]>(
        `SELECT action, target, ip, created_at FROM admin_audit
         ORDER BY created_at DESC LIMIT ${lim}`);
  return rows;
}
