'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_GRADE } from '@/lib/copperData';
import { DEFAULT_ALUMINUM_GRADE } from '@/lib/aluminumData';
import type { CopperPriceData, FxRates, InitialPriceData } from '@/types/calculator';
import {
  BusbarMock, RulerAngularIcon, RulerIcon, DollarIcon, ChartUpIcon,
} from './FxIcons';
import { BusbarRender } from '@/components/BusbarRender';
import { FLAGS } from './FxFlags';
import { FxAuthSheet } from './FxAuthSheet';

type Metal = 'copper' | 'aluminum';
type CurrCode = 'USD' | 'AED' | 'CNY' | 'EUR' | 'GBP' | 'TRY' | 'IRR';
type ChartRange = '1D' | '7D' | '1M' | '1Y';

const TREND_POINTS: Record<ChartRange, string> = {
  '1D': '0,90 12,82 24,75 36,68 48,60 60,55 72,48 84,32 95,18',
  '7D': '0,95 12,72 24,88 36,55 48,68 60,30 72,52 84,22 95,18',
  '1M': '0,80 14,60 28,72 42,40 56,55 70,28 84,35 95,18',
  '1Y': '0,110 16,85 32,95 48,60 64,72 80,40 95,18',
};

const PRESETS: Array<{ w: string; t: string }> = [
  { w: '100', t: '10' },
  { w: '200', t: '20' },
  { w: '300', t: '30' },
  { w: '400', t: '40' },
  { w: '500', t: '50' },
];

// Currencies shown in the main 2×2 grid
const GRID_CURRENCIES: CurrCode[] = ['USD', 'EUR', 'GBP'];

// Label and name for all supported currencies
const CURR_META: Record<CurrCode, { label: string; name: string }> = {
  USD: { label: 'USD',  name: 'US Dollar' },
  EUR: { label: 'EUR',  name: 'Euro' },
  GBP: { label: 'PND',  name: 'British Pound' },
  AED: { label: 'AED',  name: 'UAE Dirham' },
  CNY: { label: 'Yuan', name: 'Chinese Yuan' },
  TRY: { label: 'Lira', name: 'Turkish Lira' },
  IRR: { label: 'Rial', name: 'Iranian Rial' },
};

// Currencies shown in the "Other" picker (all that aren't always in the grid)
const PICKER_CURRENCIES: CurrCode[] = ['GBP', 'TRY', 'IRR', 'CNY', 'AED', 'EUR'];

// Current density for busbar (A/mm²) — standard indoor rating
const CURRENT_DENSITY: Record<Metal, number> = { copper: 2.5, aluminum: 1.5 };

function relativeTime(iso?: string | null): string {
  if (!iso) return 'just now';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'just now';
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 30)       return 'just now';
  if (sec < 60)       return `${sec} sec ago`;
  if (sec < 3600)     return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86_400)   return `${Math.floor(sec / 3600)} hr ago`;
  return `${Math.floor(sec / 86_400)} day ago`;
}

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

function fmtPrice(n: number, decimals = 3): string {
  return fmtMoney(n, decimals);
}

