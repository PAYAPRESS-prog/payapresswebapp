'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_GRADE } from '@/lib/copperData';
import { DEFAULT_ALUMINUM_GRADE } from '@/lib/aluminumData';
import type { CopperPriceData, FxRates, InitialPriceData } from '@/types/calculator';
import {
  BusbarMock, RulerAngularIcon, RulerIcon, DollarIcon, ChartUpIcon,
} from './FxIcons';
import { FLAGS } from './FxFlags';

type Metal = 'copper' | 'aluminum';
type CurrCode = 'USD' | 'AED' | 'CNY' | 'EUR';
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

const CURRENCIES: { code: CurrCode; label: string }[] = [
  { code: 'USD', label: 'USD' },
  { code: 'AED', label: 'UED' },
  { code: 'CNY', label: 'CYN' },
  { code: 'EUR', label: 'EUR' },
];

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

  const [updatedLabel, setUpdatedLabel] = useState('just now');

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

  const pricePerKgUSD = live?.pricePerKg ?? 0;
  const totalUSD = weightKg * pricePerKgUSD;

  const fxRate = (code: CurrCode): number => {
    if (code === 'USD' || !fx) return 1;
    const r = (fx as unknown as Record<string, number>)[code];
    return typeof r === 'number' && r > 0 ? r : 1;
  };
  const totalIn = (code: CurrCode): number => totalUSD * fxRate(code);
  const activeCurrTotal = totalIn(curr);
  const trendPrice = pricePerKgUSD;

  function applyPreset(p: { w: string; t: string }) {
    setWidth(p.w);
    setThick(p.t);
  }

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

        {/* Suggestions row */}
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
                  onClick={() => applyPreset(p)}
                >
                  {p.w}x{p.t}
                </button>
              );
            })}
          </div>
        </div>

        <DimInput
          label="Length"
          value={length}
          onChange={setLength}
          onBlur={v => setLength(String(clampInt(v, 1, 100000, 2500)))}
        />
        <DimInput
          label="Width"
          value={width}
          onChange={setWidth}
          onBlur={v => setWidth(String(clampInt(v, 1, 100000, 100)))}
        />
        <DimInput
          label="Thikness"
          value={thick}
          onChange={setThick}
          onBlur={v => setThick(String(clampInt(v, 1, 100000, 10)))}
        />
      </div>

      {/* ── Busbar Render ──────────────────────────────── */}
      <div className="fx-busbar-render">
        <svg
          viewBox="0 0 200 160"
          width="100%"
          height="auto"
          style={{ maxWidth: 280 }}
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="calc-cu-top" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f0b486" />
              <stop offset="100%" stopColor="#b87333" />
            </linearGradient>
            <linearGradient id="calc-cu-side" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a8632a" />
              <stop offset="100%" stopColor="#5c2e16" />
            </linearGradient>
            <linearGradient id="calc-al-top" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e7ecf0" />
              <stop offset="100%" stopColor="#a8b1b9" />
            </linearGradient>
            <linearGradient id="calc-al-side" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8e9aa3" />
              <stop offset="100%" stopColor="#535b62" />
            </linearGradient>
          </defs>
          {/* aluminum bar (back) */}
          <polygon points="40,40 170,10 195,18 60,52"   fill="url(#calc-al-top)" />
          <polygon points="170,10 195,18 195,32 170,24" fill="#4a5258" />
          <polygon points="60,52 195,18 195,32 60,66"   fill="url(#calc-al-side)" />
          {/* copper bar (mid) */}
          <polygon points="22,72 160,38 195,48 60,82"   fill="url(#calc-cu-top)" />
          <polygon points="160,38 195,48 195,64 160,54" fill="#5c2e16" />
          <polygon points="60,82 195,48 195,64 60,96"   fill="url(#calc-cu-side)" />
          {/* copper bar (front) */}
          <polygon points="5,102 150,68 195,80 50,114"  fill="url(#calc-cu-top)" />
          <polygon points="150,68 195,80 195,98 150,86" fill="#5c2e16" />
          <polygon points="50,114 195,80 195,98 50,132" fill="url(#calc-cu-side)" />
        </svg>
      </div>

      {/* ── Currency Conversion ────────────────────────── */}
      <div className="fx-card">
        <div className="fx-card-head">
          <div className="fx-card-head-label">
            <DollarIcon className="fx-card-head-icon" />
            <span className="fx-card-head-title">Currency Conversion</span>
          </div>
          <div className="fx-card-head-badge">
            Base Currency: <span className="accent" style={{ marginLeft: 4 }}>USD</span>
          </div>
        </div>

        <div className="fx-currency-row">
          {CURRENCIES.slice(0, 2).map(c => (
            <CurrencyCell
              key={c.code}
              code={c.code}
              label={c.label}
              value={totalIn(c.code)}
              active={curr === c.code}
              showSpark={curr === c.code}
              onClick={() => setCurr(c.code)}
            />
          ))}
        </div>
        <div className="fx-currency-row">
          {CURRENCIES.slice(2).map(c => (
            <CurrencyCell
              key={c.code}
              code={c.code}
              label={c.label}
              value={totalIn(c.code)}
              active={curr === c.code}
              showSpark={curr === c.code}
              onClick={() => setCurr(c.code)}
            />
          ))}
        </div>
      </div>

      {/* ── Estimate Price ─────────────────────────────── */}
      <div className="fx-card">
        <div className="fx-card-head">
          <div className="fx-card-head-label">
            <span className="fx-card-head-title">Estimate Price</span>
          </div>
          <div className="fx-live-badge">
            <span className="fx-live-dot" />
            <span className="fx-live-text">Live COMEX</span>
          </div>
        </div>

        <div className="fx-price-display">
          <p>
            {curr === 'USD' ? '$' : ''}
            {fmtMoney(activeCurrTotal)}
            {curr !== 'USD' ? ` ${curr}` : ''}
          </p>
        </div>

        <div className="fx-meta-row">
          <div className="fx-meta-cell">
            <div className="label">WEIGHT</div>
            <div>
              <span className="value weight">{fmtMoney(weightKg)}</span>
              <span className="unit">Kg</span>
            </div>
          </div>
          <div className="fx-meta-cell">
            <div className="label">MATERIAL</div>
            <div className="value material">
              {metal === 'copper' ? 'Copper' : 'Aluminum'}
            </div>
          </div>
        </div>
      </div>

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
                ${fmtPrice(trendPrice)}
                <span className="unit">/kg</span>
              </div>
              <div className="fx-chart-change">+2.45% (220.50)</div>
            </div>
            <div className="fx-chart-update">Updated: {updatedLabel}</div>
          </div>
          <TrendChart metal={metal} range={range} />
        </div>
      </div>
    </div>
  );
}

