'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DEFAULT_GRADE } from '@/lib/copperData';
import { DEFAULT_ALUMINUM_GRADE } from '@/lib/aluminumData';
import type { CopperPriceData, FxRates } from '@/types/calculator';
import { BusbarMock, ShareIcon } from './FxIcons';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';

type Metal = 'copper' | 'aluminum';
type CurrCode =
  | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CNY' | 'TRY' | 'IRR'
  | 'SAR' | 'CAD' | 'AUD' | 'CHF' | 'JPY' | 'INR' | 'RUB'
  | 'KWD' | 'QAR' | 'SGD';

export interface CompareConfig {
  metal: Metal;
  w: number;
  t: number;
  L: number;
  weightKg: number;
  totalUSD: number;
  pricePerKgUSD: number;
  maxCurrentA: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  configA: CompareConfig;
  copper: CopperPriceData | null;
  aluminum: CopperPriceData | null;
  fxRate: (code: CurrCode) => number;
  activeCurr: CurrCode;
  currLabel: string;
}

const CURRENT_DENSITY: Record<Metal, number> = { copper: 2.5, aluminum: 1.5 };

function clamp(raw: string, min: number, max: number, fallback: number) {
  const n = Math.round(parseFloat(raw));
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function fmt(n: number, d = 2) {
  return n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function pct(a: number, b: number): string | null {
  if (a === 0) return null;
  const p = ((b - a) / a) * 100;
  if (Math.abs(p) < 0.5) return null;
  const sign = p > 0 ? '+' : '';
  return `${sign}${p.toFixed(1)}%`;
}

interface Row {
  label: string;
  a: string;
  b: string;
  delta: string | null;
  deltaPositive: boolean | null;
  highlight?: boolean;
}

function buildRows(
  a: CompareConfig,
  bMetal: Metal, bW: number, bT: number, bL: number,
  copper: CopperPriceData | null,
  aluminum: CopperPriceData | null,
  fxRate: (c: CurrCode) => number,
  activeCurr: CurrCode,
  currLabel: string,
): Row[] {
  const bGrade = bMetal === 'copper' ? DEFAULT_GRADE : DEFAULT_ALUMINUM_GRADE;
  const bLive  = bMetal === 'copper' ? copper : aluminum;
  const bWeightKg      = (bW * bT * bL * bGrade.density) / 1_000_000;
  const bSpotPerKgUSD  = bLive?.pricePerKg ?? 0;
  const bPricePerKgUSD = bSpotPerKgUSD * (1 + bGrade.busbarPremium);
  const bTotalUSD      = bWeightKg * bPricePerKgUSD;
  const bMaxCurrentA   = Math.round(bW * bT * CURRENT_DENSITY[bMetal]);
  const bCrossSection  = bW * bT;
  const aCrossSection  = a.w * a.t;

  const aTotal  = a.totalUSD * fxRate(activeCurr);
  const bTotal  = bTotalUSD  * fxRate(activeCurr);

  const d = (av: number, bv: number): { delta: string | null; pos: boolean | null } => {
    const p = pct(av, bv);
    if (!p) return { delta: null, pos: null };
    return { delta: p, pos: bv > av };
  };

  const metalLabel = (m: Metal) => m === 'copper' ? 'Copper' : 'Aluminum';
  const metalSame = a.metal === bMetal;

  return [
    {
      label: 'Material',
      a: metalLabel(a.metal),
      b: metalLabel(bMetal),
      delta: metalSame ? null : '≠',
      deltaPositive: null,
    },
    {
      label: 'Dimensions',
      a: `${a.w}×${a.t}×${a.L} mm`,
      b: `${bW}×${bT}×${bL} mm`,
      delta: null,
      deltaPositive: null,
    },
    {
      label: 'Cross-section',
      a: `${fmt(aCrossSection, 0)} mm²`,
      b: `${fmt(bCrossSection, 0)} mm²`,
      ...(() => { const x = d(aCrossSection, bCrossSection); return { delta: x.delta, deltaPositive: x.pos }; })(),
    },
    {
      label: 'Weight',
      a: `${fmt(a.weightKg)} kg`,
      b: `${fmt(bWeightKg)} kg`,
      ...(() => { const x = d(a.weightKg, bWeightKg); return { delta: x.delta, deltaPositive: x.pos !== null ? !x.pos : null }; })(),
    },
    {
      label: 'Rated Current',
      a: `${a.maxCurrentA.toLocaleString()} A`,
      b: `${bMaxCurrentA.toLocaleString()} A`,
      ...(() => { const x = d(a.maxCurrentA, bMaxCurrentA); return { delta: x.delta, deltaPositive: x.pos }; })(),
      highlight: true,
    },
    {
      label: 'Price/kg (USD)',
      a: `$${fmt(a.pricePerKgUSD)}`,
      b: `$${fmt(bPricePerKgUSD)}`,
      ...(() => { const x = d(a.pricePerKgUSD, bPricePerKgUSD); return { delta: x.delta, deltaPositive: x.pos !== null ? !x.pos : null }; })(),
    },
    {
      label: `Total (${currLabel})`,
      a: fmtPrice(aTotal),
      b: fmtPrice(bTotal),
      ...(() => { const x = d(aTotal, bTotal); return { delta: x.delta, deltaPositive: x.pos !== null ? !x.pos : null }; })(),
      highlight: true,
    },
  ];
}

function fmtPrice(n: number) {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  return fmt(n);
}

export function FxCompareSheet({
  open, onClose, configA, copper, aluminum, fxRate, activeCurr, currLabel,
}: Props) {
  const [bMetal, setBMetal] = useState<Metal>(configA.metal);
  const [bWidth, setBWidth] = useState(String(configA.w));
  const [bThick, setBThick] = useState(String(configA.t));
  const [bLen,   setBLen]   = useState(String(configA.L));
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      setBMetal(configA.metal);
      setBWidth(String(configA.w));
      setBThick(String(configA.t));
      setBLen(String(configA.L));
      setLeaving(false);
    }
  }, [open, configA.metal, configA.w, configA.t, configA.L]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => { unlockBodyScroll(); };
  }, [open]);

  const sheetRef = useRef<HTMLDivElement>(null);

  function handleClose() {
    setLeaving(true);
    setTimeout(() => { setLeaving(false); onClose(); }, 320);
  }

  if (!mounted || (!open && !leaving)) return null;

  const bW = clamp(bWidth, 1, 100000, configA.w);
  const bT = clamp(bThick, 1, 100000, configA.t);
  const bL = clamp(bLen,   1, 100000, configA.L);

  const rows = buildRows(
    configA, bMetal, bW, bT, bL,
    copper, aluminum, fxRate, activeCurr, currLabel,
  );

  const isDifferent = rows.some(r => r.delta !== null);

  function handleShare() {
    const lines = [
      '📊 Busbar Comparison — Busbar Calculator',
      '',
      `A: ${configA.metal === 'copper' ? 'Copper' : 'Aluminum'} ${configA.w}×${configA.t}×${configA.L} mm`,
      `B: ${bMetal === 'copper' ? 'Copper' : 'Aluminum'} ${bW}×${bT}×${bL} mm`,
      '',
      ...rows
        .filter(r => r.delta)
        .map(r => `${r.label}: ${r.a} → ${r.b} (${r.delta})`),
      '',
      'https://calculator.payapress.com',
    ];
    const txt = lines.join('\n');
    if (navigator.share) {
      navigator.share({ title: 'Busbar Comparison', text: txt }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(txt).catch(() => {});
    }
  }

  return createPortal(
    <div
      className={`fx-cmp-overlay${leaving ? ' is-leaving' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Compare configurations"
    >
      <div
        className="fx-cmp-sheet"
        ref={sheetRef}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="fx-cmp-handle" />

        {/* Header */}
        <div className="fx-cmp-header">
          <span className="fx-cmp-title">Compare Configurations</span>
          <button type="button" className="fx-cmp-close" onClick={handleClose} aria-label="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Config labels */}
        <div className="fx-cmp-configs-row">
          <div className="fx-cmp-config-badge a">
            <span className="fx-cmp-badge-letter">A</span>
            <span className="fx-cmp-badge-sub">Current</span>
          </div>
          <div className="fx-cmp-vs">VS</div>
          <div className="fx-cmp-config-badge b">
            <span className="fx-cmp-badge-letter">B</span>
            <span className="fx-cmp-badge-sub">New Config</span>
          </div>
        </div>

        {/* Config B controls */}
        <div className="fx-cmp-b-controls">
          <div className="fx-cmp-b-label">Set Config B</div>

          <div className="fx-cmp-metal-row">
            <button
              type="button"
              className={`fx-cmp-metal-btn${bMetal === 'copper' ? ' active' : ''}`}
              onClick={() => setBMetal('copper')}
            >
              <BusbarMock metal="copper" width={28} height={22} />
              <span>Copper</span>
            </button>
            <button
              type="button"
              className={`fx-cmp-metal-btn${bMetal === 'aluminum' ? ' active' : ''}`}
              onClick={() => setBMetal('aluminum')}
            >
              <BusbarMock metal="aluminum" width={28} height={22} />
              <span>Aluminum</span>
            </button>
          </div>

          <div className="fx-cmp-dim-row">
            <CmpDimInput label="Width" unit="mm" value={bWidth} onChange={setBWidth}
              onBlur={v => setBWidth(String(clamp(v, 1, 100000, configA.w)))} />
            <CmpDimInput label="Thick" unit="mm" value={bThick} onChange={setBThick}
              onBlur={v => setBThick(String(clamp(v, 1, 100000, configA.t)))} />
            <CmpDimInput label="Length" unit="mm" value={bLen} onChange={setBLen}
              onBlur={v => setBLen(String(clamp(v, 1, 100000, configA.L)))} />
          </div>
        </div>

        <div className="fx-cmp-section-divider" />

        {/* Comparison table */}
        <div className="fx-cmp-table-wrap">
          <div className="fx-cmp-table-head">
            <div className="fx-cmp-th-param"></div>
            <div className="fx-cmp-th-val"><span className="fx-cmp-th-badge a">A</span></div>
            <div className="fx-cmp-th-val"><span className="fx-cmp-th-badge b">B</span></div>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`fx-cmp-row${row.highlight ? ' highlight' : ''}${i % 2 === 0 ? ' even' : ''}`}
            >
              <div className="fx-cmp-row-label">{row.label}</div>
              <div className="fx-cmp-row-a">{row.a}</div>
              <div className="fx-cmp-row-b">
                <span className="fx-cmp-row-bval">{row.b}</span>
                {row.delta && (
                  <span className={`fx-cmp-delta${
                    row.deltaPositive === null ? ' neutral'
                    : row.deltaPositive ? ' positive'
                    : ' negative'
                  }`}>{row.delta}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isDifferent && (
          <div className="fx-cmp-same-msg">
            Configurations are identical. Change any parameter above to see the comparison.
          </div>
        )}

        {/* Action buttons */}
        <div className="fx-cmp-actions">
          <button
            type="button"
            className="fx-cmp-share-btn"
            onClick={handleShare}
            disabled={!isDifferent}
          >
            <ShareIcon width={18} height={18} />
            Share comparison
          </button>
          <button
            type="button"
            className="fx-cmp-close-btn"
            onClick={handleClose}
          >
            Close
          </button>
        </div>

        <div className="fx-cmp-bottom-space" />
      </div>
    </div>,
    document.body,
  );
}

function CmpDimInput({
  label, unit, value, onChange, onBlur,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: (v: string) => void;
}) {
  return (
    <div className="fx-cmp-dim">
      <label className="fx-cmp-dim-label">{label}</label>
      <div className="fx-cmp-dim-field">
        <input
          type="text"
          inputMode="numeric"
          className="fx-cmp-dim-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={e => onBlur(e.target.value)}
        />
        <span className="fx-cmp-dim-unit">{unit}</span>
      </div>
    </div>
  );
}
