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

async function ensureTable() {
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
      INDEX (user_id, sort_order, created_at)
    )
  `);
  // Migrate older tables that predate these columns.
  for (const ddl of [
    `ALTER TABLE busbar_history ADD COLUMN IF NOT EXISTS name VARCHAR(120) NOT NULL DEFAULT ''`,
    `ALTER TABLE busbar_history ADD COLUMN IF NOT EXISTS price DECIMAL(20,4) NULL`,
    `ALTER TABLE busbar_history ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NULL`,
    `ALTER TABLE busbar_history ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0`,
  ]) {
    await pool.execute(ddl).catch(() => { /* column already exists / engine without IF NOT EXISTS */ });
  }
}

export async function listHistory(userId: number, limit = 50): Promise<HistoryRow[]> {
  if (!isDbConfigured()) return [];
  await ensureTable();
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT * FROM busbar_history WHERE user_id = ? ORDER BY sort_order ASC, created_at DESC LIMIT ?',
    [userId, limit],
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
export async function reorderHistory(userId: number, ids: number[]): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureTable();
  const pool = getPool();
  await Promise.all(
    ids.map((id, idx) =>
      pool.execute(
        'UPDATE busbar_history SET sort_order = ? WHERE id = ? AND user_id = ?',
        [idx, Number(id), userId],
      ),
    ),
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
