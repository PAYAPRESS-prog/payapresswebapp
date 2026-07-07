'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MATERIAL_GRADES } from '@/lib/copperData';
import { ALUMINUM_GRADES } from '@/lib/aluminumData';
import {
  parseDelimited, parseXlsx, decodeBuffer, autoMapColumns, normalizeRows,
  groupBySection, computePanel, auditTable, auditRows, SAMPLE_CSV,
  type ParsedTable, type FieldKey, type PanelRow, type PanelSettings,
  type ImportIssue,
} from '@/lib/panelImport';
import type { FxRates } from '@/types/calculator';
import { FxAuthSheet } from '@/components/figma/FxAuthSheet';

/* Electrical Panel Busbar Cost Calculator — 4-step wizard.
   Parsing is 100% client-side: the EPLAN export never leaves the
   browser. Results recompute live; no separate calculate button. */

type Metal = 'copper' | 'aluminum';
type Curr = 'USD' | 'EUR' | 'GBP' | string;

const FIELDS: Array<[FieldKey, string, boolean]> = [
  ['qty', 'Quantity', true],
  ['length', 'Length', true],
  ['width', 'Width', false],
  ['thickness', 'Thickness', false],
  ['section', 'Cross-section (e.g. 40x10)', false],
  ['part', 'Part / designation', false],
];

const STEPS = ['Import', 'Map', 'Review', 'Results'];

