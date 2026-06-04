'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_GRADE } from '@/lib/copperData';
import { DEFAULT_ALUMINUM_GRADE } from '@/lib/aluminumData';
import type { CopperPriceData, FxRates, InitialPriceData } from '@/types/calculator';
import {
  BusbarMock, RulerAngularIcon, RulerIcon, DollarIcon,
  BookmarkIcon, ShareIcon, CompareIcon,
} from './FxIcons';
import { FLAGS } from './FxFlags';
import { FxAuthSheet } from './FxAuthSheet';
import { FxBusbarChart } from './FxBusbarChart';
import { FxCompareSheet } from './FxCompareSheet';

type Metal = 'copper' | 'aluminum';
type CurrCode =
  | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CNY' | 'TRY' | 'IRR'
  | 'SAR' | 'CAD' | 'AUD' | 'CHF' | 'JPY' | 'INR' | 'RUB'
  | 'KWD' | 'QAR' | 'SGD';

// Suggestion presets (width × thickness, mm) — exactly matching the Figma
const PRESETS: Array<{ w: string; t: string }> = [
  { w: '100', t: '10' },
  { w: '200', t: '20' },
  { w: '300', t: '30' },
  { w: '400', t: '40' },
  { w: '500', t: '50' },
  { w: '600', t: '60' },
  { w: '700', t: '70' },
];

// The 3 fixed currencies in the 2×2 grid (4th cell is "Other")
const GRID_CURRENCIES: CurrCode[] = ['USD', 'EUR', 'GBP'];

const CURR_META: Record<CurrCode, { label: string; name: string }> = {
  USD: { label: 'USD',  name: 'US Dollar' },
  EUR: { label: 'EUR',  name: 'Euro' },
  GBP: { label: 'GBP',  name: 'British Pound' },
  AED: { label: 'AED',  name: 'UAE Dirham' },
  CNY: { label: 'CNY',  name: 'Chinese Yuan' },
  TRY: { label: 'TRY',  name: 'Turkish Lira' },
  IRR: { label: 'IRR',  name: 'Iranian Rial' },
  SAR: { label: 'SAR',  name: 'Saudi Riyal' },
  CAD: { label: 'CAD',  name: 'Canadian Dollar' },
  AUD: { label: 'AUD',  name: 'Australian Dollar' },
  CHF: { label: 'CHF',  name: 'Swiss Franc' },
  JPY: { label: 'JPY',  name: 'Japanese Yen' },
  INR: { label: 'INR',  name: 'Indian Rupee' },
  RUB: { label: 'RUB',  name: 'Russian Ruble' },
  KWD: { label: 'KWD',  name: 'Kuwaiti Dinar' },
  QAR: { label: 'QAR',  name: 'Qatari Riyal' },
  SGD: { label: 'SGD',  name: 'Singapore Dollar' },
};

const PICKER_CURRENCIES: CurrCode[] = [
  'AED', 'SAR', 'KWD', 'QAR', 'IRR',
  'EUR', 'GBP', 'CHF', 'TRY', 'RUB',
  'CNY', 'JPY', 'INR', 'SGD',
  'CAD', 'AUD',
];

const CURRENT_DENSITY: Record<Metal, number> = { copper: 2.5, aluminum: 1.5 };

function clampInt(raw: string, min: number, max: number, fallback: number) {
  const n = Math.round(parseFloat(raw));
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function fmtMoney(n: number, decimals = 2): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = n < 0 ? '-' : '';
  return dec !== undefined ? `${sign}${intFmt}.${dec}` : `${sign}${intFmt}`;
}

function fmtResultPrice(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (a >= 1_000_000)     return (n / 1_000_000).toFixed(2) + 'M';
  return fmtMoney(n);
}

