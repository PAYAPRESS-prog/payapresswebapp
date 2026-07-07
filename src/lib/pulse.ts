import { getPool, isDbConfigured } from './db';
import type { RowDataPacket } from 'mysql2';

// ── Busbar Pulse — micro-survey engine (server side) ─────────────
// Self-healing tables, question-schema validation, seeded defaults,
// and a 5-minute in-memory cache for the public active-survey lookup.

export type QuestionType = 'emoji' | 'nps' | 'single' | 'multi' | 'text';
export interface PulseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  options?: string[];
  required?: boolean;
  max?: number;
}
export type PulseTrigger =
  | 'post_calculate' | 'post_bookmark' | 'post_waste' | 'post_panel'
  | 'nth_visit' | 'manual';

const TRIGGERS: PulseTrigger[] = [
  'post_calculate', 'post_bookmark', 'post_waste', 'post_panel', 'nth_visit', 'manual',
];

let tablesReady = false;

export async function ensurePulseTables(): Promise<void> {
  if (tablesReady || !isDbConfigured()) return;
  const pool = getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS surveys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(160) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 0,
    trigger_kind VARCHAR(24) NOT NULL DEFAULT 'manual',
    trigger_n INT NOT NULL DEFAULT 1,
    questions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await pool.query(`CREATE TABLE IF NOT EXISTS survey_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    visitor_id VARCHAR(64) NOT NULL,
    user_id INT NULL,
    answers JSON NOT NULL,
    partial TINYINT(1) NOT NULL DEFAULT 1,
    email VARCHAR(190) NULL,
    page VARCHAR(190) NOT NULL DEFAULT '',
    device VARCHAR(32) NOT NULL DEFAULT '',
    country VARCHAR(80) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_resp (survey_id, visitor_id),
    INDEX idx_resp_time (survey_id, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await seedDefaults();
  tablesReady = true;
}

// Validate a questions array against the schema. Returns cleaned copy.
export function validateQuestions(raw: unknown): PulseQuestion[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 12) return null;
  const out: PulseQuestion[] = [];
  const seen = new Set<string>();
  for (const q of raw) {
    if (typeof q !== 'object' || q === null) return null;
    const o = q as Record<string, unknown>;
    const id = String(o.id ?? '').slice(0, 32);
    const type = String(o.type ?? '') as QuestionType;
    const title = String(o.title ?? '').trim().slice(0, 200);
    if (!id || seen.has(id) || !title) return null;
    if (!['emoji', 'nps', 'single', 'multi', 'text'].includes(type)) return null;
    seen.add(id);
    const cleaned: PulseQuestion = { id, type, title };
    if (type === 'single' || type === 'multi') {
      const opts = Array.isArray(o.options)
        ? o.options.map(v => String(v).trim().slice(0, 80)).filter(Boolean).slice(0, 10)
        : [];
      if (opts.length < 2) return null;
      cleaned.options = opts;
    }
    if (type === 'text') cleaned.max = Math.min(1000, Number(o.max) || 280);
    if (o.required === true) cleaned.required = true;
    out.push(cleaned);
  }
  return out;
}

// Validate a single answer value for a question.
function answerOk(q: PulseQuestion, v: unknown): boolean {
  switch (q.type) {
    case 'emoji': return Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5;
    case 'nps':   return Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 10;
    case 'single': return typeof v === 'string' && (q.options ?? []).includes(v);
    case 'multi':
      return Array.isArray(v) && v.length <= (q.options?.length ?? 0)
        && v.every(x => typeof x === 'string' && (q.options ?? []).includes(x));
    case 'text': return typeof v === 'string' && v.length <= (q.max ?? 280);
  }
}

export function validateAnswers(
  questions: PulseQuestion[],
  answers: unknown,
): Record<string, unknown> | null {
  if (typeof answers !== 'object' || answers === null) return null;
  const src = answers as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) {
    const q = questions.find(x => x.id === k);
    if (!q) return null;                 // unknown question id → reject
    if (v === null || v === undefined) continue; // skipped
    if (!answerOk(q, v)) return null;
    out[k] = v;
  }
  return out;
}

// ── Seeds ─────────────────────────────────────────────────────────
async function seedDefaults(): Promise<void> {
  const pool = getPool();
  const defaultQuestions: PulseQuestion[] = [
    { id: 'mood', type: 'emoji', title: 'How happy are you with the calculator so far?' },
    { id: 'use', type: 'single', title: 'What do you mainly use it for?',
      options: ['Panel building', 'Quoting & sales', 'Engineering checks', 'Studying', 'Other'] },
    { id: 'missing', type: 'multi', title: "What's holding you back or missing?",
      options: ['Price accuracy', 'More metals & profiles', 'More currencies',
        'Standards & ampacity depth', 'Export or PDF of results', 'Mobile experience',
        'Speed', "Nothing — it's great"] },
    { id: 'nps', type: 'nps', title: 'How likely are you to recommend it to a colleague?' },
    { id: 'wish', type: 'text', title: 'One thing we should fix or build next?', max: 500 },
  ];
  await pool.query(
    `INSERT IGNORE INTO surveys (slug, title, active, trigger_kind, trigger_n, questions)
     VALUES (?, ?, 1, 'post_calculate', 3, ?)`,
    ['default-pulse', 'Help us make Busbar Calculator better',
      JSON.stringify(defaultQuestions)],
  );
  const wasteQuestions: PulseQuestion[] = [
    { id: 'mood', type: 'emoji', title: 'How useful was the waste calculation?' },
    { id: 'wish', type: 'text', title: 'Anything the waste tool should also cover?', max: 500 },
  ];
  await pool.query(
    `INSERT IGNORE INTO surveys (slug, title, active, trigger_kind, trigger_n, questions)
     VALUES (?, ?, 0, 'post_waste', 1, ?)`,
    ['post-waste-check', 'Post-waste check', JSON.stringify(wasteQuestions)],
  );
  const panelQuestions: PulseQuestion[] = [
    { id: 'mood', type: 'emoji', title: 'How useful was the EPLAN panel cost tool?' },
    { id: 'wish', type: 'text', title: 'What would make the panel import better?', max: 500 },
  ];
  await pool.query(
    `INSERT IGNORE INTO surveys (slug, title, active, trigger_kind, trigger_n, questions)
     VALUES (?, ?, 0, 'post_panel', 1, ?)`,
    ['post-panel-check', 'Post-panel check', JSON.stringify(panelQuestions)],
  );
}

// ── Active-survey lookup with a 5-minute cache ────────────────────
const cache = new Map<string, { at: number; data: SurveyRow | null }>();
const CACHE_MS = 5 * 60_000;

export interface SurveyRow {
  id: number; slug: string; title: string; active: number;
  trigger_kind: PulseTrigger; trigger_n: number; questions: PulseQuestion[];
}

function parseRow(r: RowDataPacket): SurveyRow {
  const questions = typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions;
  return { id: r.id, slug: r.slug, title: r.title, active: r.active,
    trigger_kind: r.trigger_kind, trigger_n: r.trigger_n, questions };
}

export function isValidTrigger(t: string): t is PulseTrigger {
  return (TRIGGERS as string[]).includes(t);
}

export async function getActiveSurvey(trigger: PulseTrigger): Promise<SurveyRow | null> {
  const hit = cache.get(trigger);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  await ensurePulseTables();
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT id, slug, title, active, trigger_kind, trigger_n, questions
     FROM surveys WHERE active = 1 AND trigger_kind = ? ORDER BY id DESC LIMIT 1`,
    [trigger]);
  const data = rows[0] ? parseRow(rows[0]) : null;
  cache.set(trigger, { at: Date.now(), data });
  return data;
}

export function bustSurveyCache(): void { cache.clear(); }

export async function getSurveyById(id: number): Promise<SurveyRow | null> {
  await ensurePulseTables();
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT id, slug, title, active, trigger_kind, trigger_n, questions
     FROM surveys WHERE id = ? LIMIT 1`, [id]);
  return rows[0] ? parseRow(rows[0]) : null;
}