/* ── Dimension input row ────────────────────────────────── */
function DimInput({
  label,
  value,
  onChange,
  onBlur,
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

/* ── Currency cell ─────────────────────────────────────── */
function CurrencyCell({
  code, label, value, active, showSpark, onClick,
}: {
  code: CurrCode;
  label: string;
  value: number;
  active: boolean;
  showSpark?: boolean;
  onClick: () => void;
}) {
  const Flag = FLAGS[code];
  return (
    <button
      type="button"
      className={`fx-currency-cell${active ? ' active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${code} ${fmtMoney(value)}`}
    >
      <Flag className="fx-currency-flag" width={30} height={30} />
      <div className="fx-currency-info">
        <div className="fx-currency-code">{label}</div>
        <div className="fx-currency-value">{fmtMoney(value)}</div>
      </div>
      {showSpark && (
        <svg className="fx-currency-spark" viewBox="0 0 100 24" aria-hidden="true">
          <polyline
            points="0,18 14,12 28,15 42,8 56,11 70,5 84,9 100,3"
            fill="none"
            stroke="#d71920"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
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
          { y: 24,  t: '200' },
          { y: 44,  t: '100' },
          { y: 64,  t: '0' },
          { y: 84,  t: '-100' },
          { y: 104, t: '-200' },
          { y: 124, t: '-300' },
        ].map(l => (
          <text key={l.t} x="2" y={l.y} fontSize="6" fill="#9ca3af">{l.t}</text>
        ))}
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <circle cx="95" cy="18" r="2" fill={stroke} />
        <text x="80" y="14" fontSize="6" fill="#ccc">151</text>
      </svg>
    </div>
  );
}