export function FxCalculator({ initialData }: { initialData?: InitialPriceData }) {
  const [metal,  setMetal]  = useState<Metal>('copper');
  const [width,  setWidth]  = useState('100');
  const [thick,  setThick]  = useState('10');
  const [length, setLength] = useState('2500');
  const [curr,   setCurr]   = useState<CurrCode>('USD');
  const [copper,   setCopper]   = useState<CopperPriceData | null>(initialData?.copper   ?? null);
  const [aluminum, setAluminum] = useState<CopperPriceData | null>(initialData?.aluminum ?? null);
  const [fx,       setFx]       = useState<FxRates | null>(initialData?.fx ?? null);

  const [showResults,  setShowResults]  = useState(false);
  const [bookmarked,   setBookmarked]   = useState(false);
  const [updatedLabel, setUpdatedLabel] = useState('just now');
  const [interacted,   setInteracted]   = useState(false);
  const [showPicker,   setShowPicker]   = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  // Custom currency selected from picker (non-grid currency)
  const [customCurr,   setCustomCurr]   = useState<CurrCode | null>(null);

  // Bookmark / save-to-history naming flow
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [bookmarkName,   setBookmarkName]   = useState('');
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [saveToast,      setSaveToast]      = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [showCompare, setShowCompare] = useState(false);

  const [authOpen,  setAuthOpen]  = useState(false);
  const [authMode,  setAuthMode]  = useState<'login' | 'signup'>('login');
  const pendingActionRef = useRef<(() => void) | null>(null);

  const [user, setUser] = useState<{ id: number; email: string } | null | undefined>(undefined);

  const resultsRef = useRef<HTMLDivElement>(null);
  const currCardRef = useRef<HTMLDivElement>(null);
  const pickerInput = useRef<HTMLInputElement>(null);

  // Live price refresh every 5 min
  useEffect(() => {
    const tick = async () => {
      const [c, a, f] = await Promise.all([
        fetch('/api/copper-price').then(r => r.json()).catch(() => null),
        fetch('/api/aluminum-price').then(r => r.json()).catch(() => null),
        fetch('/api/fx-rate').then(r => r.json()).catch(() => null),
      ]);
      if (c) setCopper(c);
      if (a) setAluminum(a);
      if (f) setFx(f);
    };
    if (initialData?.copper == null) tick();
    const id = setInterval(tick, 300_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const grade = metal === 'copper' ? DEFAULT_GRADE : DEFAULT_ALUMINUM_GRADE;
  const live  = metal === 'copper' ? copper        : aluminum;

  useEffect(() => {
    function relativeTime(iso?: string | null): string {
      if (!iso) return 'just now';
      const t = new Date(iso).getTime();
      if (Number.isNaN(t)) return 'just now';
      const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
      if (sec < 30)     return 'just now';
      if (sec < 60)     return `${sec} sec ago`;
      if (sec < 3600)   return `${Math.floor(sec / 60)} min ago`;
      if (sec < 86_400) return `${Math.floor(sec / 3600)} hr ago`;
      return `${Math.floor(sec / 86_400)} day ago`;
    }
    const update = () => setUpdatedLabel(relativeTime(live?.updatedAt));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [live?.updatedAt]);

  const w = clampInt(width,  1, 100000, 100);
  const t = clampInt(thick,  1, 100000, 10);
  const L = clampInt(length, 1, 100000, 2500);

  // A new dimension/metal combination is a new, unsaved result
  useEffect(() => { setBookmarked(false); }, [w, t, L, metal]);

  const weightKg = useMemo(
    () => (w * t * L * grade.density) / 1_000_000,
    [w, t, L, grade.density],
  );

  const pricePerKgUSD   = live?.pricePerKg ?? 0;
  const totalUSD        = weightKg * pricePerKgUSD;
  const maxCurrentA     = Math.round(w * t * CURRENT_DENSITY[metal]);

  const fxRate = (code: CurrCode): number => {
    if (code === 'USD' || !fx) return 1;
    if (code === 'IRR') return 500000;
    const r = (fx as unknown as Record<string, number>)[code];
    return typeof r === 'number' && r > 0 ? r : 1;
  };
  const totalIn = (code: CurrCode) => totalUSD * fxRate(code);

  // Which currency is "active" — either from grid or custom
  const activeCurr = curr;
  const activeCurrTotal = totalIn(activeCurr);

  // Is the active currency one of the grid currencies?
  const isCustomActive = customCurr !== null && !GRID_CURRENCIES.includes(activeCurr as CurrCode);

  function requireAuth(action: () => void) {
    if (user) {
      action();
    } else {
      pendingActionRef.current = action;
      setAuthMode('login');
      setAuthOpen(true);
    }
  }

  function handleAuthSuccess() {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const u = data?.user ?? null;
        setUser(u);
        if (u && pendingActionRef.current) {
          pendingActionRef.current();
          pendingActionRef.current = null;
        }
      })
      .catch(() => {});
  }

  function handleCalculate() {
    setShowResults(true);
    setTimeout(() => {
      currCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  }

  // Open the "name your bookmark" dialog (after auth gate)
  function openBookmarkDialog() {
    requireAuth(() => {
      setBookmarkName(`${metal === 'copper' ? 'Copper' : 'Aluminum'} ${w}×${t}×${L}mm`);
      setShowNameDialog(true);
      setTimeout(() => nameInputRef.current?.select(), 60);
    });
  }

  // Persist the bookmark to history with the chosen name
  async function handleSaveBookmark() {
    const name = bookmarkName.trim() || 'Untitled';
    setSavingBookmark(true);
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, metal, width: w, thickness: t, length: L,
          price: activeCurrTotal,
          currency: CURR_META[activeCurr].label,
        }),
      });
      if (!res.ok) throw new Error('save_failed');
      setBookmarked(true);
      setShowNameDialog(false);
      setSaveToast('Saved to History');
      setTimeout(() => setSaveToast(null), 2600);
    } catch {
      setSaveToast('Could not save — try again');
      setTimeout(() => setSaveToast(null), 2600);
    } finally {
      setSavingBookmark(false);
    }
  }

  function handlePickerSelect(code: CurrCode) {
    setCurr(code);
    if (!GRID_CURRENCIES.includes(code)) {
      setCustomCurr(code);
    } else {
      setCustomCurr(null);
    }
    setShowPicker(false);
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="fx-content">

      {/* ── Metal toggle ───────────────────────────────── */}
      <div className="fx-metal-toggle">
        <button
          type="button"
          className={`fx-metal-btn${metal === 'copper' ? ' active' : ''}`}
          data-metal="copper"
          onClick={() => setMetal('copper')}
        >
          <BusbarMock metal="copper" />
          <span>Copper</span>
        </button>
        <button
          type="button"
          className={`fx-metal-btn${metal === 'aluminum' ? ' active' : ''}`}
          data-metal="aluminum"
          onClick={() => setMetal('aluminum')}
        >
          <BusbarMock metal="aluminum" />
          <span>Aluminum</span>
        </button>
      </div>

      {/* ── Dimensions card ────────────────────────────── */}
      <div className="fx-card">
        <div className="fx-card-head">
          <div className="fx-card-head-label">
            <RulerAngularIcon className="fx-card-head-icon" />
            <span className="fx-card-head-title">Dimensions</span>
          </div>
          <div className="fx-card-head-badge">mm</div>
        </div>

        <div className="fx-suggestions">
          <span className="fx-suggestions-label">Suggestions</span>
          <div className="fx-suggestions-scroll no-scrollbar">
            {PRESETS.map(p => {
              const isActive = width === p.w && thick === p.t;
              return (
                <button
                  key={`${p.w}x${p.t}`}
                  type="button"
                  className={`fx-suggestion-pill${isActive ? ' active' : ''}`}
                  onClick={() => { setWidth(p.w); setThick(p.t); setInteracted(true); }}
                >
                  {p.w}x{p.t}
                </button>
              );
            })}
          </div>
        </div>

        <DimInput label="Length"    value={length} onChange={setLength}
          onFocus={() => setInteracted(true)}
          onBlur={v => setLength(String(clampInt(v, 1, 100000, 2500)))} />
        <DimInput label="Width"     value={width}  onChange={setWidth}
          onFocus={() => setInteracted(true)}
          onBlur={v => setWidth(String(clampInt(v, 1, 100000, 100)))} />
        <DimInput label="Thickness" value={thick}  onChange={setThick}
          onFocus={() => setInteracted(true)}
          onBlur={v => setThick(String(clampInt(v, 1, 100000, 10)))} />

        {/* Calculate Now button — Figma: bg-#d80027, rounded-12, text-24px */}
        {interacted && (
          <button type="button" className="fx-calc-now-btn" onClick={handleCalculate}>
            Calculate Now
          </button>
        )}
      </div>

      {/* ── Currency Conversion card — Figma 2×2 grid ── */}
      {interacted && (
        <div className="fx-curr-card" ref={currCardRef}>
          <div className="fx-curr-card-head">
            <div className="fx-curr-card-head-inner">
              <DollarIcon className="fx-curr-card-icon" width={24} height={24} />
              <span className="fx-curr-card-title">Currency Conversion</span>
            </div>
          </div>

          {/* Row 1: USD + EUR */}
          <div className="fx-curr-grid-row">
            {GRID_CURRENCIES.slice(0, 2).map(code => {
              const Flag = FLAGS[code as keyof typeof FLAGS];
              const isActive = activeCurr === code && !isCustomActive;
              return (
                <button
                  key={code}
                  type="button"
                  className={`fx-curr-cell${isActive ? ' active' : ''}`}
                  onClick={() => { setCurr(code as CurrCode); setCustomCurr(null); }}
                  aria-pressed={isActive}
                >
                  {Flag && <Flag className="fx-curr-cell-flag" width={30} height={30} />}
                  <div className="fx-curr-cell-text">
                    <span className="fx-curr-cell-code">{CURR_META[code as CurrCode].label}</span>
                    <span className="fx-curr-cell-value">{fmtResultPrice(totalIn(code as CurrCode))}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Row 2: GBP + Other */}
          <div className="fx-curr-grid-row">
            {/* GBP cell */}
            {(() => {
              const code = GRID_CURRENCIES[2]; // 'GBP'
              const Flag = FLAGS[code as keyof typeof FLAGS];
              const isActive = activeCurr === code && !isCustomActive;
              return (
                <button
                  type="button"
                  className={`fx-curr-cell${isActive ? ' active' : ''}`}
                  onClick={() => { setCurr(code as CurrCode); setCustomCurr(null); }}
                  aria-pressed={isActive}
                >
                  {Flag && <Flag className="fx-curr-cell-flag" width={30} height={30} />}
                  <div className="fx-curr-cell-text">
                    <span className="fx-curr-cell-code">{CURR_META[code as CurrCode].label}</span>
                    <span className="fx-curr-cell-value">{fmtResultPrice(totalIn(code as CurrCode))}</span>
                  </div>
                </button>
              );
            })()}

            {/* Other / custom currency cell */}
            {isCustomActive && customCurr ? (
              <button
                type="button"
                className="fx-curr-cell active"
                onClick={() => { setShowPicker(true); setPickerSearch(''); }}
              >
                {(() => {
                  const Flag = FLAGS[customCurr as keyof typeof FLAGS];
                  return Flag ? <Flag className="fx-curr-cell-flag" width={30} height={30} /> : (
                    <span className="fx-curr-other-icon">
                      <PlusSvg />
                    </span>
                  );
                })()}
                <div className="fx-curr-cell-text">
                  <span className="fx-curr-cell-code">{CURR_META[customCurr].label}</span>
                  <span className="fx-curr-cell-value">{fmtResultPrice(totalIn(customCurr))}</span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                className="fx-curr-cell-other"
                onClick={() => { setShowPicker(true); setPickerSearch(''); }}
              >
                <span className="fx-curr-other-icon"><PlusSvg /></span>
                <span className="fx-curr-other-label">Other</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Results — stats + actions ───────────────────── */}
      {showResults && (
        <div className="fx-results" ref={resultsRef}>
          {/* Estimate Price + Live badge */}
          <div className="fx-results-price-row">
            <span className="fx-results-price-label">Estimate Price</span>
            <span className="fx-results-live-badge">
              <span className="fx-results-live-dot" />
              Live COMEX
            </span>
          </div>

          {/* Stats rows */}
          <div className="fx-results-stat-row fx-results-stat-border">
            <span className="fx-results-stat-label">WEIGHT</span>
            <span className="fx-results-stat-value">
              {fmtMoney(weightKg)} <span className="fx-results-stat-unit">kg</span>
            </span>
          </div>
          <div className="fx-results-stat-row fx-results-stat-border">
            <span className="fx-results-stat-label">MATERIAL</span>
            <span className="fx-results-stat-value">{metal}</span>
          </div>
          <div className="fx-results-stat-row">
            <span className="fx-results-stat-label">Rated Current</span>
            <span className="fx-results-stat-value">
              {maxCurrentA.toLocaleString()} <span className="fx-results-stat-unit">A</span>
            </span>
          </div>

          {/* Action buttons — Compare + Bookmark */}
          <div className="fx-results-actions">
            <button
              type="button"
              className={`fx-results-btn${showCompare ? ' active' : ''}`}
              onClick={() => setShowCompare(true)}
              aria-label="Compare result"
            >
              <CompareIcon width={20} height={20} />
              Compare
            </button>
            <button
              type="button"
              className={`fx-results-btn${bookmarked ? ' active' : ''}`}
              onClick={openBookmarkDialog}
              aria-label="Bookmark result"
              aria-pressed={bookmarked}
            >
              <BookmarkIcon width={20} height={20} />
              {bookmarked ? 'Saved' : 'Bookmark'}
            </button>
            <button
              type="button"
              className="fx-results-btn"
              onClick={() => {
                const txt = `Busbar — ${metal} ${w}×${t}×${L}mm → ${fmtResultPrice(activeCurrTotal)} ${CURR_META[activeCurr].label}`;
                if (navigator.share) {
                  navigator.share({ title: 'Busbar Calculator', text: txt }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(txt).catch(() => {});
                }
              }}
              aria-label="Share result"
            >
              <ShareIcon width={20} height={20} />
              Share
            </button>
          </div>
        </div>
      )}

      {/* ── Price Trend chart ──────────────────────────── */}
      {showResults && (
        <FxBusbarChart
          metal={metal}
          weightKg={weightKg}
          fxRate={fxRate(activeCurr)}
          currLabel={CURR_META[activeCurr].label}
          pricePerKgUSD={pricePerKgUSD}
          updatedLabel={updatedLabel}
        />
      )}

      {/* ── Currency Picker Sheet ─────────────────────── */}
      {showPicker && (
        <div
          className="fx-picker-overlay"
          onClick={() => setShowPicker(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Select currency"
        >
          <div className="fx-picker-sheet" onClick={e => e.stopPropagation()}>
            <div className="fx-picker-handle" />
            <div className="fx-picker-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fx-picker-search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                ref={pickerInput}
                type="text"
                className="fx-picker-search"
                placeholder="Search for other currency"
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="fx-picker-list">
              {PICKER_CURRENCIES
                .filter(code => {
                  const q = pickerSearch.toLowerCase();
                  if (!q) return true;
                  const m = CURR_META[code];
                  return m.name.toLowerCase().includes(q) || m.label.toLowerCase().includes(q);
                })
                .map(code => {
                  const Flag = FLAGS[code as keyof typeof FLAGS];
                  const m = CURR_META[code];
                  const isActive = activeCurr === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`fx-picker-row${isActive ? ' active' : ''}`}
                      onClick={() => handlePickerSelect(code)}
                    >
                      {Flag && <Flag className="fx-picker-flag" width={32} height={32} />}
                      <span className="fx-picker-name">{m.name}</span>
                      <span className="fx-picker-value">{fmtMoney(totalIn(code))}</span>
                    </button>
                  );
                })
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Name-your-bookmark dialog ─────────────────── */}
      {showNameDialog && (
        <div
          className="fx-name-overlay"
          onClick={() => !savingBookmark && setShowNameDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Name your bookmark"
        >
          <div className="fx-name-dialog" onClick={e => e.stopPropagation()}>
            <div className="fx-name-dialog-head">
              <span className="fx-name-dialog-icon"><BookmarkIcon width={22} height={22} /></span>
              <div className="fx-name-dialog-titles">
                <h3 className="fx-name-dialog-title">Save to History</h3>
                <p className="fx-name-dialog-sub">Give this calculation a name</p>
              </div>
            </div>

            <input
              ref={nameInputRef}
              type="text"
              className="fx-name-input"
              value={bookmarkName}
              maxLength={120}
              placeholder="e.g. Main panel busbar"
              onChange={e => setBookmarkName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && bookmarkName.trim() && !savingBookmark) handleSaveBookmark();
                if (e.key === 'Escape' && !savingBookmark) setShowNameDialog(false);
              }}
              autoFocus
            />

            <div className="fx-name-preview">
              {metal === 'copper' ? 'Copper' : 'Aluminum'} · {L}×{w}×{t} mm · {fmtResultPrice(activeCurrTotal)} {CURR_META[activeCurr].label}
            </div>

            <div className="fx-name-actions">
              <button
                type="button"
                className="fx-name-btn fx-name-btn-cancel"
                onClick={() => setShowNameDialog(false)}
                disabled={savingBookmark}
              >
                Cancel
              </button>
              <button
                type="button"
                className="fx-name-btn fx-name-btn-save"
                onClick={handleSaveBookmark}
                disabled={savingBookmark || !bookmarkName.trim()}
              >
                {savingBookmark ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save toast ─────────────────────────────────── */}
      {saveToast && <div className="fx-save-toast">{saveToast}</div>}

      {/* ── Compare sheet ─────────────────────────────── */}
      <FxCompareSheet
        open={showCompare}
        onClose={() => setShowCompare(false)}
        configA={{
          metal, w, t, L,
          weightKg, totalUSD,
          pricePerKgUSD,
          maxCurrentA,
        }}
        copper={copper}
        aluminum={aluminum}
        fxRate={fxRate}
        activeCurr={activeCurr}
        currLabel={CURR_META[activeCurr].label}
      />

      {/* ── Auth sheet ────────────────────────────────── */}
      <FxAuthSheet
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

/* ── Inline + SVG icon ────────────────────────────────────── */
function PlusSvg() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="14" y="7"  width="2" height="16" rx="1" fill="currentColor" />
      <rect x="7"  y="14" width="16" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

/* ── Dimension input row ────────────────────────────────── */
function DimInput({
  label, value, onChange, onBlur, onFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: (v: string) => void;
  onFocus?: () => void;
}) {
  return (
    <div className="fx-input-card">
      <label className="fx-input-label">
        <RulerIcon className="fx-input-label-icon" />
        <span>{label}</span>
      </label>
      <div className="fx-input-row">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="fx-input-field"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          onFocus={onFocus}
          onBlur={e => onBlur(e.target.value)}
        />
        <span className="fx-input-unit">mm</span>
      </div>
    </div>
  );
}
