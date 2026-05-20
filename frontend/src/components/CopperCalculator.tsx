'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring, useInView,
} from 'framer-motion';
import { MATERIAL_GRADES, DEFAULT_GRADE } from '@/lib/copperData';
import { calculateCost, fmt, fmtUSD } from '@/lib/copperPrice';
import { BusbarRender } from './BusbarRender';
import type { BusbarSize, MaterialGrade, CopperPriceData } from '@/types/calculator';

interface FxRates {
  EUR: number; GBP: number; CHF: number; JPY: number; CAD: number; AUD: number;
  CNY: number; INR: number; SGD: number; KRW: number; TRY: number; BRL: number;
  MXN: number; NOK: number; SEK: number; ZAR: number;
  AED: number; SAR: number; QAR: number; KWD: number; BHD: number;
  isFallback: boolean; source: string; updatedAt: string;
}

// flag = ISO 3166-1 alpha-2 country code for flagcdn.com
// suffix = true means display as "3.25 AED" not "$3.25"
const ALL_CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar',           flag: 'us', decimals: 2, suffix: false },
  { code: 'EUR', symbol: '€',  name: 'Euro',                flag: 'eu', decimals: 2, suffix: false },
  { code: 'GBP', symbol: '£',  name: 'British Pound',       flag: 'gb', decimals: 2, suffix: false },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',         flag: 'ch', decimals: 2, suffix: false },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',        flag: 'jp', decimals: 0, suffix: false },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',     flag: 'ca', decimals: 2, suffix: false },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',   flag: 'au', decimals: 2, suffix: false },
  { code: 'AED', symbol: '',   name: 'UAE Dirham',          flag: 'ae', decimals: 2, suffix: true  },
  { code: 'SAR', symbol: '',   name: 'Saudi Riyal',         flag: 'sa', decimals: 2, suffix: true  },
  { code: 'KWD', symbol: '',   name: 'Kuwaiti Dinar',       flag: 'kw', decimals: 3, suffix: true  },
  { code: 'QAR', symbol: '',   name: 'Qatari Riyal',        flag: 'qa', decimals: 2, suffix: true  },
  { code: 'BHD', symbol: '',   name: 'Bahraini Dinar',      flag: 'bh', decimals: 3, suffix: true  },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',        flag: 'cn', decimals: 2, suffix: false },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',        flag: 'in', decimals: 2, suffix: false },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',    flag: 'sg', decimals: 2, suffix: false },
  { code: 'KRW', symbol: '₩',  name: 'South Korean Won',    flag: 'kr', decimals: 0, suffix: false },
  { code: 'TRY', symbol: '₺',  name: 'Turkish Lira',        flag: 'tr', decimals: 2, suffix: false },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real',      flag: 'br', decimals: 2, suffix: false },
  { code: 'MXN', symbol: '$',  name: 'Mexican Peso',        flag: 'mx', decimals: 2, suffix: false },
  { code: 'NOK', symbol: '',   name: 'Norwegian Krone',     flag: 'no', decimals: 2, suffix: true  },
  { code: 'SEK', symbol: '',   name: 'Swedish Krona',       flag: 'se', decimals: 2, suffix: true  },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand',  flag: 'za', decimals: 2, suffix: false },
] as const;
type CurrencyCode = typeof ALL_CURRENCIES[number]['code'];
type CurrencyMeta = typeof ALL_CURRENCIES[number];

function fmtCurrency(localVal: number, meta: CurrencyMeta, decimalsOverride?: number): string {
  const d = decimalsOverride !== undefined ? decimalsOverride : meta.decimals;
  const n = fmt(localVal, d);
  return meta.suffix ? `${n} ${meta.code}` : `${meta.symbol}${n}`;
}

