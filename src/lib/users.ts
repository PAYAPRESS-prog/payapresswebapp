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
  for (const ddl of [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name  VARCHAR(100) NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS company    VARCHAR(150) NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone      VARCHAR(30)  NULL`,
  ]) {
    await pool.query(ddl).catch(() => {});
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
