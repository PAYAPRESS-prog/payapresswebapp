/* Unit tests for the EPLAN panel-import engine — delimiters, German
   decimals, header synonyms, bad rows, packing/offcut math against
   hand-computed fixtures, frozen-formula cost totals. */
import {
  detectDelimiter, parseDelimited, parseLocaleNumber, autoMapColumns,
  normalizeRows, groupBySection, packBars, kerfWidth, computePanel,
  SAMPLE_CSV,
} from '../panelImport';

describe('parsing', () => {
  it('detects semicolon, comma and tab delimiters', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
    expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
  });

  it('honours quoted fields containing the delimiter', () => {
    const t = parseDelimited('Part;Len\n"Schiene; lang";100');
    expect(t.rows[0][0]).toBe('Schiene; lang');
    expect(t.rows[0][1]).toBe('100');
  });

  it('parses German and English decimals', () => {
    expect(parseLocaleNumber('1.234,5')).toBeCloseTo(1234.5);
    expect(parseLocaleNumber('1234.5')).toBeCloseTo(1234.5);
    expect(parseLocaleNumber('1,25')).toBeCloseTo(1.25);
    expect(parseLocaleNumber('1,234.5')).toBeCloseTo(1234.5);
    expect(parseLocaleNumber('abc')).toBeNull();
    expect(parseLocaleNumber('')).toBeNull();
  });
});

describe('column auto-mapping', () => {
  it('matches German EPLAN headers', () => {
    const m = autoMapColumns(['Menge', 'Bezeichnung', 'Breite', 'Höhe', 'Länge']);
    expect(m).toMatchObject({ qty: 0, part: 1, width: 2, thickness: 3, length: 4 });
  });

  it('matches English synonyms and leaves unknowns unmapped', () => {
    const m = autoMapColumns(['Qty', 'Width', 'Thickness', 'Length', 'Supplier']);
    expect(m).toMatchObject({ qty: 0, width: 1, thickness: 2, length: 3 });
    expect(Object.values(m)).not.toContain(4);
  });
});

describe('normalisation', () => {
  const table = parseDelimited(SAMPLE_CSV);
  const mapping = autoMapColumns(table.headers);

  it('parses the bundled sample CSV fully', () => {
    const { rows, flagged } = normalizeRows(table, mapping);
    expect(flagged).toHaveLength(0);
    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({ qty: 4, width: 40, thickness: 10 });
    expect(rows[0].length).toBeCloseTo(1250.5);
  });

  it('flags unreadable and non-positive rows instead of dropping silently', () => {
    const t = parseDelimited('Menge;Breite;Höhe;Länge\n2;40;10;abc\n1;-5;10;100\n1;20;5;300');
    const { rows, flagged } = normalizeRows(t, autoMapColumns(t.headers));
    expect(rows).toHaveLength(1);
    expect(flagged.map(f => f.line)).toEqual([2, 3]);
  });

  it('converts cm and m length units to mm', () => {
    const t = parseDelimited('Menge;Breite;Höhe;Länge\n1;20;5;1,5');
    const m = autoMapColumns(t.headers);
    expect(normalizeRows(t, m, 'm').rows[0].length).toBeCloseTo(1500);
    expect(normalizeRows(t, m, 'cm').rows[0].length).toBeCloseTo(15);
  });
});

describe('grouping & packing', () => {
  it('groups by cross-section and expands quantities', () => {
    const groups = groupBySection([
      { qty: 2, length: 1000, width: 40, thickness: 10 },
      { qty: 1, length: 500, width: 40, thickness: 10 },
      { qty: 3, length: 200, width: 20, thickness: 5 },
    ]);
    expect(groups).toHaveLength(2);
    const g40 = groups.find(g => g.width === 40)!;
    expect(g40.pieces).toBe(3);
    expect(g40.totalLength).toBe(2500);
    expect(g40.lengths.sort()).toEqual([1000, 1000, 500].sort());
  });

  it('packs pieces first-fit-decreasing and reports offcut', () => {
    // stock 4000, kerf 3: pieces 2500+3 and 1400+3 fit one bar
    // → offcut 4000 - 2503 - 1403 = 94
    const { bars, offcut } = packBars([2500, 1400], 4000, 3);
    expect(bars).toBe(1);
    expect(offcut).toBeCloseTo(94);
  });

  it('splits over-length pieces across extra stock bars', () => {
    // 9000 → two full 4000 bars + 1000 remainder (+kerf 3) on a third
    const { bars, offcut } = packBars([9000], 4000, 3);
    expect(bars).toBe(3);
    expect(offcut).toBeCloseTo(4000 - 1003);
  });
});

describe('cost computation (frozen formulas)', () => {
  it('kerf width = max(0.5, Ø×0.015)', () => {
    expect(kerfWidth(200)).toBeCloseTo(3);
    expect(kerfWidth(10)).toBeCloseTo(0.5);
  });

  it('computes hand-checked totals for one section', () => {
    // One piece 1000mm of 40×10 copper (ρ=8.89), blade 200 → kerf 3mm
    const groups = groupBySection([{ qty: 1, length: 1000, width: 40, thickness: 10 }]);
    const t = computePanel(groups, {
      stockLen: 4000, bladeDia: 200, punchDia: 0, punchCount: 0, extraScrapPct: 0,
    }, 8.89);
    // gross: 1000×400 mm³ ×8.89/1e6 = 3.556 kg
    expect(t.grossKg).toBeCloseTo(3.556, 3);
    // kerf: 1 cut × 3mm × 400mm² = 1200 mm³ → 0.010668 kg
    expect(t.kerfKg).toBeCloseTo(0.010668, 5);
    // offcut: 4000-1003 = 2997mm × 400mm² → 10.657 kg
    expect(t.offcutKg).toBeCloseTo((2997 * 400 * 8.89) / 1e6, 3);
    expect(t.netKg).toBeCloseTo(3.556, 3);
    const c = t.costUSD(10);
    expect(c.net).toBeCloseTo(35.56, 2);
    expect(c.total).toBeCloseTo((t.grossKg + t.totalWasteKg) * 10, 6);
  });

  it('punch slugs use π(d/2)²×T and extra scrap % applies to gross', () => {
    const groups = groupBySection([{ qty: 1, length: 1000, width: 40, thickness: 10 }]);
    const t = computePanel(groups, {
      stockLen: 4000, bladeDia: 200, punchDia: 14, punchCount: 10, extraScrapPct: 5,
    }, 8.89);
    const slug = 10 * Math.PI * 49 * 10; // mm³
    expect(t.punchKg).toBeCloseTo((slug * 8.89) / 1e6, 5);
    expect(t.extraKg).toBeCloseTo(t.grossKg * 0.05, 6);
  });
});
