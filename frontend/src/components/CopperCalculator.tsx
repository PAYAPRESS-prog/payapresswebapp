'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring, useInView,
} from 'framer-motion';
import { BUSBAR_SIZES, MATERIAL_GRADES, DEFAULT_SIZE, DEFAULT_GRADE } from '@/lib/copperData';
import { calculateCost, fmt, fmtUSD } from '@/lib/copperPrice';
import { BusbarRender } from './BusbarRender';
import type { BusbarSize, MaterialGrade, CopperPriceData } from '@/types/calculator';

interface FxRates { EUR: number; GBP: number; CAD: number; AED: number; isFallback: boolean }

const QTY_PRESETS = [1, 5, 10, 50, 100] as const;
const CURRENCIES  = ['USD', 'EUR', 'GBP', 'AED'] as const;
type Currency = typeof CURRENCIES[number];
const CURR_SYM: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£', AED: '' };
const CURR_LABEL: Record<Currency, string> = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', AED: 'AED' };

// ── Smooth animated number ─────────────────────────────────────────
function useAnimatedNumber(target: number, duration = 420) {
  const [current, setCurrent] = useState(target);
  const prev = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = prev.current;
    if (Math.abs(target - from) < 0.00001) { setCurrent(target); return; }
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = from + (target - from) * e;
      setCurrent(val);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else prev.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

// ── 3D tilt card wrapper ───────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-160, 160], [5, -5]), { stiffness: 300, damping: 32 });
  const rotY = useSpring(useTransform(mx, [-160, 160], [-5, 5]), { stiffness: 300, damping: 32 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - (r.left + r.width  / 2));
    my.set(e.clientY - (r.top  + r.height / 2));
  }, [mx, my]);

  const onLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);

  return (
    <motion.div
      className={className}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 1100 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

// ── Animated result card ───────────────────────────────────────────
function ResultCard({
  label, rawValue, formatFn, secondary, unit, highlight = false, delay = 0,
}: {
  label: string; rawValue: number; formatFn: (v: number) => string;
  secondary?: string; unit: string; highlight?: boolean; delay?: number;
}) {
  const animated = useAnimatedNumber(rawValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`rounded-xl border p-3 text-center transition-colors cursor-default ${
        highlight
          ? 'result-card-highlight border-copper-700/40'
          : 'bg-[var(--color-surface-3)] border-[var(--color-surface-4)]'
      }`}
    >
      <p className="text-[0.59rem] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold leading-none">
        {label}
      </p>
      <p className={`font-mono font-bold text-lg sm:text-xl leading-tight ${
        highlight ? 'text-copper-400 result-glow' : 'text-white'
      }`}>
        {formatFn(animated)}
      </p>
      {secondary && (
        <p className="text-[0.65rem] text-zinc-600 mt-0.5 font-mono">{secondary}</p>
      )}
      <p className="text-[0.58rem] text-zinc-600 mt-1 leading-none">{unit}</p>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export function CopperCalculator() {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView  = useInView(cardRef, { once: true, margin: '-60px' });
  const [size,  setSize]  = useState<BusbarSize>(DEFAULT_SIZE);
  const [grade, setGrade] = useState<MaterialGrade>(DEFAULT_GRADE);
  const [live,  setLive]  = useState<CopperPriceData | null>(null);
  const [fx,    setFx]    = useState<FxRates | null>(null);
  const [loading, setLoad] = useState(true);
  const [manual, setMan]  = useState('');
  const [useMan, setUM]   = useState(false);
  const [qty, setQty]     = useState(1);
  const [curr, setCurr]   = useState<Currency>('USD');
  const [copied, setCopy] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [p, f] = await Promise.all([
        fetch('/api/copper-price').then(r => r.json()).catch(() => null),
        fetch('/api/fx-rate').then(r => r.json()).catch(() => null),
      ]);
      if (p) setLive(p);
      if (f) setFx(f);
      setLoad(false);
    };
    fetchAll();
    const iv = setInterval(fetchAll, 300_000);
    return () => clearInterval(iv);
  }, []);

  const priceUSD = useMemo<number | null>(() => {
    if (useMan) { const v = parseFloat(manual); return isNaN(v) || v <= 0 ? null : v; }
    return live?.pricePerKg ?? null;
  }, [useMan, manual, live]);

  const fxRate = useMemo(() => {
    if (!fx || curr === 'USD') return 1;
    const rates = fx as unknown as Record<string, number>;
    return rates[curr] ?? 1;
  }, [fx, curr]);

  const sym = CURR_SYM[curr];
  const fmtLocal = useCallback((usd: number, d = 2) => {
    const val = usd * fxRate;
    return curr === 'AED' ? `${fmt(val, d)} AED` : `${sym}${fmt(val, d)}`;
  }, [fxRate, curr, sym]);

  const result = useMemo(
    () => (priceUSD ? calculateCost(size, grade, priceUSD) : null),
    [size, grade, priceUSD],
  );

  const handleCopy = async () => {
    if (!result) return;
    const lines = [
      'PAYAPRESS — Copper Busbar Cost Calculator',
      '─'.repeat(44),
      `Size:          ${size.label}`,
      `Grade:         ${grade.label} (${(grade.purity*100).toFixed(2)}%)`,
      `Copper price:  ${fmtUSD(result.pricePerKg)}/kg`,
      `Quantity:      ${qty} m`,
      '─'.repeat(44),
      `Weight/m:      ${fmt(result.weightPerMeter,3)} kg/m`,
      `Cost/m:        ${fmtUSD(result.costPerMeter)}/m`,
      `Cost/m²:       ${fmtUSD(result.costPerM2,0)}/m²`,
      `Total weight:  ${fmt(result.weightPerMeter*qty,2)} kg`,
      `Total cost:    ${fmtUSD(result.costPerMeter*qty)}`,
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopy(true);
    setTimeout(() => setCopy(false), 2500);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
    <TiltCard className="card-copper scanlines">
      <div className="relative z-10 p-5 md:p-7">

        {/* ── Busbar Render ────────────────────────── */}
        <div className="w-full rounded-xl overflow-hidden mb-5 border border-[var(--color-surface-3)] viewer-bg px-3 pt-2 pb-1.5">
          <BusbarRender width={size.width} thickness={size.thickness} />
          <div className="flex items-center justify-center gap-2 pb-0.5">
            <span className="font-mono text-[0.63rem] text-copper-700 font-semibold">{size.label}</span>
            <span className="text-[var(--color-surface-4)] text-xs">·</span>
            <span className="font-mono text-[0.63rem] text-zinc-600">{size.width * size.thickness} mm²</span>
            <span className="text-[var(--color-surface-4)] text-xs">·</span>
            <span className="font-mono text-[0.63rem] text-zinc-600">{grade.label}</span>
          </div>
        </div>

        {/* ── Size + Grade ─────────────────────────── */}
        <p className="text-[0.6rem] font-bold tracking-[0.22em] text-zinc-600 uppercase mb-3">
          Busbar Specifications
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Standard Size</label>
            <div className="relative">
              <select
                className="field-select pr-7"
                value={size.id}
                onChange={e => setSize(BUSBAR_SIZES.find(s => s.id === e.target.value) ?? DEFAULT_SIZE)}
              >
                {BUSBAR_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">▾</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Material Grade</label>
            <div className="relative">
              <select
                className="field-select pr-7"
                value={grade.id}
                onChange={e => setGrade(MATERIAL_GRADES.find(g => g.id === e.target.value) ?? DEFAULT_GRADE)}
              >
                {MATERIAL_GRADES.map(g => (
                  <option key={g.id} value={g.id}>{g.label} — {(g.purity*100).toFixed(2)}%</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">▾</span>
            </div>
            <p className="text-[0.67rem] text-zinc-600 mt-1">{grade.standard} · ρ {grade.density} g/cm³</p>
          </div>
        </div>

        {/* ── Copper Price ─────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-zinc-400 font-medium">Copper Price (USD / kg)</label>
            <button
              onClick={() => { setUM(v => !v); setMan(''); }}
              className="btn-ghost text-[0.7rem] px-2 py-0.5"
            >
              {useMan ? '↺ Live' : '✎ Manual'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {useMan ? (
              <motion.div key="manual"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                className="flex items-center bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] focus-within:border-copper-600/55 focus-within:shadow-[0_0_0_3px_rgba(205,127,50,0.1)] rounded-lg transition-all"
              >
                <span className="pl-3 text-zinc-500 font-mono text-sm">$</span>
                <input
                  type="number" min="0" step="0.001"
                  className="flex-1 bg-transparent text-white font-mono px-2 py-2 outline-none placeholder:text-zinc-700 text-sm"
                  placeholder="9.850"
                  value={manual}
                  onChange={e => setMan(e.target.value)}
                />
                <span className="pr-3 text-zinc-500 text-xs">USD/kg</span>
              </motion.div>
            ) : (
              <motion.div key="live"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                className="flex items-center gap-2.5 bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] rounded-lg px-3.5 py-2"
              >
                {loading ? (
                  <span className="text-zinc-500 text-sm animate-pulse">Fetching live price…</span>
                ) : live ? (
                  <>
                    <span className={live.isFallback ? 'fallback-dot' : 'live-dot'} />
                    <span className="font-mono text-lg font-bold text-copper-400">${fmt(live.pricePerKg,3)}</span>
                    <span className="text-zinc-500 text-xs">/kg</span>
                    <span className="text-zinc-700 text-xs font-mono">=</span>
                    <span className="text-zinc-500 text-xs font-mono">${fmt(live.pricePerKg / 2.20462, 3)}/lb</span>
                    <span className="ml-auto text-zinc-600 text-[0.63rem] hidden sm:block">
                      {live.isFallback ? 'estimated' : live.source}
                    </span>
                  </>
                ) : (
                  <span className="text-amber-500 text-sm">Unavailable — switch to manual</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Quantity ─────────────────────────────── */}
        <div className="mb-5">
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Quantity (meters)</label>
          <div className="flex items-center gap-2 flex-wrap">
            {QTY_PRESETS.map(p => (
              <motion.button key={p} whileTap={{ scale: 0.9 }}
                onClick={() => setQty(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                  qty === p
                    ? 'bg-copper-600/20 border-copper-600/50 text-copper-400'
                    : 'bg-[var(--color-surface-3)] border-[var(--color-surface-4)] text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                }`}
              >
                {p}m
              </motion.button>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
              <input
                type="number" min="0.1" step="0.5"
                className="field-input w-20 text-sm py-1.5 font-mono"
                value={qty}
                onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setQty(v); }}
              />
              <span className="text-zinc-500 text-xs">m</span>
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────── */}
        <div className="copper-divider mb-4">Per Meter</div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="results"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {/* Currency toggle */}
              <div className="flex justify-end mb-3">
                <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-surface-4)]">
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => setCurr(c)}
                      className={`px-2.5 py-1 rounded-md text-[0.68rem] font-semibold transition-all ${
                        curr === c
                          ? 'bg-copper-600/25 text-copper-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {CURR_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <ResultCard
                  label="Weight / m"
                  rawValue={result.weightPerMeter}
                  formatFn={v => fmt(v, 3)}
                  unit="kg / m"
                  delay={0}
                />
                <ResultCard
                  label="Cost / m"
                  rawValue={result.costPerMeter * fxRate}
                  formatFn={v => curr === 'AED' ? `${fmt(v,2)} AED` : `${sym}${fmt(v,2)}`}
                  secondary={curr !== 'USD' ? fmtUSD(result.costPerMeter) : undefined}
                  unit={`${curr} / m`}
                  delay={0.06}
                />
                <ResultCard
                  label="Cost / m²"
                  rawValue={result.costPerM2 * fxRate}
                  formatFn={v => curr === 'AED' ? `${fmt(v,0)} AED` : `${sym}${fmt(v,0)}`}
                  secondary={curr !== 'USD' ? fmtUSD(result.costPerM2, 0) : undefined}
                  unit={`${curr} / m²`}
                  highlight
                  delay={0.12}
                />
              </div>

              <AnimatePresence>
                {qty !== 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="copper-divider mb-4">
                      Total — {fmt(qty, qty%1===0?0:1)} m
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      <ResultCard
                        label="Total Weight"
                        rawValue={result.weightPerMeter * qty}
                        formatFn={v => fmt(v, 2)}
                        unit="kg"
                        delay={0}
                      />
                      <ResultCard
                        label="Total Cost"
                        rawValue={result.costPerMeter * qty * fxRate}
                        formatFn={v => curr === 'AED' ? `${fmt(v,2)} AED` : `${sym}${fmt(v,2)}`}
                        secondary={curr !== 'USD' ? fmtUSD(result.costPerMeter * qty) : undefined}
                        unit={curr}
                        delay={0.06}
                      />
                      <ResultCard
                        label="USD Total"
                        rawValue={result.costPerMeter * qty}
                        formatFn={v => fmtUSD(v)}
                        unit="USD"
                        highlight
                        delay={0.12}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.975 }}
                className="btn-ghost w-full text-sm py-2.5 flex items-center justify-center gap-2"
              >
                <AnimatePresence mode="wait">
                  <motion.span key={copied ? 'ok' : 'copy'}
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <><span className="text-green-500">✓</span> Copied to clipboard</>
                    ) : (
                      <><span>📋</span> Copy Results</>
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              {curr !== 'USD' && fx && (
                <p className="text-center text-[0.62rem] text-zinc-700 mt-2">
                  1 USD = {(fx as unknown as Record<string, number>)[curr]?.toFixed(4)} {curr}
                  {fx.isFallback ? ' (estimated)' : ''}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" className="text-center py-8 text-zinc-600 text-sm">
              {loading ? (
                <span className="animate-pulse">Loading live copper price…</span>
              ) : (
                'Enter copper price to calculate costs'
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TiltCard>
    </motion.div>
  );
}
