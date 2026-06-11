import { getPool, isDbConfigured } from './db';

export interface HistoryRow {
  id: number;
  user_id: number;
  name: string;
  metal: 'copper' | 'aluminum';
  width: number;
  thickness: number;
  length: number;
  price: number | null;
  currency: string | null;
  sort_order: number;
  created_at: string;
}

// Run once per process lifetime — module-level flag prevents re-running on every request.
let _tableReady = false;

async function ensureTable() {
  if (_tableReady) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS busbar_history (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      name       VARCHAR(120) NOT NULL DEFAULT '',
      metal      VARCHAR(20) NOT NULL,
      width      INT NOT NULL,
      thickness  INT NOT NULL,
      length     INT NOT NULL,
      price      DECIMAL(20,4) NULL,
      currency   VARCHAR(10) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_history_user (user_id, sort_order, created_at)
    )
  `);
  // One-time schema migration for existing tables that predate these columns.
  // `ADD COLUMN IF NOT EXISTS` is MariaDB-only, so check information_schema
  // first to stay portable across plain MySQL.
  const migrations: Array<[string, string]> = [
    ['name',       `VARCHAR(120) NOT NULL DEFAULT ''`],
    ['price',      'DECIMAL(20,4) NULL'],
    ['currency',   'VARCHAR(10) NULL'],
    ['sort_order', 'INT NOT NULL DEFAULT 0'],
  ];
  const [existing] = await pool.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'busbar_history'`,
  ) as [Array<{ COLUMN_NAME: string }>, unknown];
  const have = new Set(existing.map(r => String(r.COLUMN_NAME).toLowerCase()));
  for (const [col, type] of migrations) {
    if (have.has(col)) continue;
    await pool.execute(`ALTER TABLE busbar_history ADD COLUMN ${col} ${type}`).catch(err => {
      console.error(`[history] failed to add column ${col}:`, err);
    });
  }
  _tableReady = true;
}

export async function listHistory(userId: number, limit = 50): Promise<HistoryRow[]> {
  if (!isDbConfigured()) return [];
  await ensureTable();
  const pool = getPool();
  // LIMIT ? breaks in mysql2 prepared statements on many MySQL versions
  // (ER_WRONG_ARGUMENTS) — inline the sanitized integer instead.
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(limit) || 50));
  const [rows] = await pool.execute(
    `SELECT * FROM busbar_history WHERE user_id = ? ORDER BY sort_order ASC, created_at DESC LIMIT ${safeLimit}`,
    [userId],
  );
  return rows as HistoryRow[];
}

export async function saveHistory(
  userId: number,
  name: string,
  metal: string,
  width: number,
  thickness: number,
  length: number,
  price: number | null = null,
  currency: string | null = null,
): Promise<number> {
  if (!isDbConfigured()) throw new Error('DB not configured');
  await ensureTable();
  const pool = getPool();
  // New saves go to the top of the list (smallest sort_order).
  const [minRows] = await pool.execute(
    'SELECT COALESCE(MIN(sort_order), 0) AS minOrder FROM busbar_history WHERE user_id = ?',
    [userId],
  ) as [Array<{ minOrder: number }>, unknown];
  const nextOrder = (Number(minRows[0]?.minOrder ?? 0)) - 1;
  const [res] = await pool.execute(
    'INSERT INTO busbar_history (user_id, name, metal, width, thickness, length, price, currency, sort_order) VALUES (?,?,?,?,?,?,?,?,?)',
    [userId, name, metal, width, thickness, length, price, currency, nextOrder],
  ) as [{ insertId: number }, unknown];
  return res.insertId;
}

// Persist a new manual ordering. `ids` is the full ordered list of the
// user's history rows (top first). Rows not owned by the user are ignored.
// Single UPDATE … CASE WHEN replaces N separate round-trips.
export async function reorderHistory(userId: number, ids: number[]): Promise<void> {
  if (!isDbConfigured() || ids.length === 0) return;
  await ensureTable();
  const pool = getPool();
  const whenClauses  = ids.map((_, i) => `WHEN ? THEN ${i}`).join(' ');
  const placeholders = ids.map(() => '?').join(',');
  await pool.execute(
    `UPDATE busbar_history
     SET sort_order = CASE id ${whenClauses} ELSE sort_order END
     WHERE user_id = ? AND id IN (${placeholders})`,
    [...ids, userId, ...ids],
  );
}

export async function deleteHistory(userId: number, id: number): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureTable();
  const pool = getPool();
  await pool.execute(
    'DELETE FROM busbar_history WHERE id = ? AND user_id = ?',
    [id, userId],
  );
}
