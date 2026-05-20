'use client';

import { useState, useEffect, useMemo } from 'react';
import { BUSBAR_SIZES, MATERIAL_GRADES, DEFAULT_SIZE, DEFAULT_GRADE } from '@/lib/copperData';
import { calculateCost, fmt, fmtUSD } from '@/lib/copperPrice';
import type { BusbarSize, MaterialGrade, CopperPriceData } from '@/types/calculator';

interface FxRates { EUR: number; GBP: number; CAD: number; AED: number; isFallback: boolean }

const QTY_PRESETS = [1, 5, 10, 50, 100] as const;

// ── Busbar cross-section SVG ─────────────────────────
function BusbarCrossSection({ width, thickness }: { width: number; thickness: number }) {
  const W = 240, H = 88, PAD = 28;
  const scale = Math.min((W - PAD * 2) / width, (H - PAD * 2) / thickness, 14);
  const rW = Math.max(width * scale, 36);
  const rH = Math.max(thickness * scale, 8);
  const x = (W - rW) / 2;
  const y = (H - rH) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 88 }} aria-label={`${width}×${thickness}mm cross-section`}>
      <defs>
        <linearGradient id="cg-v" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#e8a030" />
          <stop offset="45%"  stopColor="#cd7f32" />
          <stop offset="100%" stopColor="#6b3f14" />
        </linearGradient>
        <linearGradient id="cg-h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="25%"  stopColor="rgba(255,255,255,0.12)" />
          <stop offset="75%"  stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.5)" />
        </filter>
      </defs>
      {/* Busbar body */}
      <rect x={x} y={y} width={rW} height={rH} fill="url(#cg-v)" rx="1.5" filter="url(#shadow)" />
      <rect x={x} y={y} width={rW} height={rH} fill="url(#cg-h)" rx="1.5" />
      {/* Width dimension line */}
      <line x1={x} y1={y + rH + 7} x2={x + rW} y2={y + rH + 7} stroke="#3a3a3a" strokeWidth="0.75" />
      <line x1={x}      y1={y + rH + 4} x2={x}      y2={y + rH + 10} stroke="#3a3a3a" strokeWidth="0.75" />
      <line x1={x + rW} y1={y + rH + 4} x2={x + rW} y2={y + rH + 10} stroke="#3a3a3a" strokeWidth="0.75" />
      <text x={x + rW / 2} y={y + rH + 20} textAnchor="middle" fill="#555" fontSize="9" fontFamily="monospace">
        {width} mm
      </text>
      {/* Thickness label (right side) */}
      <line x1={x + rW + 7} y1={y}      x2={x + rW + 7} y2={y + rH}      stroke="#3a3a3a" strokeWidth="0.75" />
      <line x1={x + rW + 4} y1={y}      x2={x + rW + 10} y2={y}           stroke="#3a3a3a" strokeWidth="0.75" />
      <line x1={x + rW + 4} y1={y + rH} x2={x + rW + 10} y2={y + rH}     stroke="#3a3a3a" strokeWidth="0.75" />
      <text
        x={x + rW + 18}
        y={y + rH / 2 + 3}
        fill="#555"
        fontSize="9"
        fontFamily="monospace"
      >
        {thickness} mm
      </text>
    </svg>
  );
}

