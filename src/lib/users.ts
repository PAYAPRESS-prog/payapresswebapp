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
  tableReady = true;
}

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  opt_in: number;
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
