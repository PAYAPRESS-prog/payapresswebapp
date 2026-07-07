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

/* ══ Format-matrix tests: every EPLAN export shape we support ══ */
import { decodeBuffer, parseSection, parseXlsx } from '../panelImport';
import { deflateRawSync } from 'zlib';

function toBuf(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

describe('encodings', () => {
  it('decodes UTF-8 with BOM', () => {
    const body = new TextEncoder().encode('Menge;Länge\n1;100');
    const withBom = new Uint8Array([0xef, 0xbb, 0xbf, ...body]);
    expect(decodeBuffer(toBuf(withBom))).toBe('Menge;Länge\n1;100');
  });

  it('decodes UTF-16LE (typical EPLAN .txt) with and without BOM', () => {
    const text = 'Menge\tLänge\n2\t1250,5';
    const codes = Array.from(text).map(c => c.charCodeAt(0));
    const le = new Uint8Array(codes.length * 2 + 2);
    le[0] = 0xff; le[1] = 0xfe;
    codes.forEach((c, i) => { le[2 + i * 2] = c & 0xff; le[3 + i * 2] = c >> 8; });
    expect(decodeBuffer(toBuf(le))).toBe(text);
    expect(decodeBuffer(toBuf(le.slice(2)))).toBe(text); // BOM-less heuristic
  });
});

describe('format variants', () => {
  it('headers with units — "Länge [mm]", "Width (mm)"', () => {
    const m = autoMapColumns(['Stück', 'Breite [mm]', 'Dicke [mm]', 'Länge [mm]']);
    expect(m).toMatchObject({ qty: 0, width: 1, thickness: 2, length: 3 });
  });

  it('combined Querschnitt column "40x10" fills width+thickness', () => {
    const t = parseDelimited('Menge;Querschnitt;Länge\n2;40x10;1000\n1;30 X 5;500\n1;25×3;250');
    const m = autoMapColumns(t.headers);
    expect(m.section).toBe(1);
    const { rows, flagged } = normalizeRows(t, m);
    expect(flagged).toHaveLength(0);
    expect(rows[0]).toMatchObject({ width: 40, thickness: 10 });
    expect(rows[1]).toMatchObject({ width: 30, thickness: 5 });
    expect(rows[2]).toMatchObject({ width: 25, thickness: 3 });
  });

  it('parseSection accepts x × * / separators and rejects garbage', () => {
    expect(parseSection('40*10')).toEqual([40, 10]);
    expect(parseSection('40/10')).toEqual([40, 10]);
    expect(parseSection('40x10 mm')).toEqual([40, 10]);
    expect(parseSection('CU 40x10')).toBeNull();
    expect(parseSection('40')).toBeNull();
  });

  it('headerless numeric export gets synthetic headers and keeps row 1', () => {
    const t = parseDelimited('4;40;10;1250\n2;30;5;600');
    expect(t.headers).toEqual(['Column 1', 'Column 2', 'Column 3', 'Column 4']);
    expect(t.rows).toHaveLength(2);
  });

  it('numbers with in-cell units and space thousands', () => {
    expect(parseLocaleNumber('1 250,5 mm')).toBeCloseTo(1250.5);
    expect(parseLocaleNumber('40 mm')).toBeCloseTo(40);
    expect(parseLocaleNumber('1 234,5')).toBeCloseTo(1234.5);
  });

  it('EPLAN long-form headers: Zuschnittslänge / Materialdicke / Schienenbreite', () => {
    const m = autoMapColumns(['Anzahl', 'Schienenbreite', 'Materialdicke', 'Zuschnittslänge [mm]']);
    expect(m).toMatchObject({ qty: 0, width: 1, thickness: 2, length: 3 });
  });

  it('quantity column missing defaults every row to qty 1', () => {
    const t = parseDelimited('Breite;Höhe;Länge\n40;10;1000');
    const { rows } = normalizeRows(t, autoMapColumns(t.headers));
    expect(rows[0].qty).toBe(1);
  });
});

/* ── real .xlsx built byte-by-byte (stored + deflated entries) ── */
function crc32(data: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function makeZip(entries: Array<[string, string]>, deflate: boolean): ArrayBuffer {
  const enc = new TextEncoder();
  const chunks: number[] = [];
  const central: number[] = [];
  const push = (arr: number[], bytes: ArrayLike<number>) => { for (let i = 0; i < bytes.length; i++) arr.push(bytes[i]); };
  const le16 = (n: number) => [n & 0xff, (n >> 8) & 0xff];
  const le32 = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff];
  for (const [name, content] of entries) {
    const nameB = enc.encode(name);
    const raw = enc.encode(content);
    const data = deflate ? new Uint8Array(deflateRawSync(raw)) : raw;
    const method = deflate ? 8 : 0;
    const crc = crc32(raw);
    const offset = chunks.length;
    push(chunks, le32(0x04034b50)); push(chunks, le16(20)); push(chunks, le16(0));
    push(chunks, le16(method)); push(chunks, le16(0)); push(chunks, le16(0));
    push(chunks, le32(crc)); push(chunks, le32(data.length)); push(chunks, le32(raw.length));
    push(chunks, le16(nameB.length)); push(chunks, le16(0));
    push(chunks, nameB); push(chunks, data);
    push(central, le32(0x02014b50)); push(central, le16(20)); push(central, le16(20));
    push(central, le16(0)); push(central, le16(method)); push(central, le16(0)); push(central, le16(0));
    push(central, le32(crc)); push(central, le32(data.length)); push(central, le32(raw.length));
    push(central, le16(nameB.length)); push(central, le16(0)); push(central, le16(0));
    push(central, le16(0)); push(central, le16(0)); push(central, le32(0)); push(central, le32(offset));
    push(central, nameB);
  }
  const cdStart = chunks.length;
  push(chunks, central);
  push(chunks, le32(0x06054b50)); push(chunks, le16(0)); push(chunks, le16(0));
  push(chunks, le16(entries.length)); push(chunks, le16(entries.length));
  push(chunks, le32(central.length)); push(chunks, le32(cdStart)); push(chunks, le16(0));
  return new Uint8Array(chunks).buffer;
}

const SHEET_XML = `<?xml version="1.0"?>
<worksheet><sheetData>
<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row>
<row r="2"><c r="A2"><v>4</v></c><c r="B2"><v>40</v></c><c r="C2"><v>10</v></c><c r="D2"><v>1250.5</v></c></row>
<row r="3"><c r="A3"><v>2</v></c><c r="B3"><v>30</v></c><c r="C3"><v>5</v></c><c r="D3" t="inlineStr"><is><t>600</t></is></c></row>
</sheetData></worksheet>`;
const SHARED_XML = `<?xml version="1.0"?>
<sst><si><t>Menge</t></si><si><t>Breite</t></si><si><r><t>Dic</t></r><r><t>ke</t></r></si><si><t>L&#228;nge [mm]</t></si></sst>`;

describe('xlsx', () => {
  const parts: Array<[string, string]> = [
    ['xl/workbook.xml', '<workbook/>'],
    ['xl/sharedStrings.xml', SHARED_XML],
    ['xl/worksheets/sheet1.xml', SHEET_XML],
  ];

  it.each([['stored', false], ['deflated', true]] as Array<[string, boolean]>)(
    'parses a %s xlsx: shared strings, multi-run cells, inline strings, entities',
    async (_label, deflate) => {
      const table = await parseXlsx(makeZip(parts, deflate));
      expect(table.headers).toEqual(['Menge', 'Breite', 'Dicke', 'Länge [mm]']);
      expect(table.rows).toHaveLength(2);
      const m = autoMapColumns(table.headers);
      const { rows, flagged } = normalizeRows(table, m);
      expect(flagged).toHaveLength(0);
      expect(rows[0]).toMatchObject({ qty: 4, width: 40, thickness: 10 });
      expect(rows[0].length).toBeCloseTo(1250.5);
      expect(rows[1].length).toBeCloseTo(600);
    },
  );

  it('rejects a non-zip buffer cleanly', async () => {
    await expect(parseXlsx(new TextEncoder().encode('not a zip').buffer as ArrayBuffer))
      .rejects.toThrow();
  });

  it('end-to-end xlsx → totals match the CSV pipeline', async () => {
    const table = await parseXlsx(makeZip(parts, true));
    const { rows } = normalizeRows(table, autoMapColumns(table.headers));
    const totals = computePanel(groupBySection(rows), {
      stockLen: 4000, bladeDia: 200, punchDia: 0, punchCount: 0, extraScrapPct: 0,
    }, 8.89);
    // gross: (4×1250.5×(40×10) + 2×600×(30×5)) mm³ ×8.89/1e6
    const expected = ((4 * 1250.5 * 400 + 2 * 600 * 150) * 8.89) / 1e6;
    expect(totals.grossKg).toBeCloseTo(expected, 4);
  });
});