function fmt(n: number, d = 2): string {
  return n.toLocaleString('en', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function PanelCostTool({
  copperPricePerKg, aluminumPricePerKg,
}: {
  copperPricePerKg: number | null;
  aluminumPricePerKg: number | null;
}) {
  const [step, setStep] = useState(0);
  const [table, setTable] = useState<ParsedTable | null>(null);
  const [fileName, setFileName] = useState('');
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseErr, setParseErr] = useState('');
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, number>>>({});
  const [unit, setUnit] = useState<'mm' | 'cm' | 'm'>('mm');
  const [rows, setRows] = useState<PanelRow[]>([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [metal, setMetal] = useState<Metal>('copper');
  const [gradeIdx, setGradeIdx] = useState(0);
  const [settings, setSettings] = useState<PanelSettings>({
    stockLen: 4000, bladeDia: 200, punchDia: 0, punchCount: 0, extraScrapPct: 0,
  });
  const [curr, setCurr] = useState<Curr>('USD');
  const [fx, setFx] = useState<FxRates | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [toast, setToast] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/fx-rate', { signal: AbortSignal.timeout(5000) })
      .then(r => (r.ok ? r.json() : null))
      .then(f => { if (f && typeof f.EUR === 'number') setFx(f); })
      .catch(() => {});
  }, []);

  function note(m: string) { setToast(m); setTimeout(() => setToast(''), 2800); }

  // ── Step 1: import ─────────────────────────────────────────────
  function accept(t: ParsedTable, name: string) {
    if (t.headers.length < 2 || t.rows.length === 0) {
      setParseErr("Couldn't read a table in that file. Export as CSV/XLSX from EPLAN (or paste the rows) and try again.");
      return;
    }
    setTable(t);
    setFileName(name);
    setMapping(autoMapColumns(t.headers));
    setIssues(auditTable(t));
    setStep(1);
    try { window.bcTrack?.('panel_import', String(t.rows.length)); } catch { /* noop */ }
  }

  function ingest(text: string, name: string) {
    setParseErr('');
    accept(parseDelimited(text), name);
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    setParseErr('');
    if (f.size > 10 * 1024 * 1024) {
      setParseErr('That file is over 10 MB — a busbar parts list should be far smaller. Export just the copper/busbar report from EPLAN, not the whole project.');
      return;
    }
    try {
      const buf = await f.arrayBuffer();
      const head = new Uint8Array(buf.slice(0, 4));
      const isZip = head[0] === 0x50 && head[1] === 0x4b;
      if (isZip) {
        if (typeof DecompressionStream === 'undefined') {
          setParseErr('This browser cannot open XLSX files here. Save the export as CSV in Excel (or update your browser) and try again.');
          return;
        }
        // .xlsx (EPLAN's Excel export) — parsed natively, still in-browser
        accept(await parseXlsx(buf), f.name);
        return;
      }
      if (/\.xls$/i.test(f.name)) {
        setParseErr('Legacy .xls: please re-save as .xlsx or CSV in Excel — both import directly here.');
        return;
      }
      // Text: handles UTF-8 and the UTF-16 files EPLAN often writes
      accept(parseDelimited(decodeBuffer(buf)), f.name);
    } catch {
      setParseErr('Could not read the file — try re-exporting it as CSV or XLSX.');
    }
  }

  // ── Step 2 → 3: normalize ──────────────────────────────────────
  function applyMapping() {
    if (!table) return;
    const result = normalizeRows(table, mapping, unit);
    setRows(result.rows);
    setFlaggedCount(result.flagged.length);
    setExcluded(new Set());
    const dataIssues = [...auditTable(table), ...auditRows(result, table, mapping, unit)];
    setIssues(dataIssues);
    // Hard errors keep the user on the mapping step so they can fix
    // the cause instead of hitting a dead review screen.
    if (dataIssues.some(i => i.severity === 'error') && result.rows.length === 0) return;
    setStep(2);
  }

  const activeRows = useMemo(
    () => rows.filter((_, i) => !excluded.has(i)),
    [rows, excluded],
  );
  const groups = useMemo(() => groupBySection(activeRows), [activeRows]);

  const grades = metal === 'copper' ? MATERIAL_GRADES : ALUMINUM_GRADES;
  const grade = grades[gradeIdx] ?? grades[0];
  const spot = metal === 'copper' ? copperPricePerKg : aluminumPricePerKg;
  const pricePerKgUSD = (spot ?? 0) * (1 + grade.busbarPremium);

  const totals = useMemo(
    () => (groups.length ? computePanel(groups, settings, grade.density) : null),
    [groups, settings, grade.density],
  );

  useEffect(() => { if (!fx && curr !== 'USD') setCurr('USD'); }, [fx, curr]);

  const rate = useMemo(() => {
    if (curr === 'USD' || !fx) return 1;
    const r = (fx as unknown as Record<string, number>)[curr];
    return typeof r === 'number' && r > 0 ? r : 1;
  }, [curr, fx]);

  const cost = totals ? totals.costUSD(pricePerKgUSD) : null;
  const cv = (usd: number) => `${fmt(usd * rate)} ${curr}`;

  useEffect(() => {
    if (step === 3 && totals) {
      try { window.bcTrack?.('panel_calculate'); } catch { /* noop */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Step 4 actions ─────────────────────────────────────────────
  function exportCsv() {
    if (!totals) return;
    const lines = [
      'section;pieces;bars;total_length_mm;gross_kg;kerf_kg;offcut_kg;waste_pct',
      ...totals.sections.map(s =>
        `${s.width}x${s.thickness};${s.pieces};${s.bars};${s.totalLength};${s.grossKg.toFixed(3)};${s.kerfKg.toFixed(3)};${s.offcutKg.toFixed(3)};${s.wastePct.toFixed(1)}`),
      `TOTAL;;;;${totals.grossKg.toFixed(3)};${totals.kerfKg.toFixed(3)};${totals.offcutKg.toFixed(3)};`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'panel-busbar-cost.csv'; a.click();
    URL.revokeObjectURL(url);
    try { window.bcTrack?.('panel_export'); } catch { /* noop */ }
  }

  function share() {
    if (!totals || !cost) return;
    const txt = [
      `🏭 Panel busbar: ${totals.sections.length} section${totals.sections.length > 1 ? 's' : ''}, ${fmt(totals.grossKg)} kg net`,
      `♻️ Waste: ${fmt(totals.totalWasteKg)} kg (kerf + offcuts + punches)`,
      `💰 Total incl. waste: ${cv(cost.total)}`,
      '',
      'Calculated free with Busbar Calculator 👇',
    ].join('\n');
    const url = 'https://calculator.payapress.com/electrical-panel-busbar-cost-calculator';
    if (navigator.share) navigator.share({ title: 'Panel busbar cost', text: txt, url }).catch(() => {});
    else navigator.clipboard?.writeText(`${txt}\n${url}`).then(() => note('Copied to clipboard')).catch(() => {});
  }

  async function saveToHistory() {
    if (!totals || !cost) return;
    const first = totals.sections[0];
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Panel · ${totals.sections.length} sections · ${new Date().toLocaleDateString('en-GB')}`,
          metal, width: Math.round(first.width), thickness: Math.round(first.thickness),
          length: Math.round(totals.sections.reduce((a, s) => a + s.totalLength, 0)),
          price: cost.total * rate, currency: curr,
        }),
      });
      if (res.status === 401) { setAuthOpen(true); return; }
      if (!res.ok) throw new Error();
      note('Saved to History');
      try { window.bcTrack?.('panel_save'); } catch { /* noop */ }
    } catch { note('Could not save — try again'); }
  }

  function downloadSample() {
    const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'eplan-sample.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const issueList = issues.length > 0 && (
    <div className="pnl-issues" role="alert">
      {issues.map(i => (
        <div key={i.code} className={`pnl-issue ${i.severity}`}>
          <span className="pnl-issue-ic" aria-hidden>{i.severity === 'error' ? '✕' : '!'}</span>
          <div>
            <b>{i.title}</b>
            <p>{i.fix}</p>
            {i.lines && i.lines.length > 0 && (
              <em>Lines: {i.lines.join(', ')}{i.lines.length >= 8 ? '…' : ''}</em>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const mappingComplete =
    mapping.qty !== undefined && mapping.length !== undefined &&
    ((mapping.width !== undefined && mapping.thickness !== undefined) ||
      mapping.section !== undefined);

  // ── Summary side card (desktop) ────────────────────────────────
  const summary = (
    <aside className={`pnl-summary${totals ? '' : ' is-empty'}`}>
      <h3 className="pnl-sum-title">Summary</h3>
      {!totals ? (
        <p className="pnl-sum-empty">Import your EPLAN list to see live totals here.</p>
      ) : (
        <>
          <div className="pnl-sum-row"><span>Sections</span><b>{totals.sections.length}</b></div>
          <div className="pnl-sum-row"><span>Pieces</span><b>{totals.sections.reduce((a, s) => a + s.pieces, 0)}</b></div>
          <div className="pnl-sum-row"><span>Net weight</span><b>{fmt(totals.netKg)} kg</b></div>
          <div className="pnl-sum-row"><span>Waste</span><b className="warn">{fmt(totals.totalWasteKg)} kg</b></div>
          {cost && <div className="pnl-sum-row total"><span>Total cost</span><b>{cv(cost.total)}</b></div>}
          <div className="pnl-sum-bars" aria-hidden>
            {totals.sections.slice(0, 6).map(s => (
              <div key={`${s.width}x${s.thickness}`} className="pnl-sum-bar">
                <span>{s.width}×{s.thickness}</span>
                <i><b style={{ width: `${Math.min(100, (s.grossKg / Math.max(totals.grossKg, 0.001)) * 100)}%` }} /></i>
                <em>{fmt(s.grossKg, 1)} kg</em>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );

  return (
    <div className="pnl">
      {toast && <div className="pnl-toast">{toast}</div>}

      {/* progress header */}
      <ol className="pnl-steps" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}
            onClick={() => { if (i < step) setStep(i); }}>
            <i>{i < step ? '✓' : i + 1}</i>{s}
          </li>
        ))}
      </ol>

      <div className="pnl-grid">
        <div className="pnl-main">

          {/* ── Step 1: Import ── */}
          {step === 0 && (
            <section className="pnl-card">
              <div className="pnl-mascot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mr-busbar.png" alt="" width={34} height={98} />
                <p>Export your copper parts list from EPLAN and drop it here — <b>it never leaves your device.</b></p>
              </div>
              {!pasteMode ? (
                <>
                  <button type="button" className="pnl-drop"
                    onClick={() => fileInput.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}>
                    <span className="pnl-drop-ic">⬆</span>
                    <b>Drop your EPLAN export</b>
                    <span>.csv / .txt / .xlsx — or tap to choose</span>
                  </button>
                  <input ref={fileInput} type="file" accept=".csv,.txt,.xls,.xlsx" hidden
                    onChange={e => onFile(e.target.files?.[0])} />
                </>
              ) : (
                <>
                  <textarea className="pnl-paste" rows={8}
                    placeholder={'Paste rows copied from Excel / EPLAN…\nMenge\tBreite\tHöhe\tLänge\n4\t40\t10\t1250,5'}
                    value={pasteText} onChange={e => setPasteText(e.target.value)} />
                  <button type="button" className="pnl-primary"
                    disabled={!pasteText.trim()}
                    onClick={() => ingest(pasteText, 'pasted rows')}>
                    Read pasted rows
                  </button>
                </>
              )}
              {parseErr && <p className="pnl-err" role="alert">{parseErr}</p>}
              <div className="pnl-import-links">
                <button type="button" className="pnl-link" onClick={() => { setPasteMode(!pasteMode); setParseErr(''); }}>
                  {pasteMode ? '← Upload a file instead' : 'Paste from Excel/EPLAN instead'}
                </button>
                <button type="button" className="pnl-link" onClick={downloadSample}>Download 5-row sample CSV</button>
              </div>
              <div className="pnl-guide">
                <h3 className="pnl-guide-title">File guide — a perfect import, every time</h3>
                <p className="pnl-guide-intro">
                  Pick the format you have. Each one shows exactly how to get it
                  out of EPLAN and what it must contain.
                </p>

                <details className="pnl-fmt">
                  <summary>
                    <span className="pnl-fmt-chip">CSV / TXT</span>
                    <span className="pnl-fmt-name">EPLAN&rsquo;s standard text export</span>
                    <i className="pnl-fmt-arrow" aria-hidden>›</i>
                  </summary>
                  <div className="pnl-fmt-body">
                    <p><b>Get it from EPLAN:</b> Utilities → Reports → Copper / busbar
                    parts list → output as file → <em>CSV (semicolon)</em>.</p>
                    <ul>
                      <li>Semicolon <b>;</b> comma <b>,</b> or tab — detected automatically</li>
                      <li>UTF-8 and UTF-16 encodings both open correctly</li>
                      <li>German <b>1.250,5</b> and English <b>1250.5</b> decimals both work</li>
                      <li>A missing header row is fine — you map the columns manually</li>
                    </ul>
                    <pre className="pnl-fmt-example">{`Menge;Bezeichnung;Breite;Höhe;Länge
4;Sammelschiene L1;40;10;1.250,5
2;Abgang Q1;30;5;445,25`}</pre>
                  </div>
                </details>

                <details className="pnl-fmt">
                  <summary>
                    <span className="pnl-fmt-chip">XLSX</span>
                    <span className="pnl-fmt-name">Excel workbook</span>
                    <i className="pnl-fmt-arrow" aria-hidden>›</i>
                  </summary>
                  <div className="pnl-fmt-body">
                    <p><b>Get it from EPLAN:</b> export the parts list as Excel, or open
                    any export in Excel and save as <em>.xlsx</em>.</p>
                    <ul>
                      <li>The first worksheet is read; the first row becomes the headers</li>
                      <li>Formulas are fine — their calculated values are used</li>
                      <li>Legacy <b>.xls</b> (pre-2007) is not supported — re-save as .xlsx or CSV</li>
                    </ul>
                  </div>
                </details>

                <details className="pnl-fmt">
                  <summary>
                    <span className="pnl-fmt-chip">Paste</span>
                    <span className="pnl-fmt-name">Copy rows straight from Excel / EPLAN</span>
                    <i className="pnl-fmt-arrow" aria-hidden>›</i>
                  </summary>
                  <div className="pnl-fmt-body">
                    <p>Select the table in Excel or the EPLAN preview, copy, switch to
                    <b> Paste from Excel/EPLAN</b> above and paste. Include the header
                    row if you have one — mapping gets guessed for you.</p>
                  </div>
                </details>

                <h4 className="pnl-guide-h4">The columns we need</h4>
                <div className="pnl-cols">
                  <div className="pnl-col-row">
                    <div className="pnl-col-info">
                      <b>Quantity <em>*</em></b>
                      <span>Menge · Stück · Anzahl · Qty</span>
                    </div>
                    <code>4</code>
                  </div>
                  <div className="pnl-col-row">
                    <div className="pnl-col-info">
                      <b>Length <em>*</em></b>
                      <span>Länge [mm] · Zuschnittslänge · Length</span>
                    </div>
                    <code>1.250,5</code>
                  </div>
                  <div className="pnl-col-row">
                    <div className="pnl-col-info">
                      <b>Width</b>
                      <span>Breite · Schienenbreite · Width</span>
                    </div>
                    <code>40</code>
                  </div>
                  <div className="pnl-col-row">
                    <div className="pnl-col-info">
                      <b>Thickness</b>
                      <span>Höhe · Dicke · Materialdicke · Thickness</span>
                    </div>
                    <code>10</code>
                  </div>
                  <div className="pnl-col-row alt">
                    <div className="pnl-col-info">
                      <b>…or one combined column</b>
                      <span>Querschnitt · Cross-section · Profil</span>
                    </div>
                    <code>40x10</code>
                  </div>
                </div>
                <p className="pnl-guide-note">
                  <em>*</em> required · Width + Thickness can be replaced by the
                  combined column · anything unreadable is flagged with its exact
                  line number and a fix — nothing is dropped silently.
                </p>
              </div>
              <details className="pnl-help">
                <summary>How to export from EPLAN</summary>
                <p>
                  EPLAN Pro Panel: <em>Utilities → Reports → Copper parts list</em> →
                  output as file → choose CSV (semicolon). EPLAN Electric P8: export the
                  busbar BOM via <em>Utilities → Reports → Generate → Parts list</em>,
                  then save/export the table as CSV. Columns like Menge / Breite / Höhe /
                  Länge are detected automatically.
                </p>
              </details>
            </section>
          )}

          {/* ── Step 2: Map columns ── */}
          {step === 1 && table && (
            <section className="pnl-card">
              <h2 className="pnl-h2">Match your columns</h2>
              <p className="pnl-sub">{fileName} · {table.rows.length} rows — we guessed the columns; correct any that look wrong.</p>
              {FIELDS.map(([key, label, req]) => (
                <div key={key} className="pnl-map-row">
                  <label>{label}{req && <em> *</em>}</label>
                  <select value={mapping[key] ?? -1}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMapping(m => ({ ...m, [key]: v < 0 ? undefined : v }));
                    }}>
                    <option value={-1}>— not in file —</option>
                    {table.headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                  </select>
                </div>
              ))}
              <div className="pnl-map-row">
                <label>Length unit</label>
                <div className="pnl-unit">
                  {(['mm', 'cm', 'm'] as const).map(u => (
                    <button key={u} type="button" className={unit === u ? 'on' : ''}
                      onClick={() => setUnit(u)}>{u}</button>
                  ))}
                </div>
              </div>
              <div className="pnl-preview">
                {table.rows.slice(0, 3).map((r, i) => (
                  <div key={i} className="pnl-preview-row">
                    {FIELDS.filter(([, , req]) => req).map(([k, l]) => (
                      <span key={k}><em>{l}:</em> {mapping[k] !== undefined ? r[mapping[k]!] : '—'}</span>
                    ))}
                    <span><em>W×T:</em> {mapping.width !== undefined && mapping.thickness !== undefined
                      ? `${r[mapping.width!]} × ${r[mapping.thickness!]}`
                      : mapping.section !== undefined ? r[mapping.section!] : '—'}</span>
                  </div>
                ))}
              </div>
              {!mappingComplete && (
                <p className="pnl-err">
                  Map Quantity, Length and either Width + Thickness or a combined
                  Cross-section column to continue.
                </p>
              )}
              {issueList}
              <div className="pnl-foot">
                <button type="button" className="pnl-ghost" onClick={() => setStep(0)}>‹ Back</button>
                <button type="button" className="pnl-primary" disabled={!mappingComplete} onClick={applyMapping}>
                  Continue ›
                </button>
              </div>
            </section>
          )}

          {/* ── Step 3: Review & waste ── */}
          {step === 2 && (
            <>
              {issueList}
              <section className="pnl-card">
                <h2 className="pnl-h2">Review pieces</h2>
                <p className="pnl-sub">
                  {activeRows.length} rows in · {groups.length} cross-sections
                  {flaggedCount > 0 && <span className="pnl-flag"> · {flaggedCount} unreadable rows skipped</span>}
                </p>
                <div className="pnl-scroll">
                  <table className="pnl-table">
                    <thead><tr><th>Part</th><th>Qty</th><th>W×T</th><th>Length</th><th /></tr></thead>
                    <tbody>
                      {rows.slice(0, 300).map((r, i) => (
                        <tr key={i} className={excluded.has(i) ? 'off' : ''}>
                          <td>{r.part || '—'}</td>
                          <td>{r.qty}</td>
                          <td className="pnl-mono">{r.width}×{r.thickness}</td>
                          <td className="pnl-mono">{fmt(r.length, 0)} mm</td>
                          <td>
                            <button type="button" className="pnl-x" aria-label={excluded.has(i) ? 'Include row' : 'Exclude row'}
                              onClick={() => setExcluded(s => {
                                const n = new Set(s);
                                if (n.has(i)) n.delete(i); else n.add(i);
                                return n;
                              })}>{excluded.has(i) ? '↩' : '✕'}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 300 && (
                    <p className="pnl-sub" style={{ padding: '10px 4px 0' }}>
                      Showing the first 300 of {rows.length} rows — every row is
                      still counted in the totals.
                    </p>
                  )}
                </div>
              </section>

              <section className="pnl-card">
                <h2 className="pnl-h2">Metal &amp; waste settings</h2>
                <div className="pnl-metal">
                  {(['copper', 'aluminum'] as const).map(m => (
                    <button key={m} type="button" className={metal === m ? `on ${m}` : ''}
                      onClick={() => { setMetal(m); setGradeIdx(0); }}>
                      {m === 'copper' ? 'Copper' : 'Aluminum'}
                    </button>
                  ))}
                </div>
                <div className="pnl-grades">
                  {grades.map((g, i) => (
                    <button key={g.id} type="button" className={gradeIdx === i ? `on ${metal}` : ''}
                      onClick={() => setGradeIdx(i)}>{g.label}</button>
                  ))}
                </div>
                {([
                  ['Stock bar length', 'stockLen', 'mm'],
                  ['Blade diameter', 'bladeDia', 'mm'],
                  ['Punch diameter', 'punchDia', 'mm'],
                  ['Punch-outs (total)', 'punchCount', '×'],
                  ['Extra scrap', 'extraScrapPct', '%'],
                ] as Array<[string, keyof PanelSettings, string]>).map(([label, key, u]) => (
                  <div key={key} className="pnl-set-row">
                    <label>{label}</label>
                    <div className="pnl-set-input">
                      <input type="text" inputMode="decimal" value={String(settings[key])}
                        onChange={e => {
                          const v = parseFloat(e.target.value.replace(',', '.'));
                          setSettings(s => ({ ...s, [key]: Number.isFinite(v) && v >= 0 ? v : 0 }));
                        }} />
                      <span>{u}</span>
                    </div>
                  </div>
                ))}
                <div className="pnl-foot">
                  <button type="button" className="pnl-ghost" onClick={() => setStep(1)}>‹ Back</button>
                  <button type="button" className="pnl-primary" disabled={groups.length === 0}
                    onClick={() => setStep(3)}>
                    See results ›
                  </button>
                </div>
              </section>
            </>
          )}

          {/* ── Step 4: Results ── */}
          {step === 3 && totals && cost && (
            <>
              <section className="pnl-card">
                <h2 className="pnl-results-title">Results</h2>
                <div className="pnl-res-divider" />
                <div className="pnl-curr">
                  {['USD', 'EUR', 'GBP'].map(c => (
                    <button key={c} type="button" className={curr === c ? 'on' : ''}
                      disabled={c !== 'USD' && !fx}
                      title={c !== 'USD' && !fx ? 'Exchange rates unavailable right now' : undefined}
                      onClick={() => setCurr(c)}>{c}</button>
                  ))}
                </div>
                {spot === null && (
                  <p className="pnl-flag">Live metal feed unavailable — prices use an estimated rate. Don&apos;t quote commercially.</p>
                )}
                <div className="pnl-res-total">
                  <span>Total cost incl. waste</span>
                  <b>{cv(cost.total)}</b>
                </div>
                <div className="pnl-res-rows">
                  <div><span>Net busbar ({fmt(totals.netKg)} kg)</span><b>{cv(cost.net)}</b></div>
                  <div><span>Kerf loss ({fmt(totals.kerfKg)} kg)</span><b>{cv(cost.kerf)}</b></div>
                  <div><span>Offcut scrap ({fmt(totals.offcutKg)} kg)</span><b>{cv(cost.offcut)}</b></div>
                  {totals.punchKg > 0 && <div><span>Punch-outs ({fmt(totals.punchKg)} kg)</span><b>{cv(cost.punch)}</b></div>}
                  {totals.extraKg > 0 && <div><span>Extra scrap ({fmt(totals.extraKg)} kg)</span><b>{cv(cost.extra)}</b></div>}
                </div>
              </section>

              <section className="pnl-card">
                <h2 className="pnl-h2">Per cross-section</h2>
                <div className="pnl-scroll">
                  <table className="pnl-table">
                    <thead><tr><th>Section</th><th>Pieces</th><th>Bars</th><th>Length</th><th>Waste %</th><th>Cost</th></tr></thead>
                    <tbody>
                      {totals.sections.map(s => (
                        <tr key={`${s.width}x${s.thickness}`}>
                          <td className="pnl-mono">{s.width}×{s.thickness}</td>
                          <td>{s.pieces}</td>
                          <td>{s.bars}</td>
                          <td className="pnl-mono">{fmt(s.totalLength / 1000, 2)} m</td>
                          <td>{fmt(s.wastePct, 1)}%</td>
                          <td>{cv((s.grossKg + s.kerfKg + s.offcutKg) * pricePerKgUSD)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pnl-foot pnl-actions">
                  <button type="button" className="pnl-ghost" onClick={() => setStep(2)}>‹ Adjust</button>
                  <button type="button" className="pnl-ghost" onClick={exportCsv}>Export CSV</button>
                  <button type="button" className="pnl-ghost" onClick={share}>Share</button>
                  <button type="button" className="pnl-primary" onClick={saveToHistory}>Save to History</button>
                </div>
              </section>
            </>
          )}
        </div>

        {summary}
      </div>

      <FxAuthSheet
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onSuccess={() => { setAuthOpen(false); saveToHistory(); }}
      />
    </div>
  );
}
