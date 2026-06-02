// MySQL connection pool — shared across API routes.
// Credentials come from environment variables (set in Hostinger hPanel
// → Node.js app → Environment variables, or in a local .env file).
//
// Required env vars:
//   DB_HOST       e.g. localhost  (Hostinger MySQL is usually on localhost)
//   DB_PORT       e.g. 3306
//   DB_USER       MySQL username from hPanel
//   DB_PASSWORD   MySQL password
//   DB_NAME       database name created in hPanel

import mysql, { type Pool } from 'mysql2/promise';

// Reuse the pool across hot-reloads / lambda invocations.
const globalForDb = globalThis as unknown as { __mysqlPool?: Pool };

export function getPool(): Pool {
  if (globalForDb.__mysqlPool) return globalForDb.__mysqlPool;

  const pool = mysql.createPool({
    host:     process.env.DB_HOST     ?? 'localhost',
    port:     Number(process.env.DB_PORT ?? 3306),
    user:     process.env.DB_USER     ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME     ?? '',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    // Hostinger shared MySQL closes idle connections; keep them fresh.
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
  });

  globalForDb.__mysqlPool = pool;
  return pool;
}

// Returns true if the DB env vars are present. API routes use this to fail
// gracefully with a clear message instead of throwing a connection error.
export function isDbConfigured(): boolean {
  return Boolean(process.env.DB_USER && process.env.DB_NAME);
}