export function FxCalculator({ initialData }: { initialData?: InitialPriceData }) {
  const [metal,  setMetal]  = useState<Metal>('copper');
  const [width,  setWidth]  = useState('100');
  const [thick,  setThick]  = useState('10');
  const [length, setLength] = useState('2500');
  const [curr,   setCurr]   = useState<CurrCode>('USD');
  const [range,  setRange]  = useState<ChartRange>('1D');

  const [copper,   setCopper]   = useState<CopperPriceData | null>(initialData?.copper   ?? null);
  const [aluminum, setAluminum] = useState<CopperPriceData | null>(initialData?.aluminum ?? null);
  const [fx,       setFx]       = useState<FxRates | null>(initialData?.fx ?? null);

  const [updatedLabel,  setUpdatedLabel]  = useState('just now');
  const [showResults,   setShowResults]   = useState(false);
  const [showPicker,    setShowPicker]    = useState(false);
  const [pickerSearch,  setPickerSearch]  = useState('');
  const [bookmarked,    setBookmarked]    = useState(false);
  const [shareMsg,      setShareMsg]      = useState('');

  // Auth sheet state (triggered when not logged in)
  const [authOpen,     setAuthOpen]     = useState(false);
  const [authMode,     setAuthMode]     = useState<'login' | 'signup'>('login');
  const pendingActionRef = useRef<(() => void) | null>(null);

  // User auth state
  const [user, setUser] = useState<{ id: number; email: string } | null | undefined>(undefined);

  const resultsRef  = useRef<HTMLDivElement>(null);
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

  // Load auth state once
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const grade = metal === 'copper' ? DEFAULT_GRADE : DEFAULT_ALUMINUM_GRADE;
  const live  = metal === 'copper' ? copper        : aluminum;

  useEffect(() => {
    const update = () => setUpdatedLabel(relativeTime(live?.updatedAt));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [live?.updatedAt]);

  const w = clampInt(width,  1, 100000, 100);
  const t = clampInt(thick,  1, 100000, 10);
  const L = clampInt(length, 1, 100000, 2500);

  const weightKg = useMemo(
    () => (w * t * L * grade.density) / 1_000_000,
    [w, t, L, grade.density],
  );

  const pricePerKgUSD   = live?.pricePerKg ?? 0;
  const totalUSD        = weightKg * pricePerKgUSD;
  const maxCurrentA     = Math.round(w * t * CURRENT_DENSITY[metal]);
  const crossSectionMm2 = w * t;

  const fxRate = (code: CurrCode): number => {
    if (code === 'USD' || !fx) return 1;
    if (code === 'IRR') return 500000; // fixed official-ish rate
    const r = (fx as unknown as Record<string, number>)[code];
    return typeof r === 'number' && r > 0 ? r : 1;
  };
  const totalIn = (code: CurrCode) => totalUSD * fxRate(code);
  const activeCurrTotal = totalIn(curr);

  // ── Actions ──────────────────────────────────────────────────────

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
    // Re-fetch user, then run pending action
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
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  }

  async function handleBookmark() {
    requireAuth(async () => {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metal, width: w, thickness: t, length: L }),
        });
        setBookmarked(true);
        setTimeout(() => setBookmarked(false), 2500);
      } catch { /* ignore */ }
    });
  }

  function handleCompare() {
    requireAuth(() => {
      setShareMsg('Compare feature coming soon!');
      setTimeout(() => setShareMsg(''), 2200);
    });
  }

  async function handleShare() {
    const metalLabel = metal === 'copper' ? 'Copper' : 'Aluminum';
    const text = [
      `📐 Busbar Calculator Result`,
      ``,
      `Material:    ${metalLabel}`,
      `Dimensions:  ${w} × ${t} × ${L} mm`,
      `Cross-section: ${crossSectionMm2.toLocaleString()} mm²`,
      `Weight:      ${fmtMoney(weightKg)} kg`,
      `Current cap: ${maxCurrentA.toLocaleString()} A`,
      `Est. price:  $${fmtMoney(totalUSD)} USD`,
      ``,
      `📲 Free calculator:`,
      `https://calculator.payapress.com`,
    ].join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Busbar Calculation',
          text,
          url: 'https://calculator.payapress.com',
        });
      } else {
        await navigator.clipboard.writeText(text);
        setShareMsg('Copied to clipboard!');
        setTimeout(() => setShareMsg(''), 2200);
      }
    } catch { /* dismissed */ }
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

      {/* ── Dimensions ─────────────────────────────────── */}
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
                  onClick={() => { setWidth(p.w); setThick(p.t); }}
                >
                  {p.w}×{p.t}
                </button>
              );
            })}
          </div>
        </div>

        <DimInput label="Length"   value={length} onChange={setLength}
          onBlur={v => setLength(String(clampInt(v, 1, 100000, 2500)))} />
        <DimInput label="Width"    value={width}  onChange={setWidth}
          onBlur={v => setWidth(String(clampInt(v, 1, 100000, 100)))} />
        <DimInput label="Thikness" value={thick}  onChange={setThick}
          onBlur={v => setThick(String(clampInt(v, 1, 100000, 10)))} />
      </div>

      {/* ── Dynamic busbar render ──────────────────────── */}
      <div className="fx-busbar-render">
        <BusbarRender width={w} thickness={t} metal={metal} />
      </div>

      {/* ── Calculate Now ──────────────────────────────── */}
      <button type="button" className="fx-calc-now-btn" onClick={handleCalculate}>
        Calculate Now
      </button>

      {/* ── Currency Conversion ────────────────────────── */}
      <div className="fx-card">
        <div className="fx-card-head">
          <div className="fx-card-head-label">
            <DollarIcon className="fx-card-head-icon" />
            <span className="fx-card-head-title">Currency Conversion</span>
          </div>
        </div>

        {/* 2×2 grid: 3 main currencies + Other button */}
        <div className="fx-currency-grid">
          {GRID_CURRENCIES.map(code => {
            const Flag = FLAGS[code as keyof typeof FLAGS];
            const isActive = curr === code;
            return (
              <button
                key={code}
                type="button"
                className={`fx-currency-cell2${isActive ? ' active' : ''}`}
                onClick={() => setCurr(code)}
                aria-pressed={isActive}
              >
                {Flag && <Flag className="fx-currency-flag" width={28} height={28} />}
                <div className="fx-currency-info">
                  <div className="fx-currency-code">{CURR_META[code].label}</div>
                  <div className="fx-currency-value">{fmtMoney(totalIn(code))}</div>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            className="fx-currency-other-btn"
            onClick={() => { setShowPicker(true); setPickerSearch(''); }}
          >
            <span className="fx-currency-other-plus">+</span>
            <span>Other</span>
          </button>
        </div>
      </div>

      {/* ── Results ────────────────────────────────────── */}
      {showResults && (
        <div className="fx-results" ref={resultsRef}>
          <h3 className="fx-results-title">Results</h3>

          <div className="fx-results-price-row">
            <span className="fx-results-price-label">Estimate Price</span>
            <span className="fx-results-live-badge">
              <span className="fx-results-live-dot" />
              Live COMEX
            </span>
          </div>

          <div className="fx-results-price">
            {curr === 'USD' ? '$' : ''}{fmtMoney(activeCurrTotal)}
            {curr !== 'USD' && <span className="fx-results-price-curr"> {CURR_META[curr].label}</span>}
          </div>

          <div className="fx-results-stats">
            <div className="fx-results-stat">
              <div className="fx-results-stat-label">WEIGHT</div>
              <div className="fx-results-stat-value">{fmtMoney(weightKg)} <span className="fx-results-stat-unit">kg</span></div>
            </div>
            <div className="fx-results-stat">
              <div className="fx-results-stat-label">MATERIAL</div>
              <div className="fx-results-stat-value">{metal}</div>
            </div>
            <div className="fx-results-stat">
              <div className="fx-results-stat-label">CURRENT CAP.</div>
              <div className="fx-results-stat-value">{maxCurrentA.toLocaleString()} <span className="fx-results-stat-unit">A</span></div>
            </div>
            <div className="fx-results-stat">
              <div className="fx-results-stat-label">PRICE / KG</div>
              <div className="fx-results-stat-value">${fmtPrice(pricePerKgUSD)}</div>
            </div>
            <div className="fx-results-stat">
              <div className="fx-results-stat-label">CROSS-SECTION</div>
              <div className="fx-results-stat-value">{crossSectionMm2.toLocaleString()} <span className="fx-results-stat-unit">mm²</span></div>
            </div>
            <div className="fx-results-stat">
              <div className="fx-results-stat-label">DIMENSIONS</div>
              <div className="fx-results-stat-value" style={{ fontSize: 14 }}>{w}×{t}×{L}</div>
            </div>
          </div>

          {shareMsg && (
            <p className="fx-results-share-msg">{shareMsg}</p>
          )}
          {bookmarked && (
            <p className="fx-results-share-msg" style={{ color: '#22c55e' }}>Saved to history!</p>
          )}

          <div className="fx-results-actions">
            <button type="button" className="fx-results-btn" onClick={handleCompare}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/><circle cx="17" cy="17" r="4"/><path d="m15 17 1 1 2-2"/></svg>
              Compare result
            </button>
            <button type="button" className="fx-results-btn" onClick={handleBookmark}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              {bookmarked ? 'Saved!' : 'Bookmark result'}
            </button>
          </div>

          <button type="button" className="fx-results-share-btn" onClick={handleShare}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share Result
          </button>
        </div>
      )}

      {/* ── Price Trend ────────────────────────────────── */}
      <div className="fx-card">
        <div className="fx-card-head">
          <div className="fx-card-head-label">
            <ChartUpIcon className="fx-card-head-icon" />
            <span className="fx-card-head-title">
              {metal === 'copper' ? 'Copper' : 'Aluminum'} Price Trend
            </span>
          </div>
          <div className="fx-tab-group">
            {(['1D', '7D', '1M', '1Y'] as const).map(r => (
              <button
                key={r}
                type="button"
                className={`fx-tab${range === r ? ' active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="fx-chart-row">
          <div className="fx-chart-info">
            <div>
              <div className="fx-chart-current-label">Current Price</div>
              <div className="fx-chart-current-price">
                ${fmtPrice(pricePerKgUSD)}
                <span className="unit">/kg</span>
              </div>
              <div className="fx-chart-change">+2.45% (220.50)</div>
            </div>
            <div className="fx-chart-update">Updated: {updatedLabel}</div>
          </div>
          <TrendChart metal={metal} range={range} />
        </div>
      </div>

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
                  const isActive = curr === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`fx-picker-row${isActive ? ' active' : ''}`}
                      onClick={() => { setCurr(code); setShowPicker(false); }}
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

      {/* ── Auth sheet (triggered by compare/bookmark) ── */}
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

/* ── Dimension input row ────────────────────────────────── */
function DimInput({
  label, value, onChange, onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: (v: string) => void;
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
          onBlur={e => onBlur(e.target.value)}
        />
        <span className="fx-input-unit">mm</span>
      </div>
    </div>
  );
}

/* ── Trend chart ───────────────────────────────────────── */
function TrendChart({ metal, range }: { metal: Metal; range: ChartRange }) {
  const stroke = metal === 'copper' ? '#d71920' : '#6fb3e0';
  const points = TREND_POINTS[range];
  return (
    <div className="fx-chart-canvas">
      <svg viewBox="0 0 100 140" preserveAspectRatio="none" width="100%" height="100%">
        {[20, 40, 60, 80, 100, 120].map(y => (
          <line key={y} x1="6" x2="98" y1={y} y2={y}
                stroke="#ffffff14" strokeWidth="0.4" />
        ))}
        {[
          { y: 24, t: '200' }, { y: 44, t: '100' }, { y: 64, t: '0' },
          { y: 84, t: '-100' }, { y: 104, t: '-200' }, { y: 124, t: '-300' },
        ].map(l => (
          <text key={l.t} x="2" y={l.y} fontSize="6" fill="#9ca3af">{l.t}</text>
        ))}
        <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="95" cy="18" r="2" fill={stroke} />
        <text x="80" y="14" fontSize="6" fill="#ccc">151</text>
      </svg>
    </div>
  );
}
