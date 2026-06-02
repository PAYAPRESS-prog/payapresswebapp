import { getPool, isDbConfigured } from './db';

export interface HistoryRow {
  id: number;
  user_id: number;
  metal: 'copper' | 'aluminum';
  width: number;
  thickness: number;
  length: number;
  created_at: string;
}

async function ensureTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS busbar_history (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      metal      VARCHAR(20) NOT NULL,
      width      INT NOT NULL,
      thickness  INT NOT NULL,
      length     INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id, created_at)
    )
  `);
}

export async function listHistory(userId: number, limit = 50): Promise<HistoryRow[]> {
  if (!isDbConfigured()) return [];
  await ensureTable();
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT * FROM busbar_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit],
  );
  return rows as HistoryRow[];
}

export async function saveHistory(
  userId: number,
  metal: string,
  width: number,
  thickness: number,
  length: number,
): Promise<number> {
  if (!isDbConfigured()) throw new Error('DB not configured');
  await ensureTable();
  const pool = getPool();
  const [res] = await pool.execute(
    'INSERT INTO busbar_history (user_id, metal, width, thickness, length) VALUES (?,?,?,?,?)',
    [userId, metal, width, thickness, length],
  ) as [{ insertId: number }, unknown];
  return res.insertId;
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
