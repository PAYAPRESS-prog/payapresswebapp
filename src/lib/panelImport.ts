/* Busbar Panel Cost — EPLAN import engine (pure, client-safe).
   Parses delimited copper-parts exports (CSV/TSV/clipboard), auto-maps
   German/English EPLAN headers, groups rows by cross-section, packs
   pieces into stock bars (first-fit-decreasing) to find offcut scrap,
   and prices everything with the app's FROZEN waste formulas:
     kerf width  = max(0.5, bladeØ × 0.015)  [mm]
     punch slug  = π × (d/2)² × T            [mm³]
     weight (kg) = volume mm³ × density ÷ 1,000,000                  */

// ── Parsing ───────────────────────────────────────────────────────

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
  const delimiter = detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const all = lines.map(l => splitDelimited(l, delimiter));
  const headers = all[0] ?? [];
  return { headers, rows: all.slice(1), delimiter };
}

/** Parse a number that may use German locale (1.234,5) or plain (1234.5). */
export function parseLocaleNumber(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return null;
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

export type FieldKey = 'qty' | 'length' | 'width' | 'thickness' | 'material' | 'part';

const SYNONYMS: Record<FieldKey, string[]> = {
  qty:       ['menge', 'anzahl', 'qty', 'quantity', 'count', 'stück', 'stueck', 'pcs'],
  length:    ['länge', 'laenge', 'length', 'l', 'l (mm)', 'länge (mm)'],
  width:     ['breite', 'width', 'b', 'w', 'b (mm)'],
  thickness: ['höhe', 'hoehe', 'dicke', 'thickness', 'h', 't', 'd', 'stärke', 'staerke'],
  material:  ['werkstoff', 'material'],
  part:      ['bezeichnung', 'teil', 'part', 'description', 'benennung', 'artikel'],
};

export function autoMapColumns(headers: string[]): Partial<Record<FieldKey, number>> {
  const map: Partial<Record<FieldKey, number>> = {};
  const norm = headers.map(h => h.toLowerCase().replace(/["']/g, '').trim());
  for (const key of Object.keys(SYNONYMS) as FieldKey[]) {
    for (const syn of SYNONYMS[key]) {
      const idx = norm.findIndex((h, i) =>
        !Object.values(map).includes(i) && (h === syn || h.startsWith(syn + ' ') || h.startsWith(syn + '(')));
      if (idx > -1) { map[key] = idx; break; }
    }
  }
  return map;
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
    const width = parseLocaleNumber(get('width'));
    const thickness = parseLocaleNumber(get('thickness'));
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
