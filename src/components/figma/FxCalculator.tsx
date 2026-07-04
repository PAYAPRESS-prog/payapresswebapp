'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MATERIAL_GRADES, DEFAULT_GRADE } from '@/lib/copperData';
import { ALUMINUM_GRADES, DEFAULT_ALUMINUM_GRADE } from '@/lib/aluminumData';
import type { CopperPriceData, FxRates, InitialPriceData } from '@/types/calculator';
import {
  BusbarMock, RulerAngularIcon, RulerIcon, DollarIcon,
  BookmarkIcon, ShareIcon, CompareIcon,
} from './FxIcons';
import { FLAGS } from './FxFlags';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';
import { FxAuthSheet } from './FxAuthSheet';
import { FxBusbarChart } from './FxBusbarChart';
import { FxBusbarRender } from './FxBusbarRender';
import { FxCompareSheet } from './FxCompareSheet';
import { FxWasteSheet } from './FxWasteSheet';

type Metal = 'copper' | 'aluminum';
type CurrCode =
  | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CNY' | 'TRY' | 'IRR'
  | 'SAR' | 'CAD' | 'AUD' | 'CHF' | 'JPY' | 'INR' | 'RUB'
  | 'KWD' | 'QAR' | 'SGD';

// Suggestion presets (width × thickness, mm) — exactly matching the Figma.
// Mobile page 0:1 shows 7; desktop page 114:299 shows 9 (800x80, 900x90
// are hidden below 1024px via .fx-preset-desktop-only).
const PRESETS: Array<{ w: string; t: string; desktopOnly?: boolean }> = [
  { w: '100', t: '10' },
  { w: '200', t: '20' },
  { w: '300', t: '30' },
  { w: '400', t: '40' },
  { w: '500', t: '50' },
  { w: '600', t: '60' },
  { w: '700', t: '70' },
  { w: '800', t: '80', desktopOnly: true },
  { w: '900', t: '90', desktopOnly: true },
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
  const [width,  setWidth]  = useState('');
  const [thick,  setThick]  = useState('');
  const [length, setLength] = useState('');
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

  const [gradeIdx,    setGradeIdx]    = useState(0);
  const [showCompare, setShowCompare] = useState(false);
  const [showWaste,   setShowWaste]   = useState(false);
  const saveForWasteRef = useRef(false);

  const [authOpen,  setAuthOpen]  = useState(false);
  const [authMode,  setAuthMode]  = useState<'login' | 'signup'>('login');
  const pendingActionRef = useRef<(() => void) | null>(null);

  const [user, setUser] = useState<{ id: number; email: string } | null | undefined>(undefined);

  // Portal / mobile bottom-sheet state
  const [isMobile,       setIsMobile]       = useState(false);
  const [mounted,        setMounted]        = useState(false);
  const [resultsLeaving, setResultsLeaving] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const currCardRef = useRef<HTMLDivElement>(null);
  const pickerInput = useRef<HTMLInputElement>(null);

  // Detect mobile breakpoint — results render as portal bottom-sheet on mobile
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Live price refresh every 5 min — 5s timeout prevents hanging on slow APIs
  useEffect(() => {
    // r.ok check is critical: the Service Worker answers failed API calls
    // with a 503 `{offline:true}` JSON body. Without the check that object
    // reaches setCopper/setFx, pricePerKg becomes undefined and the next
    // render crashes the whole app (every button stops working).
    const fetchJson = (url: string) =>
      fetch(url, { signal: AbortSignal.timeout(5000) })
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null);

    const tick = async () => {
      const [c, a, f] = await Promise.all([
        fetchJson('/api/copper-price'),
        fetchJson('/api/aluminum-price'),
        fetchJson('/api/fx-rate'),
      ]);
      if (c && typeof c.pricePerKg === 'number') setCopper(c);
      if (a && typeof a.pricePerKg === 'number') setAluminum(a);
      // FxRates is flat: rates live at the top level ({EUR: 0.9, ...}),
      // so validate by probing a known rate key — NOT a nested .rates object.
      if (f && typeof f.EUR === 'number') setFx(f);
    };
    if (initialData?.copper == null) tick();
    const id = setInterval(tick, 300_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/api/auth/me', { signal: AbortSignal.timeout(4000) })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const grades = metal === 'copper' ? MATERIAL_GRADES : ALUMINUM_GRADES;
  const grade  = grades[gradeIdx] ?? (metal === 'copper' ? DEFAULT_GRADE : DEFAULT_ALUMINUM_GRADE);
  const live   = metal === 'copper' ? copper : aluminum;

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

  // Lock body scroll while any bottom sheet is open (prevents iOS background scroll)
  useEffect(() => {
    const locked = showPicker || showNameDialog || (showResults && isMobile) || showWaste;
    if (!locked) return;
    lockBodyScroll();
    return () => { unlockBodyScroll(); };
  }, [showPicker, showNameDialog, showResults, isMobile, showWaste]);

  // Delayed focus on picker search — avoids iOS keyboard shift before sheet animates in
  useEffect(() => {
    if (!showPicker) return;
    const id = setTimeout(() => pickerInput.current?.focus(), 300);
    return () => clearTimeout(id);
  }, [showPicker]);

  // Reset grade to default when metal changes
  useEffect(() => { setGradeIdx(0); }, [metal]);

  // A new dimension/metal combination is a new, unsaved result
  useEffect(() => { setBookmarked(false); }, [w, t, L, metal]);

  const weightKg = useMemo(
    () => (w * t * L * grade.density) / 1_000_000,
    [w, t, L, grade.density],
  );

  const spotPerKgUSD    = live?.pricePerKg ?? 0;
  const pricePerKgUSD   = spotPerKgUSD * (1 + grade.busbarPremium);
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
    // On desktop: scroll results into view; on mobile the sheet pops up
    if (!isMobile) {
      setTimeout(() => {
        currCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }

  // Close the results sheet with slide-out animation on mobile
  function closeResults() {
    if (!isMobile) { setShowResults(false); return; }
    setResultsLeaving(true);
    setTimeout(() => {
      setShowResults(false);
      setResultsLeaving(false);
    }, 340);
  }

  // Open the "name your bookmark" dialog (after auth gate)
  function openBookmarkDialog() {
    requireAuth(() => {
      setBookmarkName(`${metal === 'copper' ? 'Copper' : 'Aluminum'} ${w}×${t}×${L}mm`);
      setShowNameDialog(true);
      setTimeout(() => { nameInputRef.current?.focus(); nameInputRef.current?.select(); }, 300);
    });
  }

  // Persist the bookmark to history with the chosen name
  async function handleSaveBookmark() {
    const name = bookmarkName.trim() || 'Untitled';
    setSavingBookmark(true);
    const forWaste = saveForWasteRef.current;
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
      saveForWasteRef.current = false;
      if (forWaste) {
        setShowWaste(true);
      } else {
        setSaveToast('Saved to History');
        setTimeout(() => setSaveToast(null), 2600);
      }
    } catch {
      saveForWasteRef.current = false;
      setSaveToast('Could not save — try again');
      setTimeout(() => setSaveToast(null), 2600);
    } finally {
      setSavingBookmark(false);
    }
  }

  // Opens waste sheet: auth gate → name dialog → waste popup
  function openWasteSheet() {
    requireAuth(() => {
      saveForWasteRef.current = true;
      setBookmarkName(`${metal === 'copper' ? 'Copper' : 'Aluminum'} ${w}×${t}×${L}mm`);
      setShowNameDialog(true);
      setTimeout(() => { nameInputRef.current?.focus(); nameInputRef.current?.select(); }, 300);
    });
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

      {/* ══════════ LEFT COLUMN — inputs ══════════ */}
      <div className="fx-col-inputs">

      {/* ── Metal toggle ───────────────────────────────── */}
      <div className="fx-metal-toggle" data-tour="metal">
        <button
          type="button"
          className={`fx-metal-btn${metal === 'copper' ? ' active' : ''}`}
          data-metal="copper"
          onClick={() => setMetal('copper')}
        >
          <BusbarMock metal="copper" width={36} height={28} />
          <span>Copper</span>
        </button>
        <button
          type="button"
          className={`fx-metal-btn${metal === 'aluminum' ? ' active' : ''}`}
          data-metal="aluminum"
          onClick={() => setMetal('aluminum')}
        >
          <BusbarMock metal="aluminum" width={36} height={28} />
          <span>Aluminum</span>
        </button>
      </div>

      {/* ── Dimensions card ────────────────────────────── */}
      <div className="fx-card">
        <div className="fx-card-head">
          <div className="fx-card-head-label">
            <RulerAngularIcon className="fx-card-head-icon" />
            <h2 className="fx-card-head-title"><span className="sr-only">Busbar </span>Dimensions</h2>
          </div>
          <div className="fx-card-head-badge">mm</div>
        </div>

        {/* ── Material Grade selector ── */}
        <div className="fx-grade-section" data-tour="grade">
          <h3 className={`fx-grade-header${metal === 'aluminum' ? ' al' : ''}`}>
            <RulerIcon className="fx-grade-header-icon" width={13} height={13} />
            <span>{metal === 'copper' ? 'Grade of Copper' : 'Grade of Aluminum'}</span>
          </h3>
          <div className={`fx-grade-pills${metal === 'aluminum' ? ' al' : ''}`}>
            {grades.map((g, i) => (
              <button
                key={g.id}
                type="button"
                className={`fx-grade-pill${gradeIdx === i ? ' active' : ''}`}
                onClick={() => { setGradeIdx(i); setInteracted(true); }}
              >
                <span className="fx-grade-pill-label">{g.label}</span>
                <span className="fx-grade-pill-purity">{(g.purity * 100).toFixed(2)}%</span>
              </button>
            ))}
          </div>
          <div className="fx-grade-info">
            <span className="fx-grade-info-std">{grade.standard}</span>
            <span className="fx-grade-info-sep">·</span>
            <span className="fx-grade-info-desc">{grade.description.split('—')[1]?.trim() ?? grade.description}</span>
          </div>
        </div>

        <div className="fx-suggestions" data-tour="suggestions">
          <h3 className="fx-suggestions-label">Suggestions<span className="sr-only"> — standard busbar sizes</span></h3>
          <div className="fx-suggestions-scroll no-scrollbar">
            {PRESETS.map(p => {
              const isActive = width === p.w && thick === p.t;
              return (
                <button
                  key={`${p.w}x${p.t}`}
                  type="button"
                  className={`fx-suggestion-pill${isActive ? ' active' : ''}${p.desktopOnly ? ' fx-preset-desktop-only' : ''}`}
                  onClick={() => { setWidth(p.w); setThick(p.t); setInteracted(true); }}
                >
                  {p.w}x{p.t}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Inline 3-column dimension inputs ── */}
        <div className="fx-dim-row" data-tour="dimensions">
          <div className="fx-dim-col">
            <span className="fx-dim-col-label">Length</span>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*"
              className="fx-dim-col-input"
              value={length} placeholder="2500"
              onChange={e => { setLength(e.target.value.replace(/[^0-9]/g, '')); setInteracted(true); }}
              onFocus={() => setInteracted(true)}
              onBlur={e => { if (e.target.value) setLength(String(clampInt(e.target.value, 1, 100000, 2500))); }}
            />
            <span className="fx-dim-col-unit">mm</span>
          </div>
          <div className="fx-dim-col">
            <span className="fx-dim-col-label">Width</span>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*"
              className="fx-dim-col-input"
              value={width} placeholder="100"
              onChange={e => { setWidth(e.target.value.replace(/[^0-9]/g, '')); setInteracted(true); }}
              onFocus={() => setInteracted(true)}
              onBlur={e => { if (e.target.value) setWidth(String(clampInt(e.target.value, 1, 100000, 100))); }}
            />
            <span className="fx-dim-col-unit">mm</span>
          </div>
          <div className="fx-dim-col">
            <span className="fx-dim-col-label">Thickness</span>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*"
              className="fx-dim-col-input"
              value={thick} placeholder="10"
              onChange={e => { setThick(e.target.value.replace(/[^0-9]/g, '')); setInteracted(true); }}
              onFocus={() => setInteracted(true)}
              onBlur={e => { if (e.target.value) setThick(String(clampInt(e.target.value, 1, 100000, 10))); }}
            />
            <span className="fx-dim-col-unit">mm</span>
          </div>
        </div>

        {/* ── Live 3D busbar render — drag to resize ── */}
        <FxBusbarRender
          width={w}
          thick={t}
          metal={metal}
          onResize={(nw, nt) => {
            setWidth(String(nw));
            setThick(String(nt));
            setInteracted(true);
          }}
        />

        {/* Calculate Now button — always visible so user knows to tap it */}
        <button type="button" className="fx-calc-now-btn" onClick={handleCalculate} data-tour="calculate">
          Calculate Now
        </button>
      </div>

      {/* ── Currency Conversion card — Figma 2×2 grid ── */}
      {interacted && (
        <div className="fx-curr-card" ref={currCardRef}>
          <div className="fx-curr-card-head">
            <div className="fx-curr-card-head-inner">
              <DollarIcon className="fx-curr-card-icon" width={24} height={24} />
              <h2 className="fx-curr-card-title">Currency Conversion<span className="sr-only"> for busbar prices</span></h2>
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

      </div>{/* end fx-col-inputs */}

      {/* ══════════ RIGHT COLUMN — results (desktop only) ══════════ */}
      <div className="fx-col-results">

      {/* ── Desktop empty state ─────────────────────────── */}
      {!showResults && (
        <div className="fx-results-empty-desktop" aria-hidden="true">
          <div className="fx-results-empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="6" y="14" width="36" height="5" rx="2.5" fill="rgba(184,115,51,0.25)"/>
              <rect x="6" y="23" width="36" height="5" rx="2.5" fill="rgba(184,115,51,0.18)"/>
              <rect x="6" y="32" width="36" height="5" rx="2.5" fill="rgba(184,115,51,0.12)"/>
            </svg>
          </div>
          <p className="fx-results-empty-title">Set dimensions &amp; calculate</p>
          <p className="fx-results-empty-sub">
            Choose a metal, select a grade, enter dimensions and press <strong>Calculate Now</strong> to see the live cost breakdown here.
          </p>
        </div>
      )}

      {/* Desktop only: inline results in right column */}
      {showResults && !isMobile && <ResultsBody
        metal={metal} activeCurr={activeCurr} activeCurrTotal={activeCurrTotal}
        grade={grade} weightKg={weightKg} maxCurrentA={maxCurrentA}
        fxRate={fxRate} totalIn={totalIn} showCompare={showCompare}
        bookmarked={bookmarked} w={w} t={t} L={L} pricePerKgUSD={pricePerKgUSD}
        busbarPremium={grade.busbarPremium} updatedLabel={updatedLabel}
        priceIsFallback={Boolean(live?.isFallback)}
        density={grade.density}
        resultsRef={resultsRef}
        onCompare={() => setShowCompare(true)}
        onBookmark={openBookmarkDialog}
        onWaste={openWasteSheet}
        onClose={() => setShowResults(false)}
        showCloseBtn={false}
      />}

      </div>{/* end fx-col-results */}

      {/* Mobile only: portal bottom-sheet results */}
      {mounted && isMobile && showResults && createPortal(
        <div className={`fx-results-portal${resultsLeaving ? ' is-leaving' : ''}`}>
          <div className="fx-results-overlay" onClick={closeResults} />
          <div
            className="fx-results-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Calculation results"
          >
            <div className="fx-results-sheet-handle" />
            <button
              type="button"
              className="fx-results-sheet-close"
              onClick={closeResults}
              aria-label="Close results"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="fx-results-sheet-body">
              <ResultsBody
                metal={metal} activeCurr={activeCurr} activeCurrTotal={activeCurrTotal}
                grade={grade} weightKg={weightKg} maxCurrentA={maxCurrentA}
                fxRate={fxRate} totalIn={totalIn} showCompare={showCompare}
                bookmarked={bookmarked} w={w} t={t} L={L} pricePerKgUSD={pricePerKgUSD}
                busbarPremium={grade.busbarPremium} updatedLabel={updatedLabel}
        priceIsFallback={Boolean(live?.isFallback)}
                density={grade.density}
                resultsRef={resultsRef}
                onCompare={() => setShowCompare(true)}
                onBookmark={openBookmarkDialog}
                onWaste={openWasteSheet}
                onClose={closeResults}
                showCloseBtn={false}
                showActions={false}
              />
            </div>
            {/* Sticky footer — always visible, never scrolls away */}
            <div className="fx-results-sheet-footer">
              <ResultsActionButtons
                metal={metal}
                activeCurr={activeCurr}
                activeCurrTotal={activeCurrTotal}
                showCompare={showCompare}
                bookmarked={bookmarked}
                w={w} t={t} L={L}
                weightKg={weightKg}
                maxCurrentA={maxCurrentA}
                onCompare={() => setShowCompare(true)}
                onBookmark={openBookmarkDialog}
                onWaste={openWasteSheet}
              />
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* ── Currency Picker Sheet ─────────────────────── */}
      {/* Portaled to body so it escapes the transformed swipe-track. */}
      {mounted && showPicker && createPortal(
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
        </div>,
        document.body,
      )}

      {/* ── Name-your-bookmark dialog ─────────────────── */}
      {/* Portaled to body so it escapes the transformed swipe-track and
          stacks above the results sheet (z-index 500). */}
      {mounted && showNameDialog && createPortal(
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
        </div>,
        document.body,
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

      {/* ── Waste calculation sheet ───────────────────── */}
      <FxWasteSheet
        open={showWaste}
        onClose={() => setShowWaste(false)}
        metal={metal}
        w={w} t={t} L={L}
        pricePerKgUSD={pricePerKgUSD}
        fxRate={fxRate(activeCurr)}
        currLabel={CURR_META[activeCurr].label}
        density={grade.density}
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

/* ── Results body — shared between desktop column and mobile portal ── */
type ResultsBodyProps = {
  metal: 'copper' | 'aluminum';
  activeCurr: CurrCode;
  activeCurrTotal: number;
  grade: { label: string; busbarPremium: number };
  weightKg: number;
  maxCurrentA: number;
  fxRate: (c: CurrCode) => number;
  totalIn: (c: CurrCode) => number;
  showCompare: boolean;
  bookmarked: boolean;
  w: number; t: number; L: number;
  pricePerKgUSD: number;
  busbarPremium: number;
  updatedLabel: string;
  density: number;
  priceIsFallback?: boolean;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  onCompare: () => void;
  onBookmark: () => void;
  onWaste: () => void;
  onClose: () => void;
  showCloseBtn: boolean;
  showActions?: boolean;
};

function ResultsBody({
  metal, activeCurr, activeCurrTotal, grade, weightKg, maxCurrentA,
  fxRate, totalIn, showCompare, bookmarked, w, t, L, pricePerKgUSD,
  busbarPremium, updatedLabel, resultsRef, priceIsFallback = false,
  onCompare, onBookmark, onWaste, showActions = true,
}: ResultsBodyProps) {
  return (
    <>
      <div className="fx-results" ref={resultsRef}>
        <h2 className="fx-results-title">Results</h2>
        <div className="fx-results-divider" />

        <div className="fx-results-price-row">
          <span className="fx-results-price-label">Estimate Price</span>
          {priceIsFallback ? (
            <span className="fx-results-live-badge is-estimated">
              <span className="fx-results-live-dot" />
              Estimated price
            </span>
          ) : (
            <span className="fx-results-live-badge">
              <span className="fx-results-live-dot" />
              Live {metal === 'copper' ? 'COMEX' : 'LME'}{grade.busbarPremium > 0 ? ` +${Math.round(grade.busbarPremium * 100)}%` : ''}
            </span>
          )}
        </div>

        {priceIsFallback && (
          <p className="fx-results-fallback-note" role="status">
            Live metal feed is unavailable — this uses an estimated price.
            Don&apos;t quote it commercially.
          </p>
        )}

        <div className="fx-results-curr-row">
          {(() => {
            const Flag = FLAGS[activeCurr as keyof typeof FLAGS];
            return Flag ? <Flag className="fx-results-curr-flag" width={30} height={30} /> : null;
          })()}
          <span className="fx-results-curr-code">{CURR_META[activeCurr].label}</span>
          <span className="fx-results-curr-value">{fmtResultPrice(activeCurrTotal)}</span>
        </div>

        <div className="fx-results-stat-row fx-results-stat-border">
          <span className="fx-results-stat-label">WEIGHT</span>
          <span className="fx-results-stat-value">
            <span className="fx-results-stat-num">{fmtMoney(weightKg)}</span>
            {' '}<span className="fx-results-stat-unit">kg</span>
          </span>
        </div>
        <div className="fx-results-stat-row fx-results-stat-border">
          <span className="fx-results-stat-label">MATERIAL</span>
          <span className="fx-results-stat-value">
            <span className={`fx-results-stat-num${metal === 'aluminum' ? ' al' : ''}`}>
              {metal === 'copper' ? 'copper' : 'aluminum'}
            </span>
            <span className="fx-results-grade-badge">{grade.label}</span>
          </span>
        </div>
        <div className="fx-results-stat-row">
          <span className="fx-results-stat-label">Rated Current</span>
          <span className="fx-results-stat-value">
            <span className="fx-results-stat-num">{maxCurrentA.toLocaleString()}</span>
            {' '}<span className="fx-results-stat-unit">A</span>
          </span>
        </div>

        {showActions && (
          <ResultsActionButtons
            metal={metal}
            activeCurr={activeCurr}
            activeCurrTotal={activeCurrTotal}
            showCompare={showCompare}
            bookmarked={bookmarked}
            w={w} t={t} L={L}
            weightKg={weightKg}
            maxCurrentA={maxCurrentA}
            onCompare={onCompare}
            onBookmark={onBookmark}
            onWaste={onWaste}
          />
        )}
      </div>

      <FxBusbarChart
        metal={metal}
        weightKg={weightKg}
        fxRate={fxRate(activeCurr)}
        currLabel={CURR_META[activeCurr].label}
        pricePerKgUSD={pricePerKgUSD}
        busbarPremium={busbarPremium}
        updatedLabel={updatedLabel}
      />
    </>
  );
}

/* ── Action buttons — Compare, Bookmark, Share, Waste ─────── */
type ResultsActionButtonsProps = {
  metal: 'copper' | 'aluminum';
  activeCurr: CurrCode;
  activeCurrTotal: number;
  showCompare: boolean;
  bookmarked: boolean;
  w: number; t: number; L: number;
  weightKg: number;
  maxCurrentA: number;
  onCompare: () => void;
  onBookmark: () => void;
  onWaste: () => void;
};

function ResultsActionButtons({
  metal, activeCurr, activeCurrTotal, showCompare, bookmarked,
  w, t, L, weightKg, maxCurrentA,
  onCompare, onBookmark, onWaste,
}: ResultsActionButtonsProps) {
  return (
    <>
      <div className="fx-results-actions">
        <button
          type="button"
          className={`fx-results-btn${showCompare ? ' active' : ''}`}
          onClick={onCompare}
          aria-label="Compare result"
        >
          <CompareIcon width={20} height={20} />
          Compare result
        </button>
        <button
          type="button"
          className={`fx-results-btn${bookmarked ? ' active' : ''}`}
          onClick={onBookmark}
          aria-label="Bookmark result"
          aria-pressed={bookmarked}
        >
          <BookmarkIcon width={20} height={20} />
          {bookmarked ? 'Bookmarked' : 'Bookmark result'}
        </button>
      </div>
      <button
        type="button"
        className="fx-results-share-btn"
        onClick={() => {
          const metalName = metal === 'copper' ? 'Copper' : 'Aluminum';
          const priceStr  = `${fmtResultPrice(activeCurrTotal)} ${CURR_META[activeCurr].label}`;
          const appUrl = 'https://calculator.payapress.com';
          const txt = [
            `📐 ${metalName} busbar ${w}×${t}×${L} mm`,
            `💰 ${priceStr}`,
            `⚡ ${maxCurrentA.toLocaleString()} A  •  ${fmtMoney(weightKg)} kg`,
            ``,
            `Free busbar cost calculator 👇`,
          ].join('\n');
          if (navigator.share) {
            navigator.share({ title: 'Busbar Calculator', text: txt, url: appUrl }).catch(() => {});
          } else {
            navigator.clipboard?.writeText(`${txt}\n${appUrl}`).catch(() => {});
          }
        }}
        aria-label="Share result"
      >
        <ShareIcon width={20} height={20} />
        Share result
      </button>
      <button
        type="button"
        className={`fx-results-waste-btn${metal === 'aluminum' ? ' al' : ''}`}
        onClick={onWaste}
        aria-label="Waste calculation"
      >
        <WasteIcon width={20} height={20} metal={metal} />
        Waste calculation
      </button>
    </>
  );
}

/* ── Waste icon — circular saw blade ─────────────────────── */
function WasteIcon({ width = 20, height = 20, metal }: { width?: number; height?: number; metal: 'copper' | 'aluminum' }) {
  const c = metal === 'copper' ? '#e8731a' : '#6fb3e0';
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5"/>
      <path d="M10 2.5 A7.5 7.5 0 0 1 17.5 10" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="2.2" stroke={c} strokeWidth="1.4"/>
      <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6"/>
      <line x1="10" y1="7" x2="10" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6"/>
    </svg>
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
  label, value, placeholder, onChange, onBlur, onFocus,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onBlur: (v: string) => void;
  onFocus?: () => void;
}) {
  const isEmpty = value === '';
  return (
    <div className={`fx-input-card${isEmpty ? ' fx-input-card--empty' : ''}`}>
      <label className="fx-input-label">
        <RulerIcon className="fx-input-label-icon" />
        <span>{label}</span>
        {isEmpty && <span className="fx-input-hint">tap to enter</span>}
      </label>
      <div className="fx-input-row">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="fx-input-field"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          onFocus={onFocus}
          onBlur={e => onBlur(e.target.value)}
        />
        <span className="fx-input-unit">mm</span>
      </div>
    </div>
  );
}
