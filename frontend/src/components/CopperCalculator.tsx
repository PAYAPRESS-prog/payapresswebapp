'use client';

import { useState, useEffect, useMemo } from 'react';
import { BUSBAR_SIZES, MATERIAL_GRADES, DEFAULT_SIZE, DEFAULT_GRADE } from '@/lib/copperData';
import { calculateCost, fmt, fmtUSD } from '@/lib/copperPrice';
import type { BusbarSize, MaterialGrade, CopperPriceData, CalculationResult } from '@/types/calculator';

export function CopperCalculator() {
  const [size, setSize]         = useState<BusbarSize>(DEFAULT_SIZE);
  const [grade, setGrade]       = useState<MaterialGrade>(DEFAULT_GRADE);
  const [livePrice, setLive]    = useState<CopperPriceData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [manualInput, setManual]= useState('');
  const [useManual, setUseMan]  = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    const fetchPrice = () => {
      fetch('/api/copper-price')
        .then(r => r.json())
        .then((d: CopperPriceData) => { setLive(d); setLoading(false); })
        .catch(() => setLoading(false));
    };
    fetchPrice();
    const iv = setInterval(fetchPrice, 300_000);
    return () => clearInterval(iv);
  }, []);

  const effectivePrice = useMemo<number | null>(() => {
    if (useManual) {
      const v = parseFloat(manualInput);
      return isNaN(v) || v <= 0 ? null : v;
    }
    return livePrice?.pricePerKg ?? null;
  }, [useManual, manualInput, livePrice]);

  const result = useMemo<CalculationResult | null>(() => {
    if (!effectivePrice) return null;
    return calculateCost(size, grade, effectivePrice);
  }, [size, grade, effectivePrice]);

  const handleCopy = async () => {
    if (!result) return;
    const lines = [
      'PAYAPRESS — Copper Busbar Cost Calculator',
      '─'.repeat(42),
      `Size:          ${size.label}`,
      `Grade:         ${grade.label} (${(grade.purity * 100).toFixed(2)}% purity)`,
      `Density:       ${grade.density} g/cm³`,
      `Copper price:  ${fmtUSD(result.pricePerKg)}/kg`,
      '─'.repeat(42),
      `Weight/meter:  ${fmt(result.weightPerMeter, 3)} kg/m`,
      `Cost/meter:    ${fmtUSD(result.costPerMeter)}/m`,
      `Cost/m²:       ${fmtUSD(result.costPerM2, 0)}/m²`,
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-copper p-6 md:p-8">
      {/* ── Specifications ─────────────────────────── */}
      <p className="text-[0.65rem] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4">
        Busbar Specifications
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Size */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
            Standard Size
          </label>
          <div className="relative">
            <select
              className="field-select pr-8"
              value={size.id}
              onChange={e => setSize(BUSBAR_SIZES.find(s => s.id === e.target.value) ?? DEFAULT_SIZE)}
            >
              {BUSBAR_SIZES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500">▾</span>
          </div>
          <p className="text-[0.7rem] text-zinc-600 mt-1.5">
            Cross-section: {(size.width * size.thickness).toLocaleString()} mm²
          </p>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
            Material Grade
          </label>
          <div className="relative">
            <select
              className="field-select pr-8"
              value={grade.id}
              onChange={e => setGrade(MATERIAL_GRADES.find(g => g.id === e.target.value) ?? DEFAULT_GRADE)}
            >
              {MATERIAL_GRADES.map(g => (
                <option key={g.id} value={g.id}>
                  {g.label} — {(g.purity * 100).toFixed(2)}%
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500">▾</span>
          </div>
          <p className="text-[0.7rem] text-zinc-600 mt-1.5">
            {grade.standard} · ρ = {grade.density} g/cm³
          </p>
        </div>
      </div>

      {/* ── Copper Price ────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-zinc-400 font-medium">
            Copper Price (USD / kg)
          </label>
          <button
            onClick={() => { setUseMan(v => !v); setManual(''); }}
            className="btn-ghost text-[0.75rem] px-2.5 py-1"
          >
            {useManual ? '↺ Use Live Price' : '✎ Enter Manually'}
          </button>
        </div>

        {useManual ? (
          <div className="flex items-center bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] focus-within:border-copper-600/60 focus-within:shadow-[0_0_0_3px_rgba(205,127,50,0.12)] rounded-lg transition-all">
            <span className="pl-3.5 text-zinc-500 font-mono">$</span>
            <input
              type="number"
              min="0"
              step="0.001"
              className="flex-1 bg-transparent text-white font-mono px-2 py-2.5 outline-none placeholder:text-zinc-600"
              placeholder="e.g. 9.850"
              value={manualInput}
              onChange={e => setManual(e.target.value)}
            />
            <span className="pr-3.5 text-zinc-500 text-sm">/ kg</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] rounded-lg px-4 py-2.5">
            {loading ? (
              <span className="text-zinc-500 text-sm animate-pulse">Fetching live price…</span>
            ) : livePrice ? (
              <>
                <span className={livePrice.isFallback ? 'fallback-dot' : 'live-dot'} />
                <span className="font-mono text-xl font-bold text-copper-400">
                  ${fmt(livePrice.pricePerKg, 3)}
                </span>
                <span className="text-zinc-500 text-sm">/ kg</span>
                <span className="ml-auto text-zinc-600 text-xs">
                  {livePrice.isFallback ? 'estimated' : livePrice.source}
                </span>
              </>
            ) : (
              <span className="text-amber-500 text-sm">
                Live price unavailable — switch to manual
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Results ─────────────────────────────────── */}
      <div className="copper-divider mb-5">Results</div>

      {result ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <ResultCard
              label="Weight / Meter"
              value={fmt(result.weightPerMeter, 3)}
              unit="kg / m"
            />
            <ResultCard
              label="Cost / Meter"
              value={fmtUSD(result.costPerMeter)}
              unit="USD / m"
            />
            <ResultCard
              label="Cost / m²"
              value={fmtUSD(result.costPerM2, 0)}
              unit="USD / m²"
              highlight
            />
          </div>

          <button onClick={handleCopy} className="btn-ghost w-full text-center">
            {copied ? '✓ Copied to clipboard' : '📋 Copy Results'}
          </button>
        </>
      ) : (
        <div className="text-center py-8 text-zinc-600 text-sm">
          {loading
            ? 'Loading live copper price…'
            : !effectivePrice
            ? 'Enter a copper price to calculate costs'
            : 'Calculating…'}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center transition-all ${
        highlight
          ? 'result-card-highlight border-copper-700/40'
          : 'bg-[var(--color-surface-3)] border-[var(--color-surface-4)]'
      }`}
    >
      <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">
        {label}
      </p>
      <p className={`font-mono font-bold text-xl sm:text-2xl ${highlight ? 'text-copper-400 result-glow' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-[0.65rem] text-zinc-600 mt-1">{unit}</p>
    </div>
  );
}
