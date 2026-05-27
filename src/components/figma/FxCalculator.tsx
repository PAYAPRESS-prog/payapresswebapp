'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_GRADE } from '@/lib/copperData';
import { DEFAULT_ALUMINUM_GRADE } from '@/lib/aluminumData';
import { fmt } from '@/lib/copperPrice';
import type { CopperPriceData, FxRates, InitialPriceData } from '@/types/calculator';
import {
  BusbarMock, RulerAngularIcon, RulerIcon, DollarIcon, ChartUpIcon,
} from './FxIcons';
import { FLAGS } from './FxFlags';

type Metal = 'copper' | 'aluminum';
type CurrCode = 'USD' | 'AED' | 'CNY' | 'EUR';
type ChartRange = '1D' | '7D' | '1M' | '1Y';

// Synthetic trend curves per range — deterministic so render stays stable.
const TREND_POINTS: Record<ChartRange, string> = {
  '1D': '0,90 12,82 24,75 36,68 48,60 60,55 72,48 84,32 95,18',
  '7D': '0,95 12,72 24,88 36,55 48,68 60,30 72,52 84,22 95,18',
  '1M': '0,80 14,60 28,72 42,40 56,55 70,28 84,35 95,18',
  '1Y': '0,110 16,85 32,95 48,60 64,72 80,40 95,18',
};

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
  { code: 'AED', label: 'AED' },
  { code: 'CNY', label: 'CYN' },   // matches Figma typo
  { code: 'EUR', label: 'EUR' },
];

function clampInt(raw: string, min: number, max: number, fallback: number) {
  const n = Math.round(parseFloat(raw));
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function fmtMoney(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function FxCalculator({ initialData }: { initialData?: InitialPriceData }) {
  const [metal,  setMetal]  = useState<Metal>('copper');
  const [width,  setWidth]  = useState('120');
  const [thick,  setThick]  = useState('10');
  const [length, setLength] = useState('2500');
  const [curr,   setCurr]   = useState<CurrCode>('USD');
  const [range,  setRange]  = useState<ChartRange>('1D');

  const [copper,   setCopper]   = useState<CopperPriceData | null>(initialData?.copper   ?? null);
  const [aluminum, setAluminum] = useState<CopperPriceData | null>(initialData?.aluminum ?? null);
  const [fx,       setFx]       = useState<FxRates | null>(initialData?.fx ?? null);

  // Live refresh every 5 min
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

  const w = clampInt(width,  1, 100000, 120);
  const t = clampInt(thick,  1, 100000, 10);
  const L = clampInt(length, 1, 100000, 2500);

  // weight (kg) = w * t * L * density / 1,000,000
  const weightKg = useMemo(
    () => (w * t * L * grade.density) / 1_000_000,
    [w, t, L, grade.density],
  );

  const pricePerKgUSD = live?.pricePerKg ?? 0;
  const totalUSD = weightKg * pricePerKgUSD;

  // Build per-currency display values
  const fxRate = (code: CurrCode): number => {
    if (code === 'USD' || !fx) return 1;
    const r = (fx as unknown as Record<string, number>)[code];
    return typeof r === 'number' && r > 0 ? r : 1;
  };
  const totalIn = (code: CurrCode): number => totalUSD * fxRate(code);

  const activeCurrTotal = totalIn(curr);

  // Trend chart numbers (static change% for now — live history not available)
  const trendPrice = pricePerKgUSD;
  const updatedLabel = relativeTime(live?.updatedAt);

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
          onBlur={v => setWidth(String(clampInt(v, 1, 100000, 120)))}
        />
        <DimInput
          label="Thickness"
          value={thick}
          onChange={setThick}
          onBlur={v => setThick(String(clampInt(v, 1, 100000, 10)))}
        />
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
                ${fmt(trendPrice, 3)}
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

/* ── Trend chart (decorative — matches Figma layout) ───── */
function TrendChart({ metal, range }: { metal: Metal; range: ChartRange }) {
  const stroke = metal === 'copper' ? '#d71920' : '#6fb3e0';
  const points = TREND_POINTS[range];
  return (
    <div className="fx-chart-canvas">
      <svg viewBox="0 0 100 140" preserveAspectRatio="none" width="100%" height="100%">
        {/* horizontal grid */}
        {[20, 40, 60, 80, 100, 120].map(y => (
          <line key={y} x1="6" x2="98" y1={y} y2={y}
                stroke="#ffffff14" strokeWidth="0.4" />
        ))}
        {/* y-axis labels (left) */}
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
        {/* trend line */}
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* end-dot */}
        <circle cx="95" cy="18" r="2" fill={stroke} />
        {/* baseline label */}
        <text x="80" y="14" fontSize="6" fill="#ccc">151</text>
      </svg>
    </div>
  );
}
