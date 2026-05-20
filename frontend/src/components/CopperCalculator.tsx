'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring, useInView,
} from 'framer-motion';
import { MATERIAL_GRADES, DEFAULT_GRADE, BUSBAR_SIZES } from '@/lib/copperData';
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

const FLAG_CDN = 'https://flagcdn.com/w20';

// ── Quick dimension presets (most common IEC sizes) ────────────────
const QUICK_PRESETS = [
  { w: '25', t: '3' }, { w: '40', t: '5' }, { w: '50', t: '5' },
  { w: '60', t: '8' }, { w: '80', t: '8' }, { w: '100', t: '10' },
  { w: '120', t: '10' },
] as const;

// ── Copper price mood indicator ────────────────────────────────────
// Historical COMEX HG range ≈ $4–$15/kg; bucket thresholds in USD/kg
function getPriceMood(price: number) {
  if (price < 7)  return { label: 'Low',    fg: '#22c55e', pct: 12 } as const;
  if (price < 9)  return { label: 'Normal', fg: '#84cc16', pct: 36 } as const;
  if (price < 11) return { label: 'Fair',   fg: '#eab308', pct: 58 } as const;
  if (price < 13) return { label: 'High',   fg: '#f97316', pct: 78 } as const;
  return                 { label: 'Peak',   fg: '#ef4444', pct: 96 } as const;
}

// ── Achievement badge system ───────────────────────────────────────
type Achievement = { id: string; icon: string; label: string; color: string };

function getAchievements(
  result: { weightPerMeter: number; costPerMeter: number } | null,
  size: BusbarSize, grade: MaterialGrade, lengthMm: number,
): Achievement[] {
  if (!result) return [];
  const a: Achievement[] = [];
  if (BUSBAR_SIZES.some(s => s.width === size.width && s.thickness === size.thickness))
    a.push({ id: 'iec',     icon: '✓', label: 'IEC Standard',      color: '#22c55e' });
  if (result.weightPerMeter >= 8)
    a.push({ id: 'heavy',   icon: '⚡', label: 'Heavy Gauge',       color: '#f59e0b' });
  if (grade.id === 'cu-ofe')
    a.push({ id: 'premium', icon: '◆', label: 'Premium Grade',      color: '#a78bfa' });
  else if (grade.id === 'cu-of')
    a.push({ id: 'hc',      icon: '◇', label: 'High Conductivity',  color: '#818cf8' });
  if (lengthMm >= 6000)
    a.push({ id: 'long',    icon: '∞', label: 'Long Run',           color: '#34d399' });
  if (result.costPerMeter < 20)
    a.push({ id: 'budget',  icon: '★', label: 'Budget Cut',         color: '#fbbf24' });
  return a;
}