const LOCALE_CURRENCY: Partial<Record<string, CurrencyCode>> = {
  'en-US': 'USD', 'en-CA': 'CAD', 'en-GB': 'GBP', 'en-AU': 'AUD', 'en-SG': 'SGD',
  'en-AE': 'AED', 'en-SA': 'SAR', 'en-KW': 'KWD', 'en-QA': 'QAR', 'en-BH': 'BHD',
  'de': 'EUR', 'fr': 'EUR', 'it': 'EUR', 'es': 'EUR', 'nl': 'EUR', 'pt-PT': 'EUR',
  'ar': 'AED', 'ar-AE': 'AED', 'ar-SA': 'SAR', 'ar-KW': 'KWD', 'ar-QA': 'QAR',
  'zh': 'CNY', 'zh-CN': 'CNY', 'ja': 'JPY', 'ko': 'KRW', 'hi': 'INR',
  'tr': 'TRY', 'pt-BR': 'BRL', 'es-MX': 'MXN', 'sv': 'SEK', 'no': 'NOK', 'nb': 'NOK',
  'af': 'ZAR', 'ch': 'CHF', 'de-CH': 'CHF', 'fr-CH': 'CHF',
};

function detectCurrency(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'USD';
  const lang = navigator.language || 'en-US';
  return LOCALE_CURRENCY[lang]
    ?? LOCALE_CURRENCY[lang.split('-')[0]]
    ?? 'USD';
}

const QTY_PRESETS = [1, 5, 10, 50, 100] as const;

const FLAG_CDN = 'https://flagcdn.com/w20';

