// User repository — table bootstrap + queries.
// The users table is created on first use (CREATE TABLE IF NOT EXISTS) so no
// separate migration step is needed on Hostinger.

import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getPool } from './db';

let tableReady = false;

async function ensureTable(): Promise<void> {
  if (tableReady) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
      email         VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      opt_in        TINYINT(1)   NOT NULL DEFAULT 0,
      created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  // Migrate older tables that predate profile columns.
  // `ADD COLUMN IF NOT EXISTS` is MariaDB-only, so check information_schema
  // first to stay portable across plain MySQL.
  const profileColumns: Array<[string, string]> = [
    ['first_name', 'VARCHAR(100) NULL'],
    ['last_name',  'VARCHAR(100) NULL'],
    ['company',    'VARCHAR(150) NULL'],
    ['phone',      'VARCHAR(30)  NULL'],
  ];
  const [existing] = await pool.query<RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`,
  );
  const have = new Set(existing.map(r => String(r.COLUMN_NAME).toLowerCase()));
  for (const [col, type] of profileColumns) {
    if (have.has(col)) continue;
    await pool.query(`ALTER TABLE users ADD COLUMN ${col} ${type}`).catch(err => {
      console.error(`[users] failed to add column ${col}:`, err);
    });
  }
  tableReady = true;
}

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  opt_in: number;
};

export type ProfileRow = {
  id: number;
  email: string;
  first_name: string | null;
  last_name:  string | null;
  company:    string | null;
  phone:      string | null;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  await ensureTable();
  const pool = getPool();
  const [rows] = await pool.query<(UserRow & RowDataPacket)[]>(
    'SELECT id, email, password_hash, opt_in FROM users WHERE email = ? LIMIT 1',
    [email.toLowerCase()],
  );
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<(UserRow & ProfileRow) | null> {
  await ensureTable();
  const pool = getPool();
  const [rows] = await pool.query<((UserRow & ProfileRow) & RowDataPacket)[]>(
    'SELECT id, email, password_hash, opt_in, first_name, last_name, company, phone FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  optIn: boolean,
): Promise<number> {
  await ensureTable();
  const pool = getPool();
  const [res] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, password_hash, opt_in) VALUES (?, ?, ?)',
    [email.toLowerCase(), passwordHash, optIn ? 1 : 0],
  );
  return res.insertId;
}

export async function updateProfile(
  id: number,
  fields: { first_name?: string; last_name?: string; company?: string; phone?: string },
): Promise<void> {
  await ensureTable();
  const pool = getPool();
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k} = ?`);
    vals.push(v ?? null);
  }
  if (sets.length === 0) return;
  vals.push(id);
  await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
}

export async function updatePasswordHash(id: number, newHash: string): Promise<void> {
  await ensureTable();
  const pool = getPool();
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, id]);
}

// ── Account deletion with audit archive ─────────────────────────────
// The user's operational data (profile, history, subscription) is truly
// removed; a minimal audit record is retained in deleted_accounts for
// fraud prevention and support ("who deleted, when, what did the
// account look like"). Disclose retention in the privacy policy.

let _archiveReady = false;

async function ensureArchiveTable(): Promise<void> {
  if (_archiveReady) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS deleted_accounts (
      id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
      original_uid   INT UNSIGNED NOT NULL,
      email          VARCHAR(255) NOT NULL,
      first_name     VARCHAR(100) NULL,
      last_name      VARCHAR(100) NULL,
      company        VARCHAR(150) NULL,
      phone          VARCHAR(30)  NULL,
      opt_in         TINYINT(1)   NOT NULL DEFAULT 0,
      history_count  INT          NOT NULL DEFAULT 0,
      registered_at  TIMESTAMP    NULL,
      deleted_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ip             VARCHAR(64)  NULL,
      user_agent     VARCHAR(512) NULL,
      PRIMARY KEY (id),
      INDEX idx_deleted_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  _archiveReady = true;
}

export async function archiveAndDeleteUser(
  uid: number,
  meta: { ip: string; userAgent: string },
): Promise<void> {
  await ensureArchiveTable();
  const pool = getPool();

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, email, first_name, last_name, company, phone, opt_in, created_at
     FROM users WHERE id = ? LIMIT 1`, [uid]);
  const u = rows[0];
  if (!u) return;

  const [hist] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM busbar_history WHERE user_id = ?', [uid]);
  const historyCount = Number(hist[0]?.c) || 0;

  await pool.query(
    `INSERT INTO deleted_accounts
       (original_uid, email, first_name, last_name, company, phone, opt_in,
        history_count, registered_at, ip, user_agent)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [u.id, u.email, u.first_name, u.last_name, u.company, u.phone, u.opt_in,
     historyCount, u.created_at, meta.ip.slice(0, 64), meta.userAgent.slice(0, 512)],
  );

  // Hard-delete the operational data — the app genuinely forgets them.
  await pool.query('DELETE FROM busbar_history WHERE user_id = ?', [uid]);
  await pool.query('DELETE FROM email_subscriptions WHERE email = ?', [u.email]).catch(() => {});
  await pool.query('DELETE FROM users WHERE id = ?', [uid]);
}