// ── Confetti burst component ───────────────────────────────────────
function ConfettiBurst() {
  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 50,
      w: Math.random() * 7 + 4,
      h: Math.random() * 3 + 2,
      color: ['#cd7f32','#f5d78e','#b87333','#fbbf24','#e08830','#fff'][Math.floor(Math.random() * 6)],
      dx: (Math.random() - 0.5) * 140,
      dy: -(Math.random() * 110 + 50),
      rot: Math.random() * 720 - 360,
    })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50 rounded-[1.25rem]">
      {particles.map(p => (
        <motion.div key={p.id}
          initial={{ opacity: 1, x: `${p.x}%`, y: `${p.y}%`, rotate: 0, scale: 1 }}
          animate={{ opacity: 0, x: `calc(${p.x}% + ${p.dx}px)`, y: `calc(${p.y}% + ${p.dy}px)`, rotate: p.rot, scale: 0.3 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          style={{ position: 'absolute', width: p.w, height: p.h, background: p.color, borderRadius: 2 }}
        />
      ))}
    </div>
  );
}

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
  const cardRef  = useRef<HTMLDivElement>(null);
  const inView   = useInView(cardRef, { once: true, margin: '-60px' });
  const [widthStr, setWidthStr] = useState('60');
  const [thickStr, setThickStr] = useState('8');
  const [grade, setGrade] = useState<MaterialGrade>(DEFAULT_GRADE);

  // drag-to-resize state
  const dragStart = useRef<{ x: number; y: number; w: number; t: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // gamification
  const [calcCount,    setCalcCount]    = useState(0);
  const [milestone,    setMilestone]    = useState('');
  const [showConfetti, setConfetti]     = useState(false);
  const hadResult = useRef(false);

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
  const [lengthStr, setLengthStr] = useState('1000');

  // qty in meters for calculations, user enters in mm
  const qty = useMemo(() => {
    const mm = parseFloat(lengthStr) || 1000;
    return Math.max(1, Math.min(100000, mm)) / 1000;
  }, [lengthStr]);
  const [currCode, setCurrCode] = useState<CurrencyCode>('USD');
  const [copied, setCopy] = useState(false);

  // Auto-detect currency from browser locale on mount
  useEffect(() => {
    setCurrCode(detectCurrency());
    setCalcCount(parseInt(localStorage.getItem('pp_calcs') || '0'));
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

  const result = useMemo(
    () => (priceUSD ? calculateCost(size, grade, priceUSD) : null),
    [size, grade, priceUSD],
  );

  // Confetti + calc counter when result first arrives
  useEffect(() => {
    if (result && !hadResult.current) {
      hadResult.current = true;
      const next = parseInt(localStorage.getItem('pp_calcs') || '0') + 1;
      localStorage.setItem('pp_calcs', String(next));
      setCalcCount(next);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1300);
      if ([10, 25, 50, 100, 500, 1000].includes(next)) {
        setMilestone(`Calculation #${next}!`);
        setTimeout(() => setMilestone(''), 3200);
      }
    }
  }, [result]);

  // ── Drag-to-resize busbar viewer ──────────────────────────────────
  const onViewerPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = {
      x: e.clientX, y: e.clientY,
      w: parseFloat(widthStr) || 60,
      t: parseFloat(thickStr) || 8,
    };
    setIsDragging(true);
  }, [widthStr, thickStr]);

  const onViewerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newW = Math.max(5,  Math.min(400, Math.round(dragStart.current.w + dx * 0.7)));
    const newT = Math.max(1,  Math.min(50,  Math.round(dragStart.current.t - dy * 0.12)));
    setWidthStr(String(newW));
    setThickStr(String(newT));
  }, []);

  const onViewerPointerUp = useCallback(() => {
    dragStart.current = null;
    setIsDragging(false);
  }, []);

  const handleCopy = async () => {
    if (!result) return;
    const lines = [
      'PAYAPRESS — Copper Busbar Cost Calculator',
      '─'.repeat(44),
      `Size:          ${size.label}`,
      `Grade:         ${grade.label} (${(grade.purity*100).toFixed(2)}%)`,
      `Copper price:  ${fmtUSD(result.pricePerKg)}/kg`,
      `Length:        ${lengthStr} mm  (${qty.toFixed(qty < 1 ? 3 : 1)} m)`,
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
      className="relative"
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
    <TiltCard className="card-copper scanlines">
      {/* Confetti burst on first result */}
      <AnimatePresence>{showConfetti && <ConfettiBurst key="confetti" />}</AnimatePresence>
      <div className="relative z-10">

        {/* ── Busbar Viewer (drag to resize) ────────── */}
        <div
          className={`viewer-bg rounded-t-[1.25rem] overflow-hidden px-4 pt-3 pb-2 border-b border-[var(--color-surface-3)] select-none ${isDragging ? 'cursor-ew-resize' : 'cursor-grab'}`}
          onPointerDown={onViewerPointerDown}
          onPointerMove={onViewerPointerMove}
          onPointerUp={onViewerPointerUp}
          onPointerCancel={onViewerPointerUp}
        >
          <BusbarRender width={size.width} thickness={size.thickness} />
          <div className="flex items-center justify-center gap-2 pb-1 flex-wrap">
            <span className="font-mono text-xs text-copper-600 font-bold tracking-wide">{size.label}</span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-xs text-zinc-500">{size.width * size.thickness} mm²</span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-xs text-zinc-500">{grade.label}</span>
            {BUSBAR_SIZES.some(s => s.width === size.width && s.thickness === size.thickness) && (
              <span className="text-[0.55rem] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                IEC STD
              </span>
            )}
          </div>
          {!isDragging && (
            <p className="text-center text-[0.55rem] text-zinc-700 pb-0.5 tracking-wide">
              ← drag to resize →
            </p>
          )}
        </div>

        {/* ── Form body ─────────────────────────────── */}
        <div className="px-5 md:px-7 pt-5 pb-6 space-y-0">

          {/* ── SECTION: Dimensions ─────────────────── */}
          <div className="pb-5 border-b border-[var(--color-surface-3)]">
            <p className="calc-section-label">Dimensions</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Width</label>
                <div className="relative">
                  <input
                    type="number" min="5" max="400" step="1"
                    inputMode="numeric"
                    className="field-input font-mono text-center pr-12 py-3 text-base"
                    placeholder="60"
                    value={widthStr}
                    onChange={e => setWidthStr(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none font-mono">mm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Thickness</label>
                <div className="relative">
                  <input
                    type="number" min="1" max="50" step="1"
                    inputMode="numeric"
                    className="field-input font-mono text-center pr-12 py-3 text-base"
                    placeholder="8"
                    value={thickStr}
                    onChange={e => setThickStr(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none font-mono">mm</span>
                </div>
              </div>
            </div>
            <p className="text-[0.68rem] text-zinc-600 font-mono">
              {size.width} × {size.thickness} mm &nbsp;·&nbsp; {size.width * size.thickness} mm² cross-section
            </p>
            {/* Quick preset chips */}
            <div className="flex gap-1.5 flex-wrap mt-3">
              {QUICK_PRESETS.map(p => {
                const active = widthStr === p.w && thickStr === p.t;
                return (
                  <motion.button
                    key={`${p.w}x${p.t}`}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => { setWidthStr(p.w); setThickStr(p.t); }}
                    className="text-[0.6rem] font-mono font-semibold px-2 py-1 rounded-full border transition-all"
                    style={{
                      background: active ? 'rgba(205,127,50,0.18)' : 'rgba(255,255,255,0.03)',
                      borderColor: active ? 'rgba(205,127,50,0.55)' : 'rgba(255,255,255,0.08)',
                      color: active ? '#cd7f32' : '#71717a',
                    }}
                  >
                    {p.w}×{p.t}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── SECTION: Material Grade ──────────────── */}
          <div className="py-5 border-b border-[var(--color-surface-3)]">
            <p className="calc-section-label">Material Grade</p>
            <div className="relative">
              <select
                className="field-select pr-8 py-3 text-sm"
                value={grade.id}
                onChange={e => setGrade(MATERIAL_GRADES.find(g => g.id === e.target.value) ?? DEFAULT_GRADE)}
              >
                {MATERIAL_GRADES.map(g => (
                  <option key={g.id} value={g.id}>{g.label} — {(g.purity*100).toFixed(2)}%</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">▾</span>
            </div>
            <p className="text-[0.68rem] text-zinc-600 mt-2">{grade.standard} &nbsp;·&nbsp; ρ {grade.density} g/cm³</p>
          </div>

          {/* ── SECTION: Copper Price ────────────────── */}
          <div className="py-5 border-b border-[var(--color-surface-3)]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <p className="calc-section-label mb-0">Copper Price <span className="text-zinc-600 normal-case tracking-normal font-normal">(USD / kg)</span></p>
                {live && (() => {
                  const mood = getPriceMood(live.pricePerKg);
                  return (
                    <span className="text-[0.55rem] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: `${mood.fg}18`, color: mood.fg, border: `1px solid ${mood.fg}38` }}>
                      <span className="w-1 h-1 rounded-full inline-block" style={{ background: mood.fg }} />
                      {mood.label}
                    </span>
                  );
                })()}
              </div>
              <button
                onClick={() => { setUM(v => !v); setMan(''); }}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                {useMan ? (
                  <span className="flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M13.5 8A5.5 5.5 0 112.7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M2 2v3h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Switch to Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5-8 8H3v-2.5l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    Enter Manual
                  </span>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {useMan ? (
                <motion.div key="manual"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="flex items-center bg-[var(--color-surface-3)] border border-[var(--color-surface-4)]
                             focus-within:border-copper-600/55 focus-within:shadow-[0_0_0_3px_rgba(205,127,50,0.1)]
                             rounded-xl transition-all overflow-hidden"
                >
                  <span className="pl-4 text-zinc-400 font-mono text-base font-semibold">$</span>
                  <input
                    type="number" min="0" step="0.001"
                    inputMode="decimal"
                    className="flex-1 bg-transparent text-white font-mono px-2 py-3.5 outline-none placeholder:text-zinc-700 text-base"
                    placeholder="13.975"
                    value={manual}
                    onChange={e => setMan(e.target.value)}
                  />
                  <span className="pr-4 text-zinc-500 text-xs font-mono">USD / kg</span>
                </motion.div>
              ) : (
                <motion.div key="live"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="flex items-center gap-3 bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] rounded-xl px-4 py-3.5"
                >
                  {loading ? (
                    <span className="text-zinc-500 text-sm animate-pulse">Fetching live price…</span>
                  ) : live ? (
                    <>
                      <span className={live.isFallback ? 'fallback-dot' : 'live-dot'} />
                      <span className="font-mono text-xl font-bold text-copper-400">${fmt(live.pricePerKg, 3)}</span>
                      <span className="text-zinc-500 text-sm">/kg</span>
                      <span className="text-zinc-600 text-xs font-mono ml-auto">
                        ${fmt(live.pricePerKg / 2.20462, 3)}/lb
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-500 text-sm">Unavailable — switch to manual</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── SECTION: Length ─────────────────────── */}
          <div className="py-5 border-b border-[var(--color-surface-3)]">
            <p className="calc-section-label">Length</p>
            <div className="relative">
              <input
                type="number" min="1" max="100000" step="100"
                inputMode="numeric"
                className="field-input font-mono pr-16 py-3 text-base"
                placeholder="1000"
                value={lengthStr}
                onChange={e => setLengthStr(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none font-mono font-semibold">
                mm
              </span>
            </div>
            <p className="text-[0.68rem] text-zinc-600 mt-2 font-mono">
              = {qty.toFixed(qty < 1 ? 3 : qty < 10 ? 2 : 1)} m &nbsp;·&nbsp; {(size.width * size.thickness * qty).toFixed(1)} cm³ volume
            </p>
          </div>

          {/* ── SECTION: Currency ───────────────────── */}
          <div className="py-5 border-b border-[var(--color-surface-3)]">
            <p className="calc-section-label">Display Currency</p>
            <CurrencySelector value={currCode} onChange={setCurrCode} />
            {currCode !== 'USD' && fx && (
              <p className="text-[0.68rem] text-zinc-600 mt-2 font-mono">
                1 USD = {fxRate.toFixed(4)} {currCode} &nbsp;·&nbsp; {fx.source}
              </p>
            )}
          </div>

          {/* ── RESULTS ──────────────────────────────── */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Achievement badges */}
                {(() => {
                  const badges = getAchievements(result, size, grade, parseFloat(lengthStr) || 1000);
                  return badges.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex flex-wrap gap-1.5 pt-5 pb-2"
                    >
                      {badges.map((b, i) => (
                        <motion.span key={b.id}
                          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 340, damping: 20 }}
                          className="text-[0.57rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                          style={{ background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}35` }}
                        >
                          {b.icon} {b.label}
                        </motion.span>
                      ))}
                    </motion.div>
                  ) : <div className="pt-5" />;
                })()}

                {/* Per metre */}
                <div className="pb-4">
                  <div className="copper-divider mb-4">Per Metre</div>
                  <div className="grid grid-cols-3 gap-2.5">
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
                </div>

                {/* Total */}
                <div className="border-t border-[var(--color-surface-3)] pt-5 pb-4">
                  <div className="copper-divider mb-4">Total — {Number(lengthStr) || 1000} mm</div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <ResultCard
                      label="Weight"
                      rawValue={result.weightPerMeter * qty}
                      formatFn={v => fmt(v, 2)}
                      unit="kg"
                      delay={0}
                    />
                    <ResultCard
                      label="Cost"
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
                </div>

                {/* Copy button + calc counter */}
                <div className="border-t border-[var(--color-surface-3)] pt-4">
                  {calcCount > 0 && (
                    <p className="text-center text-[0.58rem] text-zinc-700 font-mono mb-2">
                      calculation #{calcCount.toLocaleString()}
                    </p>
                  )}
                  <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.012 }}
                    whileTap={{ scale: 0.975 }}
                    className="btn-ghost w-full py-3 flex items-center justify-center gap-2 text-sm"
                  >
                    <AnimatePresence mode="wait">
                      <motion.span key={copied ? 'ok' : 'copy'}
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-green-500">
                              <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Copied to clipboard
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60">
                              <rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M2 5v9a1.5 1.5 0 001.5 1.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            Copy Results
                          </>
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </div>

              </motion.div>
            ) : (
              <motion.div key="empty" className="text-center py-10 text-zinc-600 text-sm">
                {loading ? (
                  <span className="animate-pulse">Loading live copper price…</span>
                ) : (
                  'Enter copper price to calculate costs'
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>{/* /form body */}
      </div>
    </TiltCard>

    {/* Milestone toast */}
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap
                     flex items-center gap-2.5 px-5 py-2.5 rounded-2xl
                     bg-[var(--color-surface-2)] border border-copper-600/40
                     shadow-[0_16px_50px_rgba(0,0,0,0.8)]"
        >
          <span className="text-base">🎉</span>
          <div>
            <p className="text-white text-xs font-bold leading-none">Milestone reached!</p>
            <p className="text-copper-500 text-[0.65rem] mt-0.5 font-mono">{milestone}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    </motion.div>
  );
}