// ── Currency selector with flag + search ───────────────────────────
function CurrencySelector({ value, onChange }: { value: CurrencyCode; onChange: (c: CurrencyCode) => void }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = ALL_CURRENCIES.find(c => c.code === value) ?? ALL_CURRENCIES[0];
  const filtered = ALL_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(query.toLowerCase()) ||
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => { setOpen(v => !v); setQuery(''); }}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 field-select py-2 text-left cursor-pointer"
      >
        <img
          src={`${FLAG_CDN}/${selected.flag}.png`}
          width={20} height={14} alt=""
          className="rounded-[2px] flex-shrink-0"
        />
        <span className="font-mono font-semibold text-sm text-white">{selected.code}</span>
        <span className="text-zinc-500 text-xs flex-1 truncate">{selected.name}</span>
        <span className="text-zinc-600 text-[0.6rem] ml-1 flex-shrink-0">{open ? '▴' : '▾'}</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -5, scaleY: 0.92 }}
            style={{ transformOrigin: 'top', zIndex: 200 }}
            className="absolute top-full mt-1 left-0 right-0
                       bg-[var(--color-surface-2)] border border-[var(--color-surface-4)]
                       rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Search input */}
            <div className="p-2 border-b border-[var(--color-surface-4)]">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search currency…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
                className="w-full bg-[var(--color-surface-3)] rounded-lg px-3 py-1.5 text-sm
                           outline-none text-white placeholder:text-zinc-600
                           border border-transparent focus:border-copper-600/40"
              />
            </div>
            {/* Currency list */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.code}
                  onClick={() => { onChange(c.code); setOpen(false); setQuery(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    c.code === value
                      ? 'bg-copper-600/15 text-copper-400'
                      : 'text-zinc-300 hover:bg-[var(--color-surface-3)]'
                  }`}
                >
                  <img
                    src={`${FLAG_CDN}/${c.flag}.png`}
                    width={20} height={14} alt=""
                    className="rounded-[2px] flex-shrink-0"
                  />
                  <span className="font-mono font-semibold text-xs w-10 flex-shrink-0">{c.code}</span>
                  <span className="text-zinc-500 text-xs flex-1 truncate">{c.name}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-zinc-600 text-xs py-4">No results</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const [widthStr, setWidthStr] = useState('60');
  const [thickStr, setThickStr] = useState('8');
  const [grade, setGrade] = useState<MaterialGrade>(DEFAULT_GRADE);

  const size = useMemo<BusbarSize>(() => {
    const w = Math.max(5,  Math.min(400, parseFloat(widthStr) || 60));
    const h = Math.max(1,  Math.min(50,  parseFloat(thickStr) || 8));
    return { id: 'custom', width: w, thickness: h, label: `${w} × ${h} mm` };
  }, [widthStr, thickStr]);
  const [live,  setLive]  = useState<CopperPriceData | null>(null);
  const [fx,    setFx]    = useState<FxRates | null>(null);
  const [loading, setLoad] = useState(true);
  const [manual, setMan]  = useState('');
  const [useMan, setUM]   = useState(false);
  const [qty, setQty]     = useState(1);
  const [currCode, setCurrCode] = useState<CurrencyCode>('USD');
  const [copied, setCopy] = useState(false);

  // Auto-detect currency from browser locale on mount
  useEffect(() => {
    setCurrCode(detectCurrency());
  }, []);

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

  const currMeta = useMemo(
    () => ALL_CURRENCIES.find(c => c.code === currCode) ?? ALL_CURRENCIES[0],
    [currCode],
  );

  const priceUSD = useMemo<number | null>(() => {
    if (useMan) { const v = parseFloat(manual); return isNaN(v) || v <= 0 ? null : v; }
    return live?.pricePerKg ?? null;
  }, [useMan, manual, live]);

  const fxRate = useMemo(() => {
    if (!fx || currCode === 'USD') return 1;
    const r = (fx as unknown as Record<string, number>)[currCode];
    return typeof r === 'number' && r > 0 ? r : 1;
  }, [fx, currCode]);

  const fmtLocal = useCallback(
    (usd: number, decimalsOverride?: number) => fmtCurrency(usd * fxRate, currMeta, decimalsOverride),
    [fxRate, currMeta],
  );

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

        {/* ── Dimensions + Grade ───────────────────── */}
        <p className="text-[0.6rem] font-bold tracking-[0.22em] text-zinc-600 uppercase mb-3">
          Busbar Specifications
        </p>

        <div className="mb-4 space-y-3">
          {/* Width × Thickness inputs */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              Dimensions — Width × Thickness (mm)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number" min="5" max="400" step="1"
                  className="field-input font-mono text-center pr-12"
                  placeholder="60"
                  value={widthStr}
                  onChange={e => setWidthStr(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[0.68rem] pointer-events-none font-mono">
                  W
                </span>
              </div>
              <span className="text-zinc-600 font-mono text-base flex-shrink-0 select-none">×</span>
              <div className="relative flex-1">
                <input
                  type="number" min="1" max="50" step="1"
                  className="field-input font-mono text-center pr-12"
                  placeholder="8"
                  value={thickStr}
                  onChange={e => setThickStr(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[0.68rem] pointer-events-none font-mono">
                  T
                </span>
              </div>
              <span className="text-zinc-600 text-[0.7rem] flex-shrink-0 font-mono">mm</span>
            </div>
            <p className="text-[0.63rem] text-zinc-600 mt-1 font-mono">
              {size.width} × {size.thickness} mm · {size.width * size.thickness} mm²
            </p>
          </div>

          {/* Material Grade */}
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
              {/* Currency selector with flag + search */}
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Display Currency</label>
                <CurrencySelector value={currCode} onChange={setCurrCode} />
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
                  formatFn={v => fmtCurrency(v, currMeta)}
                  secondary={currCode !== 'USD' ? fmtUSD(result.costPerMeter) : undefined}
                  unit={`${currCode} / m`}
                  delay={0.06}
                />
                <ResultCard
                  label="Cost / m²"
                  rawValue={result.costPerM2 * fxRate}
                  formatFn={v => fmtCurrency(v, currMeta, 0)}
                  secondary={currCode !== 'USD' ? fmtUSD(result.costPerM2, 0) : undefined}
                  unit={`${currCode} / m²`}
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
                        formatFn={v => fmtCurrency(v, currMeta)}
                        secondary={currCode !== 'USD' ? fmtUSD(result.costPerMeter * qty) : undefined}
                        unit={currCode}
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

              {/* FX rate info line */}
              {currCode !== 'USD' && fx && (
                <p className="text-center text-[0.62rem] text-zinc-700 mt-2">
                  1 USD = {fxRate.toFixed(4)} {currCode} · {fx.source}
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
