/* Busbar Panel Cost — EPLAN import engine (pure, client-safe).
   Parses delimited copper-parts exports (CSV/TSV/clipboard), auto-maps
   German/English EPLAN headers, groups rows by cross-section, packs
   pieces into stock bars (first-fit-decreasing) to find offcut scrap,
   and prices everything with the app's FROZEN waste formulas:
     kerf width  = max(0.5, bladeØ × 0.015)  [mm]
     punch slug  = π × (d/2)² × T            [mm³]
     weight (kg) = volume mm³ × density ÷ 1,000,000                  */

// ── Parsing ───────────────────────────────────────────────────────

/** Decode a raw file buffer: handles UTF-8/UTF-16LE/UTF-16BE BOMs
    (EPLAN .txt exports are frequently UTF-16LE) and strips the BOM. */
export function decodeBuffer(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  let enc = 'utf-8';
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) enc = 'utf-16le';
  else if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) enc = 'utf-16be';
  else if (b.length >= 4 && b[0] !== 0 && b[1] === 0 && b[2] !== 0 && b[3] === 0) enc = 'utf-16le';
  return new TextDecoder(enc).decode(buf).replace(/^\ufeff/, '');
}

export interface ParsedTable {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

/** Detect ; , or tab by scoring the first non-empty lines. */
export function detectDelimiter(text: string): string {
  const lines = text.split(/\r?\n/).filter(l => l.trim()).slice(0, 5);
  let best = ',';
  let bestScore = -1;
  for (const d of ['\t', ';', ',']) {
    const counts = lines.map(l => splitDelimited(l, d).length);
    if (!counts.length) continue;
    const min = Math.min(...counts);
    const score = min > 1 && counts.every(c => c === counts[0]) ? min * 2 : min;
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

/** Split one line honouring simple "quoted" fields. */
function splitDelimited(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === delim && !quoted) {
      out.push(cur); cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

export function parseDelimited(text: string): ParsedTable {
  const delimiter = detectDelimiter(text.replace(/^\ufeff/, ''));
  const lines = text.replace(/^\ufeff/, '').split(/\r?\n/).filter(l => l.trim().length > 0);
  const all = lines.map(l => splitDelimited(l, delimiter));
  const first = all[0] ?? [];
  // Headerless export: if every non-empty first-row cell is a number the
  // file has no header row — synthesize Column 1..N and keep the data.
  const numericFirst = first.length > 1 &&
    first.filter(c => c !== '').every(c => parseLocaleNumber(c) !== null);
  if (numericFirst) {
    return {
      headers: first.map((_, i) => `Column ${i + 1}`),
      rows: all,
      delimiter,
    };
  }
  return { headers: first, rows: all.slice(1), delimiter };
}

/** Parse a number that may use German locale (1.234,5) or plain (1234.5). */
export function parseLocaleNumber(raw: string): number | null {
  // Strip trailing unit text ("1.250,5 mm", "40 mm") and thin/normal
  // spaces used as thousands separators ("1 250,5").
  const s = raw.trim()
    .replace(/(mm|cm|m|stk|pcs|x)\s*$/i, '')
    .replace(/[\s\u00a0\u202f]/g, '');
  if (!s || /[a-df-z]/i.test(s)) return null;
  let normalized = s;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    // Both present: the later one is the decimal separator.
    normalized = lastComma > lastDot
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (lastComma > -1) {
    // Only comma → decimal comma (EPLAN's German exports).
    normalized = s.replace(/\./g, '').replace(',', '.');
  }
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

// ── Column auto-mapping ───────────────────────────────────────────

export type FieldKey =
  | 'qty' | 'length' | 'width' | 'thickness' | 'section' | 'material' | 'part';

const SYNONYMS: Record<FieldKey, string[]> = {
  qty:       ['menge', 'anzahl', 'stück', 'stueck', 'stk', 'qty', 'quantity', 'count', 'pcs', 'pieces'],
  length:    ['zuschnittslänge', 'zuschnittslaenge', 'gestreckte länge', 'gestreckte laenge',
              'schnittlänge', 'schnittlaenge', 'länge', 'laenge', 'cutting length',
              'stretched length', 'length', 'len', 'l'],
  width:     ['schienenbreite', 'breite', 'width', 'b', 'w'],
  thickness: ['materialdicke', 'materialstärke', 'materialstaerke', 'höhe', 'hoehe', 'dicke',
              'stärke', 'staerke', 'thickness', 'height', 'h', 't', 'd'],
  section:   ['querschnitt', 'abmessung', 'abmessungen', 'cross-section', 'cross section',
              'section', 'dimension', 'dimensions', 'profil', 'profile', 'size'],
  material:  ['werkstoff', 'material'],
  part:      ['bezeichnung', 'benennung', 'teil', 'artikel', 'artikelnummer', 'part',
              'part number', 'description', 'designation', 'name'],
};

/** Normalise a header for matching: lowercase, quotes gone, bracketed
    units stripped — "Länge [mm]" and "Length (mm)" both become the
    bare word. */
function normHeader(h: string): string {
  return h.toLowerCase()
    .replace(/["']/g, '')
    .replace(/\[[^\]]*\]|\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function autoMapColumns(headers: string[]): Partial<Record<FieldKey, number>> {
  const map: Partial<Record<FieldKey, number>> = {};
  const norm = headers.map(normHeader);
  for (const key of Object.keys(SYNONYMS) as FieldKey[]) {
    for (const syn of SYNONYMS[key]) {
      const idx = norm.findIndex((h, i) =>
        !Object.values(map).includes(i) && (h === syn || h.startsWith(syn + ' ')));
      if (idx > -1) { map[key] = idx; break; }
    }
  }
  // If separate width+thickness were found, drop a stray section match
  // so one column never double-feeds the dimensions.
  if (map.width !== undefined && map.thickness !== undefined) delete map.section;
  return map;
}

/** Parse a combined cross-section cell: "40x10", "40 X 10", "40×10",
    "40*10", "40/10" — returns [width, thickness] or null. */
export function parseSection(raw: string): [number, number] | null {
  const m = raw.trim().match(/^\s*([\d.,]+)\s*[x×*\/]\s*([\d.,]+)\s*(?:mm)?\s*$/i);
  if (!m) return null;
  const w = parseLocaleNumber(m[1]);
  const t = parseLocaleNumber(m[2]);
  return w !== null && t !== null && w > 0 && t > 0 ? [w, t] : null;
}

// ── Normalisation ─────────────────────────────────────────────────

export interface PanelRow {
  qty: number;
  length: number;      // mm
  width: number;       // mm
  thickness: number;   // mm
  part?: string;
}

export interface NormalizeResult {
  rows: PanelRow[];
  flagged: Array<{ line: number; reason: string }>;
}

export function normalizeRows(
  table: ParsedTable,
  mapping: Partial<Record<FieldKey, number>>,
  lengthUnit: 'mm' | 'cm' | 'm' = 'mm',
): NormalizeResult {
  const factor = lengthUnit === 'm' ? 1000 : lengthUnit === 'cm' ? 10 : 1;
  const rows: PanelRow[] = [];
  const flagged: NormalizeResult['flagged'] = [];
  table.rows.forEach((r, i) => {
    const get = (k: FieldKey) => (mapping[k] !== undefined ? r[mapping[k]!] ?? '' : '');
    const qty = parseLocaleNumber(get('qty')) ?? 1;
    const length = parseLocaleNumber(get('length'));
    let width = parseLocaleNumber(get('width'));
    let thickness = parseLocaleNumber(get('thickness'));
    // Combined "Querschnitt" column (e.g. "40x10") fills missing dims.
    if ((width === null || thickness === null) && mapping.section !== undefined) {
      const sec = parseSection(get('section'));
      if (sec) { width = width ?? sec[0]; thickness = thickness ?? sec[1]; }
    }
    if (length === null || width === null || thickness === null) {
      flagged.push({ line: i + 2, reason: 'unreadable number' });
      return;
    }
    if (length <= 0 || width <= 0 || thickness <= 0 || qty <= 0) {
      flagged.push({ line: i + 2, reason: 'non-positive value' });
      return;
    }
    rows.push({
      qty: Math.round(qty),
      length: length * factor,
      width, thickness,
      part: mapping.part !== undefined ? get('part') : undefined,
    });
  });
  return { rows, flagged };
}

// ── Grouping & packing ────────────────────────────────────────────

export interface SectionGroup {
  width: number;
  thickness: number;
  pieces: number;          // total piece count (qty expanded)
  cuts: number;            // one saw cut per piece
  totalLength: number;     // mm, sum of piece lengths
  lengths: number[];       // expanded piece lengths (for packing)
}

export function groupBySection(rows: PanelRow[]): SectionGroup[] {
  const map = new Map<string, SectionGroup>();
  for (const r of rows) {
    const key = `${r.width}x${r.thickness}`;
    let g = map.get(key);
    if (!g) {
      g = { width: r.width, thickness: r.thickness, pieces: 0, cuts: 0, totalLength: 0, lengths: [] };
      map.set(key, g);
    }
    for (let i = 0; i < r.qty; i++) g.lengths.push(r.length);
    g.pieces += r.qty;
    g.cuts += r.qty;
    g.totalLength += r.length * r.qty;
  }
  return Array.from(map.values())
    .sort((a, b) => b.width * b.thickness - a.width * a.thickness);
}

export interface PackResult { bars: number; offcut: number /* mm */ }

/** First-fit-decreasing packing into stock bars; each placed piece also
    consumes one kerf width. Pieces longer than a stock bar count as
    ceil(len/stock) bars with the remainder treated as a normal piece. */
export function packBars(lengths: number[], stockLen: number, kerf: number): PackResult {
  if (stockLen <= 0) return { bars: 0, offcut: 0 };
  let extraBars = 0;
  const pieces: number[] = [];
  for (const raw of lengths) {
    let len = raw;
    while (len > stockLen) { extraBars++; len -= stockLen; }
    if (len > 0) pieces.push(len);
  }
  pieces.sort((a, b) => b - a);
  const remaining: number[] = [];
  for (const p of pieces) {
    const need = p + kerf;
    let placed = false;
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] >= need) { remaining[i] -= need; placed = true; break; }
    }
    if (!placed) remaining.push(stockLen - need);
  }
  const offcut = remaining.reduce((a, b) => a + Math.max(0, b), 0);
  return { bars: remaining.length + extraBars, offcut };
}

// ── Cost computation (frozen formulas) ────────────────────────────

export function kerfWidth(bladeDia: number): number {
  return Math.max(0.5, bladeDia * 0.015);
}

export interface PanelSettings {
  stockLen: number;     // mm
  bladeDia: number;     // mm
  punchDia: number;     // mm (0 = none)
  punchCount: number;   // total punch-outs across the panel section
  extraScrapPct: number; // 0..100
}

export interface SectionCost {
  width: number; thickness: number;
  pieces: number; bars: number;
  totalLength: number;   // mm
  grossKg: number;
  kerfKg: number;
  offcutKg: number;
  wastePct: number;
}

export interface PanelTotals {
  sections: SectionCost[];
  grossKg: number;
  kerfKg: number;
  punchKg: number;
  offcutKg: number;
  extraKg: number;
  totalWasteKg: number;
  netKg: number;
  costUSD: (pricePerKgUSD: number) => {
    gross: number; kerf: number; punch: number; offcut: number; extra: number; net: number; total: number;
  };
}

export function computePanel(
  groups: SectionGroup[],
  settings: PanelSettings,
  density: number, // g/cm³
): PanelTotals {
  const kw = kerfWidth(settings.bladeDia);
  const kgOf = (mm3: number) => (mm3 * density) / 1_000_000;

  const sections: SectionCost[] = groups.map(g => {
    const area = g.width * g.thickness;                 // mm²
    const grossKg = kgOf(g.totalLength * area);
    const kerfKg = kgOf(g.cuts * kw * area);
    const { bars, offcut } = packBars(g.lengths, settings.stockLen, kw);
    const offcutKg = kgOf(offcut * area);
    const wasteKg = kerfKg + offcutKg;
    return {
      width: g.width, thickness: g.thickness,
      pieces: g.pieces, bars,
      totalLength: g.totalLength,
      grossKg, kerfKg, offcutKg,
      wastePct: grossKg > 0 ? (wasteKg / (grossKg + wasteKg)) * 100 : 0,
    };
  });

  const grossKg = sections.reduce((a, s) => a + s.grossKg, 0);
  const kerfKg = sections.reduce((a, s) => a + s.kerfKg, 0);
  const offcutKg = sections.reduce((a, s) => a + s.offcutKg, 0);
  // Punch slugs: frozen formula, thickness taken per punch from the
  // average section thickness (punches are specified panel-wide).
  const avgT = sections.length
    ? sections.reduce((a, s) => a + s.thickness, 0) / sections.length : 0;
  const punchKg = settings.punchDia > 0 && settings.punchCount > 0
    ? kgOf(settings.punchCount * Math.PI * (settings.punchDia / 2) ** 2 * avgT)
    : 0;
  const extraKg = (grossKg * Math.max(0, settings.extraScrapPct)) / 100;
  const totalWasteKg = kerfKg + punchKg + offcutKg + extraKg;
  const netKg = grossKg;

  return {
    sections, grossKg, kerfKg, punchKg, offcutKg, extraKg, totalWasteKg, netKg,
    costUSD: (p: number) => ({
      gross: grossKg * p,
      kerf: kerfKg * p,
      punch: punchKg * p,
      offcut: offcutKg * p,
      extra: extraKg * p,
      net: netKg * p,
      total: (grossKg + totalWasteKg) * p,
    }),
  };
}

/** 5-row sample CSV (German-style headers) for the "try it" download. */
export const SAMPLE_CSV = [
  'Menge;Bezeichnung;Breite;Höhe;Länge',
  '4;Sammelschiene L1;40;10;1.250,5',
  '4;Sammelschiene L2;40;10;980',
  '2;Abgang Q1;30;5;445,25',
  '6;Verbinder;20;5;210',
  '1;Erdungsschiene;25;3;1750',
].join('\n');

// ── XLSX support (no dependencies) ────────────────────────────────
// An .xlsx file is a ZIP of XML parts. We read the central directory,
// inflate entries with the browser-native DecompressionStream
// ('deflate-raw', also available in Node 18+), then extract the first
// worksheet's cells + sharedStrings. Covers EPLAN's Excel exports.

function u16(b: Uint8Array, o: number): number { return b[o] | (b[o + 1] << 8); }
function u32(b: Uint8Array, o: number): number {
  return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function readZip(buf: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const b = new Uint8Array(buf);
  // find End Of Central Directory (0x06054b50) scanning from the tail
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 65536); i--) {
    if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 0x05 && b[i + 3] === 0x06) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip');
  const count = u16(b, eocd + 10);
  let off = u32(b, eocd + 16);
  const files = new Map<string, Uint8Array>();
  const dec = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (u32(b, off) !== 0x02014b50) break;
    const method = u16(b, off + 10);
    const csize = u32(b, off + 20);
    const nameLen = u16(b, off + 28);
    const extraLen = u16(b, off + 30);
    const commentLen = u16(b, off + 32);
    const localOff = u32(b, off + 42);
    const name = dec.decode(b.subarray(off + 46, off + 46 + nameLen));
    // local header: skip its own (possibly different) name/extra lengths
    const lNameLen = u16(b, localOff + 26);
    const lExtraLen = u16(b, localOff + 28);
    const dataStart = localOff + 30 + lNameLen + lExtraLen;
    const raw = b.subarray(dataStart, dataStart + csize);
    if (/\.xml$/.test(name)) {
      files.set(name, method === 8 ? await inflateRaw(raw) : raw.slice());
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function xmlUnescape(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

function colToIndex(ref: string): number {
  let n = 0;
  for (const ch of ref) {
    if (ch >= 'A' && ch <= 'Z') n = n * 26 + (ch.charCodeAt(0) - 64);
    else break;
  }
  return Math.max(0, n - 1);
}

export async function parseXlsx(buf: ArrayBuffer): Promise<ParsedTable> {
  const files = await readZip(buf);
  // shared strings (each <si> may hold several <t> runs)
  const shared: string[] = [];
  const ss = files.get('xl/sharedStrings.xml');
  if (ss) {
    const xml = new TextDecoder().decode(ss);
    for (const si of xml.match(/<si[\s>][\s\S]*?<\/si>/g) ?? []) {
      const runs = si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) ?? [];
      shared.push(xmlUnescape(runs.map(r => r.replace(/<t[^>]*>|<\/t>/g, '')).join('')));
    }
  }
  const sheetName =
    ['xl/worksheets/sheet1.xml',
      ...Array.from(files.keys()).filter(k => /^xl\/worksheets\/sheet\d+\.xml$/.test(k)).sort()]
      .find(k => files.has(k));
  if (!sheetName) throw new Error('no worksheet');
  const xml = new TextDecoder().decode(files.get(sheetName)!);

  const matrix: string[][] = [];
  for (const rowXml of xml.match(/<row[\s>][\s\S]*?<\/row>/g) ?? []) {
    const cells: string[] = [];
    const cellRe = /<c\b([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let m: RegExpExecArray | null;
    let autoCol = 0;
    while ((m = cellRe.exec(rowXml)) !== null) {
      const attrs = m[1] ?? '';
      const inner = m[2] ?? '';
      const refMatch = attrs.match(/r="([A-Z]+)\d+"/);
      const col = refMatch ? colToIndex(refMatch[1]) : autoCol;
      autoCol = col + 1;
      const type = (attrs.match(/t="(\w+)"/) ?? [])[1];
      let val = '';
      if (type === 'inlineStr') {
        const runs = inner.match(/<t[^>]*>([\s\S]*?)<\/t>/g) ?? [];
        val = xmlUnescape(runs.map(r => r.replace(/<t[^>]*>|<\/t>/g, '')).join(''));
      } else {
        const v = (inner.match(/<v>([\s\S]*?)<\/v>/) ?? [])[1] ?? '';
        val = type === 's' ? (shared[parseInt(v, 10)] ?? '') : xmlUnescape(v);
      }
      while (cells.length < col) cells.push('');
      cells[col] = val.trim();
    }
    matrix.push(cells);
  }
  const nonEmpty = matrix.filter(r => r.some(c => c !== ''));
  if (nonEmpty.length === 0) throw new Error('empty sheet');
  const width = Math.max(...nonEmpty.map(r => r.length));
  const rows = nonEmpty.map(r => { const c = r.slice(); while (c.length < width) c.push(''); return c; });
  const first = rows[0];
  const numericFirst = first.filter(c => c !== '').length > 1 &&
    first.filter(c => c !== '').every(c => parseLocaleNumber(c) !== null);
  if (numericFirst) {
    return { headers: first.map((_, i) => `Column ${i + 1}`), rows, delimiter: 'xlsx' };
  }
  return { headers: first, rows: rows.slice(1), delimiter: 'xlsx' };
}

// ── Import audit (discrepancy checks) ─────────────────────────────
// Three layers of validation, each issue carrying WHY it matters and
// HOW to fix it. 'error' blocks the calculation, 'warning' lets the
// user continue but tells them accuracy may suffer.

export interface ImportIssue {
  severity: 'error' | 'warning';
  code: string;
  title: string;
  fix: string;
  lines?: number[];
}

const cap = (lines: number[]) => lines.slice(0, 8);

/** Layer 1 — file structure, right after parsing. */
export function auditTable(table: ParsedTable): ImportIssue[] {
  const issues: ImportIssue[] = [];
  if (table.headers.length < 2) {
    issues.push({
      severity: 'error', code: 'single-column',
      title: 'Only one column was detected',
      fix: 'The delimiter was probably not recognised. Export from EPLAN as CSV with semicolons (or copy the table straight from Excel and use Paste).',
    });
  }
  if (table.rows.length === 0) {
    issues.push({
      severity: 'error', code: 'no-rows',
      title: 'The file has a header but no data rows',
      fix: 'Check that the EPLAN report actually contains busbar parts, then export again.',
    });
  }
  const ragged = table.rows
    .map((r, i) => ({ i: i + 2, n: r.filter(c => c !== '').length ? r.length : -1 }))
    .filter(x => x.n > -1 && x.n !== table.headers.length)
    .map(x => x.i);
  if (ragged.length > 0 && ragged.length > table.rows.length * 0.2) {
    issues.push({
      severity: 'warning', code: 'ragged',
      title: `${ragged.length} rows have a different number of columns than the header`,
      fix: 'Some cells may contain unquoted delimiters (e.g. a ; inside a description). Re-export as XLSX, or check these lines.',
      lines: cap(ragged),
    });
  }
  const dupes = table.headers.filter((h, i) => h && table.headers.indexOf(h) !== i);
  if (dupes.length) {
    issues.push({
      severity: 'warning', code: 'dup-headers',
      title: `Duplicate column names: ${Array.from(new Set(dupes)).join(', ')}`,
      fix: 'Auto-mapping picks the first match — double-check the column dropdowns in the next step.',
    });
  }
  if (table.rows.length > 5000) {
    issues.push({
      severity: 'warning', code: 'huge',
      title: `${table.rows.length} rows is a very large export`,
      fix: 'Everything still works, but consider exporting one panel at a time for easier review.',
    });
  }
  return issues;
}

/** Layer 2+3 — after mapping & normalisation: data plausibility. */
export function auditRows(
  result: NormalizeResult,
  table: ParsedTable,
  mapping: Partial<Record<FieldKey, number>>,
  lengthUnit: 'mm' | 'cm' | 'm',
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const { rows, flagged } = result;

  if (flagged.length > 0) {
    const unreadable = flagged.filter(f => f.reason === 'unreadable number');
    const nonPositive = flagged.filter(f => f.reason === 'non-positive value');
    if (unreadable.length) {
      issues.push({
        severity: rows.length ? 'warning' : 'error', code: 'unreadable',
        title: `${unreadable.length} rows have numbers that could not be read`,
        fix: 'Open the file at these lines and check the mapped columns — text like "n/a" or merged cells cannot be calculated. German decimals (1.250,5) are fine.',
        lines: cap(unreadable.map(f => f.line)),
      });
    }
    if (nonPositive.length) {
      issues.push({
        severity: rows.length ? 'warning' : 'error', code: 'non-positive',
        title: `${nonPositive.length} rows contain zero or negative dimensions`,
        fix: 'Quantity, length, width and thickness must all be greater than zero. Fix or delete these lines in the export.',
        lines: cap(nonPositive.map(f => f.line)),
      });
    }
  }
  if (rows.length === 0) {
    issues.push({
      severity: 'error', code: 'nothing-calculable',
      title: 'No calculable rows are left',
      fix: 'Every row failed validation. Most often the wrong columns are mapped — go back and check Length / Width / Thickness point at numeric columns.',
    });
    return issues;
  }

  // Unit sanity: median length far outside busbar reality.
  const lens = rows.map(r => r.length).sort((a, b) => a - b);
  const median = lens[Math.floor(lens.length / 2)];
  if (median < 20 && lengthUnit === 'mm') {
    issues.push({
      severity: 'warning', code: 'unit-small',
      title: `Median piece length is only ${median} mm — did you mean metres?`,
      fix: 'If the file lists lengths like 1,25 for 1.25 m, switch the length unit toggle to "m" in the mapping step.',
    });
  }
  if (median > 20000) {
    issues.push({
      severity: 'warning', code: 'unit-big',
      title: `Median piece length is ${Math.round(median)} mm (${(median / 1000).toFixed(1)} m)`,
      fix: 'That is unusually long for one busbar piece. Check the length column mapping and the unit toggle.',
    });
  }

  // Swapped width/thickness suspicion.
  const swapped = rows
    .map((r, i) => ({ i, bad: r.thickness > r.width }))
    .filter(x => x.bad);
  if (swapped.length > rows.length / 2) {
    issues.push({
      severity: 'warning', code: 'swapped-dims',
      title: 'Thickness is larger than width on most rows',
      fix: 'Busbar thickness is normally the smaller dimension. The Width and Thickness columns are probably swapped — flip them in the mapping step.',
    });
  }

  // Implausible cross-sections.
  const wild = rows
    .map((r, i) => ({ i, bad: r.width > 400 || r.thickness > 60 }))
    .filter(x => x.bad).map(x => x.i + 2);
  if (wild.length) {
    issues.push({
      severity: 'warning', code: 'wild-section',
      title: `${wild.length} rows have unusual cross-sections (width > 400 mm or thickness > 60 mm)`,
      fix: 'Check the mapping — these cells may hold lengths or part numbers instead of dimensions.',
      lines: cap(wild),
    });
  }

  // Material column disagreement (file says Al but tool defaults to Cu).
  if (mapping.material !== undefined) {
    const mats = table.rows.map(r => (r[mapping.material!] ?? '').toLowerCase());
    const alu = mats.filter(m => /alu|al\b|e-?al/i.test(m)).length;
    const cu = mats.filter(m => /cu|kupfer|copper/i.test(m)).length;
    if (alu > 0 && cu === 0) {
      issues.push({
        severity: 'warning', code: 'material-alu',
        title: 'The file\'s material column says aluminum',
        fix: 'Switch the metal toggle to Aluminum in the next step so density and price match your parts.',
      });
    }
    if (alu > 0 && cu > 0) {
      issues.push({
        severity: 'warning', code: 'material-mixed',
        title: 'The file mixes copper and aluminum parts',
        fix: 'The tool prices one metal at a time. Import the file twice — once per metal — excluding the other rows in the review step.',
      });
    }
  }

  return issues;
}