// ── Result card ──────────────────────────────────────
function ResultCard({
  label, primary, secondary, unit, highlight = false,
}: {
  label: string; primary: string; secondary?: string; unit: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 text-center transition-all ${
      highlight
        ? 'result-card-highlight border-copper-700/40'
        : 'bg-[var(--color-surface-3)] border-[var(--color-surface-4)]'
    }`}>
      <p className="text-[0.62rem] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">{label}</p>
      <p className={`font-mono font-bold text-lg sm:text-xl ${highlight ? 'text-copper-400 result-glow' : 'text-white'}`}>
        {primary}
      </p>
      {secondary && <p className="text-[0.68rem] text-zinc-600 mt-0.5 font-mono">{secondary}</p>}
      <p className="text-[0.62rem] text-zinc-600 mt-1">{unit}</p>
    </div>
  );
}

// ── Main calculator ──────────────────────────────────
export function CopperCalculator() {
  const [size, setSize]       = useState<BusbarSize>(DEFAULT_SIZE);
  const [grade, setGrade]     = useState<MaterialGrade>(DEFAULT_GRADE);
  const [livePrice, setLive]  = useState<CopperPriceData | null>(null);
  const [fxRates, setFx]      = useState<FxRates | null>(null);
  const [priceLoading, setPL] = useState(true);
  const [manualInput, setMan] = useState('');
  const [useManual, setUM]    = useState(false);
  const [quantity, setQty]    = useState(1);
  const [copied, setCopied]   = useState(false);
  const [currency, setCurr]   = useState<'USD' | 'EUR' | 'GBP' | 'CAD' | 'AED'>('USD');

  useEffect(() => {
    const fetchAll = () =>
      Promise.all([
        fetch('/api/copper-price').then(r => r.json()).catch(() => null),
        fetch('/api/fx-rate').then(r => r.json()).catch(() => null),
      ]).then(([price, fx]) => {
        if (price) setLive(price);
        if (fx) setFx(fx);
        setPL(false);
      });

    fetchAll();
    const iv = setInterval(fetchAll, 300_000);
    return () => clearInterval(iv);
  }, []);

  const effectivePriceUSD = useMemo<number | null>(() => {
    if (useManual) {
      const v = parseFloat(manualInput);
      return isNaN(v) || v <= 0 ? null : v;
    }
    return livePrice?.pricePerKg ?? null;
  }, [useManual, manualInput, livePrice]);

  const fxRate = useMemo(() => {
    if (!fxRates || currency === 'USD') return 1;
    return fxRates[currency] ?? 1;
  }, [fxRates, currency]);

  const result = useMemo(() => {
    if (!effectivePriceUSD) return null;
    return calculateCost(size, grade, effectivePriceUSD);
  }, [size, grade, effectivePriceUSD]);

  const CURR_SYM: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AED: 'AED ' };
  const sym = CURR_SYM[currency] ?? '$';

  function fmtLocal(usd: number, dec = 2) {
    return `${sym}${fmt(usd * fxRate, dec)}`;
  }

  const handleCopy = async () => {
    if (!result) return;
    const lines = [
      'PAYAPRESS — Copper Busbar Cost Calculator',
      '─'.repeat(44),
      `Size:           ${size.label}`,
      `Grade:          ${grade.label} (${(grade.purity * 100).toFixed(2)}%)`,
      `Density:        ${grade.density} g/cm³`,
      `Cross-section:  ${size.width * size.thickness} mm²`,
      `Copper price:   ${fmtUSD(result.pricePerKg)}/kg`,
      `Quantity:       ${quantity} m`,
      '─'.repeat(44),
      `Weight/meter:   ${fmt(result.weightPerMeter, 3)} kg/m`,
      `Cost/meter:     ${fmtUSD(result.costPerMeter)}/m`,
      `Cost/m²:        ${fmtUSD(result.costPerM2, 0)}/m²`,
      `Total weight:   ${fmt(result.weightPerMeter * quantity, 2)} kg`,
      `Total cost:     ${fmtUSD(result.costPerMeter * quantity)}`,
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="card-copper p-5 md:p-7">
      {/* ── Top row: Size + Grade + Cross-section ────── */}
      <p className="text-[0.62rem] font-bold tracking-[0.22em] text-zinc-600 uppercase mb-3">
        Busbar Specifications
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Size */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1 font-medium">Standard Size</label>
          <div className="relative">
            <select
              className="field-select pr-7"
              value={size.id}
              onChange={e => setSize(BUSBAR_SIZES.find(s => s.id === e.target.value) ?? DEFAULT_SIZE)}
            >
              {BUSBAR_SIZES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">▾</span>
          </div>
          <p className="text-[0.68rem] text-zinc-600 mt-1">{size.width * size.thickness} mm² cross-section</p>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1 font-medium">Material Grade</label>
          <div className="relative">
            <select
              className="field-select pr-7"
              value={grade.id}
              onChange={e => setGrade(MATERIAL_GRADES.find(g => g.id === e.target.value) ?? DEFAULT_GRADE)}
            >
              {MATERIAL_GRADES.map(g => (
                <option key={g.id} value={g.id}>{g.label} — {(g.purity * 100).toFixed(2)}%</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">▾</span>
          </div>
          <p className="text-[0.68rem] text-zinc-600 mt-1">{grade.standard} · ρ {grade.density} g/cm³</p>
        </div>

        {/* Cross-section visual */}
        <div className="bg-[var(--color-surface-1)] rounded-lg border border-[var(--color-surface-3)] p-2 flex flex-col items-center justify-center">
          <p className="text-[0.6rem] text-zinc-700 uppercase tracking-wider mb-1">Cross-section</p>
          <BusbarCrossSection width={size.width} thickness={size.thickness} />
        </div>
      </div>

      {/* ── Copper Price ─────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-zinc-400 font-medium">Copper Price (USD / kg)</label>
          <button onClick={() => { setUM(v => !v); setMan(''); }} className="btn-ghost text-[0.72rem] px-2 py-0.5">
            {useManual ? '↺ Live price' : '✎ Manual'}
          </button>
        </div>

        {useManual ? (
          <div className="flex items-center bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] focus-within:border-copper-600/60 focus-within:shadow-[0_0_0_3px_rgba(205,127,50,0.1)] rounded-lg transition-all">
            <span className="pl-3 text-zinc-500 font-mono text-sm">$</span>
            <input
              type="number" min="0" step="0.001"
              className="flex-1 bg-transparent text-white font-mono px-2 py-2 outline-none placeholder:text-zinc-700 text-sm"
              placeholder="9.850"
              value={manualInput}
              onChange={e => setMan(e.target.value)}
            />
            <span className="pr-3 text-zinc-500 text-xs">USD / kg</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] rounded-lg px-3.5 py-2">
            {priceLoading ? (
              <span className="text-zinc-500 text-sm animate-pulse">Loading…</span>
            ) : livePrice ? (
              <>
                <span className={livePrice.isFallback ? 'fallback-dot' : 'live-dot'} />
                <span className="font-mono text-lg font-bold text-copper-400">${fmt(livePrice.pricePerKg, 3)}</span>
                <span className="text-zinc-500 text-xs">/ kg</span>
                <span className="ml-auto text-zinc-600 text-[0.65rem]">
                  {livePrice.isFallback ? 'estimated' : livePrice.source} ·{' '}
                  {livePrice.pricePerMT.toLocaleString('en-US')} USD/MT
                </span>
              </>
            ) : (
              <span className="text-amber-500 text-sm">Live price unavailable — use manual</span>
            )}
          </div>
        )}
      </div>

      {/* ── Quantity ──────────────────────────────────── */}
      <div className="mb-5">
        <label className="block text-xs text-zinc-400 mb-1 font-medium">Quantity (meters)</label>
        <div className="flex items-center gap-2 flex-wrap">
          {QTY_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setQty(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                quantity === p
                  ? 'bg-copper-600/20 border-copper-600/50 text-copper-400'
                  : 'bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {p}m
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-1">
            <input
              type="number" min="0.1" step="0.5"
              className="field-input w-20 text-sm py-1.5 font-mono"
              value={quantity}
              onChange={e => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) setQty(v);
              }}
            />
            <span className="text-zinc-500 text-xs">m</span>
          </div>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────── */}
      <div className="copper-divider mb-4">
        Per Meter Results
      </div>

      {result ? (
        <>
          {/* Currency selector */}
          <div className="flex justify-end mb-3">
            <div className="flex gap-1">
              {(['USD','EUR','GBP'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurr(c)}
                  className={`px-2.5 py-1 rounded text-[0.7rem] font-semibold border transition-all ${
                    currency === c
                      ? 'bg-copper-600/20 border-copper-600/40 text-copper-400'
                      : 'bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <ResultCard
              label="Weight / m"
              primary={`${fmt(result.weightPerMeter, 3)}`}
              unit="kg / m"
            />
            <ResultCard
              label="Cost / m"
              primary={fmtLocal(result.costPerMeter)}
              secondary={currency !== 'USD' ? fmtUSD(result.costPerMeter) : undefined}
              unit={`${currency} / m`}
            />
            <ResultCard
              label="Cost / m²"
              primary={fmtLocal(result.costPerM2, 0)}
              secondary={currency !== 'USD' ? fmtUSD(result.costPerM2, 0) : undefined}
              unit={`${currency} / m²`}
              highlight
            />
          </div>

          {/* Total */}
          {quantity !== 1 && (
            <>
              <div className="copper-divider mb-3">
                Total for {fmt(quantity, quantity % 1 === 0 ? 0 : 1)} m
              </div>
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <ResultCard
                  label="Total Weight"
                  primary={fmt(result.weightPerMeter * quantity, 2)}
                  unit="kg"
                />
                <ResultCard
                  label="Total Cost"
                  primary={fmtLocal(result.costPerMeter * quantity)}
                  secondary={currency !== 'USD' ? fmtUSD(result.costPerMeter * quantity) : undefined}
                  unit={currency}
                />
                <ResultCard
                  label="Cost / Busbar"
                  primary={fmtLocal(result.costPerMeter * quantity)}
                  unit="total"
                  highlight
                />
              </div>
            </>
          )}

          <button onClick={handleCopy} className="btn-ghost w-full text-sm">
            {copied ? '✓ Copied to clipboard' : '📋 Copy Results'}
          </button>

          {currency !== 'USD' && fxRates && (
            <p className="text-center text-[0.65rem] text-zinc-700 mt-2">
              FX: 1 USD = {fxRates[currency]?.toFixed(4)} {currency}
              {fxRates.isFallback ? ' (estimated)' : ''}
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-zinc-600 text-sm">
          {priceLoading
            ? 'Loading live copper price…'
            : !effectivePriceUSD
            ? 'Enter copper price to calculate costs'
            : null}
        </div>
      )}
    </div>
  );
}
