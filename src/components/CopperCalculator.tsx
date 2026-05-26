'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MATERIAL_GRADES, DEFAULT_GRADE, BUSBAR_SIZES } from '@/lib/copperData';
import { ALUMINUM_GRADES, DEFAULT_ALUMINUM_GRADE, ALUMINUM_BUSBAR_SIZES } from '@/lib/aluminumData';
import { calculateCost, fmt, fmtUSD, fmtCompact } from '@/lib/copperPrice';
import { BusbarRender } from './BusbarRender';
import type { BusbarSize, MaterialGrade, CopperPriceData, FxRates, InitialPriceData } from '@/types/calculator';

// ── Design tokens ──────────────────────────────────────────────────
const C = {
  orange:        '#e8731a',
  orangeDim:     'rgba(232,115,26,0.15)',
  orangeBorder:  'rgba(232,115,26,0.45)',
  orangeGlow:    'rgba(232,115,26,0.08)',
  card:          '#12151f',
  inputBg:       '#0c0f18',
  border:        'rgba(255,255,255,0.07)',
  borderHover:   'rgba(255,255,255,0.13)',
  alBlue:        '#6fb3e0',
  alBlueDim:     'rgba(111,179,224,0.15)',
  alBlueBorder:  'rgba(111,179,224,0.4)',
} as const;

// ── Currency data ──────────────────────────────────────────────────
const ALL_CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollars',       flag: 'us', decimals: 2, suffix: false },
  { code: 'AED', symbol: '',   name: 'AED',               flag: 'ae', decimals: 2, suffix: true  },
  { code: 'CNY', symbol: '¥',  name: 'Yuan',              flag: 'cn', decimals: 2, suffix: false },
  { code: 'EUR', symbol: '€',  name: 'Euro',              flag: 'eu', decimals: 2, suffix: false },
  { code: 'GBP', symbol: '£',  name: 'British Pound',     flag: 'gb', decimals: 2, suffix: false },
  { code: 'SAR', symbol: '',   name: 'Saudi Riyal',       flag: 'sa', decimals: 2, suffix: true  },
  { code: 'KWD', symbol: '',   name: 'Kuwaiti Dinar',     flag: 'kw', decimals: 3, suffix: true  },
  { code: 'QAR', symbol: '',   name: 'Qatari Riyal',      flag: 'qa', decimals: 2, suffix: true  },
  { code: 'BHD', symbol: '',   name: 'Bahraini Dinar',    flag: 'bh', decimals: 3, suffix: true  },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',     flag: 'jp', decimals: 0, suffix: false },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',  flag: 'ca', decimals: 2, suffix: false },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',flag: 'au', decimals: 2, suffix: false },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',      flag: 'ch', decimals: 2, suffix: false },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',     flag: 'in', decimals: 2, suffix: false },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: 'sg', decimals: 2, suffix: false },
  { code: 'KRW', symbol: '₩',  name: 'South Korean Won', flag: 'kr', decimals: 0, suffix: false },
  { code: 'TRY', symbol: '₺',  name: 'Turkish Lira',     flag: 'tr', decimals: 2, suffix: false },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real',   flag: 'br', decimals: 2, suffix: false },
  { code: 'MXN', symbol: '$',  name: 'Mexican Peso',     flag: 'mx', decimals: 2, suffix: false },
  { code: 'NOK', symbol: '',   name: 'Norwegian Krone',  flag: 'no', decimals: 2, suffix: true  },
  { code: 'SEK', symbol: '',   name: 'Swedish Krona',    flag: 'se', decimals: 2, suffix: true  },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand',flag:'za', decimals: 2, suffix: false },
] as const;
type CurrencyCode = typeof ALL_CURRENCIES[number]['code'];
type CurrencyMeta = typeof ALL_CURRENCIES[number];

const LOCALE_CURRENCY: Partial<Record<string, CurrencyCode>> = {
  'en-US': 'USD', 'en-CA': 'CAD', 'en-GB': 'GBP', 'en-AU': 'AUD', 'en-SG': 'SGD',
  'en-AE': 'AED', 'en-SA': 'SAR', 'en-KW': 'KWD', 'en-QA': 'QAR', 'en-BH': 'BHD',
  'de': 'EUR', 'fr': 'EUR', 'it': 'EUR', 'es': 'EUR', 'nl': 'EUR',
  'ar': 'AED', 'ar-AE': 'AED', 'ar-SA': 'SAR', 'ar-KW': 'KWD', 'ar-QA': 'QAR',
  'zh': 'CNY', 'zh-CN': 'CNY', 'ja': 'JPY', 'ko': 'KRW', 'hi': 'INR',
  'tr': 'TRY', 'pt-BR': 'BRL', 'es-MX': 'MXN', 'sv': 'SEK', 'no': 'NOK', 'nb': 'NOK',
  'af': 'ZAR', 'de-CH': 'CHF', 'fr-CH': 'CHF',
};

const FLAG_CDN = 'https://flagcdn.com/w40';

function detectCurrency(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'USD';
  const lang = navigator.language || 'en-US';
  return LOCALE_CURRENCY[lang] ?? LOCALE_CURRENCY[lang.split('-')[0]] ?? 'USD';
}

function fmtCurrency(localVal: number, meta: CurrencyMeta, decimalsOverride?: number): string {
  if (Math.abs(localVal) >= 10000) {
    const n = fmtCompact(localVal);
    return meta.suffix ? `${n} ${meta.code}` : `${meta.symbol}${n}`;
  }
  const d = decimalsOverride !== undefined ? decimalsOverride : meta.decimals;
  const n = fmt(localVal, d);
  return meta.suffix ? `${n} ${meta.code}` : `${meta.symbol}${n}`;
}

// ── Current capacity (simplified IEC empirical formula) ────────────
function calcCurrentCapacity(widthMm: number, thicknessMm: number, metal: 'copper' | 'aluminum'): number {
  const area = widthMm * thicknessMm;
  return Math.round(area * (metal === 'copper' ? 2.24 : 1.40));
}

// ── Quick presets ──────────────────────────────────────────────────
const COPPER_QUICK_PRESETS    = [{ w:'25',t:'3'},{ w:'40',t:'5'},{ w:'50',t:'5'},{ w:'60',t:'8'},{ w:'80',t:'8'},{ w:'100',t:'10'},{ w:'120',t:'10'}] as const;
const ALUMINUM_QUICK_PRESETS  = [{ w:'25',t:'4'},{ w:'40',t:'5'},{ w:'60',t:'6'},{ w:'80',t:'8'},{ w:'100',t:'10'},{ w:'120',t:'12'},{ w:'160',t:'12'}] as const;

// ── Confetti burst ─────────────────────────────────────────────────
function ConfettiBurst() {
  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, y: 20 + Math.random() * 50,
      w: Math.random() * 7 + 4, h: Math.random() * 3 + 2,
      color: ['#e8731a','#f5d78e','#d06010','#fbbf24','#e08030','#fff'][Math.floor(Math.random() * 6)],
      dx: (Math.random() - 0.5) * 140, dy: -(Math.random() * 110 + 50),
      rot: Math.random() * 720 - 360,
    })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50 rounded-2xl">
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

// ── Animated number hook ───────────────────────────────────────────
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
      const e = 1 - Math.pow(1 - t, 3);
      setCurrent(from + (target - from) * e);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else prev.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return current;
}

function AnimNumber({ val, fn }: { val: number; fn: (n: number) => string }) {
  return <>{fn(useAnimatedNumber(val))}</>;
}

// ── Section label (Figma style: circle icon + orange text) ─────────
function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
           style={{ background: C.orangeDim, color: C.orange }}>
        {icon}
      </div>
      <span className="text-sm font-semibold" style={{ color: C.orange }}>
        {children}
      </span>
    </div>
  );
}

// ── Figma-style input ──────────────────────────────────────────────
function FigmaInput({
  placeholder, value, onChange, onBlur, suffix, active = false,
}: {
  placeholder: string; value: string;
  onChange: (v: string) => void;
  onBlur: (v: string) => void;
  suffix?: string; active?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || (value !== '' && value !== '0');
  return (
    <div className="relative">
      <input
        type="text" inputMode="numeric" pattern="[0-9]*"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        onFocus={() => setFocused(true)}
        onBlur={e => { setFocused(false); onBlur(e.target.value); }}
        style={{
          width: '100%',
          background: C.inputBg,
          border: `1px solid ${isActive || active ? C.orangeBorder : C.border}`,
          borderRadius: 12,
          color: isActive ? '#ffffff' : '#888',
          padding: '13px 16px',
          paddingRight: suffix ? 52 : 16,
          fontSize: '1rem',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.18s, color 0.18s',
          WebkitAppearance: 'none',
          boxShadow: isActive ? `0 0 0 3px ${C.orangeGlow}` : 'none',
        }}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-mono pointer-events-none"
              style={{ color: '#555' }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

// ── Calculation result card (2×2 grid) ─────────────────────────────
function CalcCard({
  label, value, unit, highlight = false, delay = 0,
}: {
  label: string; value: string; unit: string; highlight?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22, delay }}
      style={{
        background: highlight ? 'rgba(232,115,26,0.08)' : C.inputBg,
        border: `1px solid ${highlight ? C.orangeBorder : C.border}`,
        borderRadius: 16,
        padding: '14px 16px',
      }}
    >
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2.5"
         style={{ color: highlight ? C.orange : '#666' }}>
        {label}
      </p>
      <p className="text-2xl font-bold font-mono leading-none"
         style={{ color: highlight ? C.orange : '#fff' }}>
        {value}
      </p>
      <p className="text-[11px] mt-2" style={{ color: '#555' }}>{unit}</p>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export function CopperCalculator({ initialData }: { initialData?: InitialPriceData }) {

  // ── Visibility ──────────────────────────────────────────────────
  const cardRef  = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '-40px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Core state ──────────────────────────────────────────────────
  const [metalType,  setMetalType]  = useState<'copper' | 'aluminum'>('copper');
  const [widthStr,   setWidthStr]   = useState('60');
  const [thickStr,   setThickStr]   = useState('8');
  const [lengthStr,  setLengthStr]  = useState('1000');
  const [grade,      setGrade]      = useState<MaterialGrade>(DEFAULT_GRADE);
  const [currCode,   setCurrCode]   = useState<CurrencyCode>('USD');
  const [manual,     setMan]        = useState('');
  const [useMan,     setUM]         = useState(false);
  const [copied,     setCopy]       = useState(false);

  // ── Price state ──────────────────────────────────────────────────
  const [live,      setLive]   = useState<CopperPriceData | null>(initialData?.copper   ?? null);
  const [alLive,    setAlLive] = useState<CopperPriceData | null>(initialData?.aluminum ?? null);
  const [fx,        setFx]     = useState<FxRates | null>(initialData?.fx ?? null);
  const [loading,   setLoad]   = useState(initialData?.copper   == null);
  const [alLoading, setAlLoad] = useState(initialData?.aluminum == null);

  // ── Gamification ─────────────────────────────────────────────────
  const [calcCount,    setCalcCount]  = useState(0);
  const [milestone,    setMilestone]  = useState('');
  const [showConfetti, setConfetti]   = useState(false);
  const hadResult = useRef(false);

  // ── Drag-to-resize ───────────────────────────────────────────────
  const dragStart   = useRef<{ x: number; y: number; w: number; t: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Computed ────────────────────────────────────────────────────
  const size = useMemo<BusbarSize>(() => {
    const w = Math.max(1, Math.min(100000, parseFloat(widthStr) || 60));
    const h = Math.max(1, Math.min(100000, parseFloat(thickStr) || 8));
    return { id: 'custom', width: w, thickness: h, label: `${w} × ${h} mm` };
  }, [widthStr, thickStr]);

  const qty = useMemo(() => {
    const mm = parseFloat(lengthStr) || 1000;
    return Math.max(1, Math.min(100000, mm)) / 1000;
  }, [lengthStr]);

  const activeLive    = metalType === 'copper' ? live    : alLive;
  const activeLoading = metalType === 'copper' ? loading : alLoading;
  const currentGrades = metalType === 'copper' ? MATERIAL_GRADES : ALUMINUM_GRADES;
  const quickPresets  = metalType === 'copper' ? COPPER_QUICK_PRESETS : ALUMINUM_QUICK_PRESETS;

  const currMeta = useMemo(
    () => ALL_CURRENCIES.find(c => c.code === currCode) ?? ALL_CURRENCIES[0],
    [currCode],
  );

  const priceUSD = useMemo<number | null>(() => {
    if (useMan) { const v = parseFloat(manual); return isNaN(v) || v <= 0 ? null : v; }
    return activeLive?.pricePerKg ?? null;
  }, [useMan, manual, activeLive]);

  const fxRate = useMemo(() => {
    if (!fx || currCode === 'USD') return 1;
    const r = (fx as unknown as Record<string, number>)[currCode];
    return typeof r === 'number' && r > 0 ? r : 1;
  }, [fx, currCode]);

  const result = useMemo(
    () => (priceUSD ? calculateCost(size, grade, priceUSD) : null),
    [size, grade, priceUSD],
  );

  const totalCostLocal = result ? result.costPerMeter * qty * fxRate : 0;
  const materialCost   = result ? result.costPerMeter * qty * fxRate : 0;
  const fabricationCost = result ? result.costPerMeter * qty * fxRate * 1.045 : 0;
  const weightPerBar   = result ? result.weightPerMeter * qty : 0;
  const currentCap     = useMemo(() => calcCurrentCapacity(size.width, size.thickness, metalType), [size, metalType]);

  const isIecStd = (metalType === 'copper' ? BUSBAR_SIZES : ALUMINUM_BUSBAR_SIZES)
    .some(s => s.width === size.width && s.thickness === size.thickness);

  // ── Effects ──────────────────────────────────────────────────────
  useEffect(() => {
    setCurrCode(detectCurrency());
    try { setCalcCount(parseInt(localStorage.getItem('pp_calcs') || '0')); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const fetchAll = async (isInitial: boolean) => {
      const [p, al, f] = await Promise.all([
        fetch('/api/copper-price').then(r => r.json()).catch(() => null),
        fetch('/api/aluminum-price').then(r => r.json()).catch(() => null),
        fetch('/api/fx-rate').then(r => r.json()).catch(() => null),
      ]);
      if (p)  setLive(p);
      if (al) setAlLive(al);
      if (f)  setFx(f);
      if (isInitial) { setLoad(false); setAlLoad(false); }
    };
    fetchAll(initialData?.copper == null);
    const iv = setInterval(() => fetchAll(false), 300000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (result && !hadResult.current) {
      hadResult.current = true;
      let next = 1;
      try { next = parseInt(localStorage.getItem('pp_calcs') || '0') + 1; localStorage.setItem('pp_calcs', String(next)); } catch { /* ignore */ }
      setCalcCount(next);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1300);
      if ([10, 25, 50, 100, 500, 1000].includes(next)) {
        setMilestone(`Calculation #${next}!`);
        setTimeout(() => setMilestone(''), 3200);
      }
    }
  }, [result]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleMetalSwitch = useCallback((m: 'copper' | 'aluminum') => {
    setMetalType(m);
    setGrade(m === 'copper' ? DEFAULT_GRADE : DEFAULT_ALUMINUM_GRADE);
    setUM(false); setMan('');
  }, []);

  const onViewerPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, w: parseFloat(widthStr) || 60, t: parseFloat(thickStr) || 8 };
    setIsDragging(true);
  }, [widthStr, thickStr]);

  const onViewerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setWidthStr(String(Math.max(1, Math.min(400, Math.round(dragStart.current.w + dx * 0.7)))));
    setThickStr(String(Math.max(1, Math.min(100, Math.round(dragStart.current.t - dy * 0.12)))));
  }, []);

  const onViewerPointerUp = useCallback(() => { dragStart.current = null; setIsDragging(false); }, []);

  const handleCopy = async () => {
    if (!result) return;
    const metal = metalType === 'copper' ? 'Copper' : 'Aluminum';
    const lines = [
      `PAYAPRESS — ${metal} Busbar Cost Calculator`,
      '─'.repeat(44),
      `Size:         ${size.label}`,
      `Grade:        ${grade.label} (${(grade.purity * 100).toFixed(2)}%)`,
      `${metal} price: ${fmtUSD(result.pricePerKg)}/kg`,
      `Length:       ${lengthStr} mm  (${qty.toFixed(qty < 1 ? 3 : 1)} m)`,
      '─'.repeat(44),
      `Weight:       ${fmt(weightPerBar, 2)} kg`,
      `Material:     ${fmtCurrency(materialCost, currMeta)}`,
      `Total/Bar:    ${fmtCurrency(fabricationCost, currMeta)} (incl. fabrication)`,
      `Current Cap:  ${currentCap}A`,
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopy(true);
    setTimeout(() => setCopy(false), 2500);
  };

  // ── Render ───────────────────────────────────────────────────────
  const accentColor = metalType === 'copper' ? C.orange   : C.alBlue;
  const accentDim   = metalType === 'copper' ? C.orangeDim : C.alBlueDim;
  const accentBorder = metalType === 'copper' ? C.orangeBorder : C.alBlueBorder;

  return (
    <div
      ref={cardRef}
      className="w-full max-w-sm mx-auto relative"
      style={{
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: C.card,
          border: `1px solid ${accentBorder}`,
          borderRadius: 24,
          boxShadow: `0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)`,
        }}
      >
        <AnimatePresence>{showConfetti && <ConfettiBurst key="confetti" />}</AnimatePresence>

        <div className="p-5 space-y-5">

          {/* ── Price header ──────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold" style={{ color: accentColor }}>
              {metalType === 'copper' ? 'Copper Price' : 'Aluminum Price'}
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight" style={{ color: accentColor }}>
              {activeLoading
                ? <span className="animate-pulse text-xl" style={{ color: '#555' }}>···</span>
                : activeLive
                  ? `$${fmt(activeLive.pricePerKg, 3)}`
                  : <span style={{ color: '#444' }}>—</span>
              }
            </span>
          </div>

          {/* ── Metal toggle ──────────────────────────────────────── */}
          <div className="flex gap-2.5">
            {(['copper', 'aluminum'] as const).map(m => {
              const active = metalType === m;
              const color  = m === 'copper' ? C.orange : C.alBlue;
              const dim    = m === 'copper' ? C.orangeDim : C.alBlueDim;
              const border = m === 'copper' ? C.orangeBorder : C.alBlueBorder;
              return (
                <button key={m} onClick={() => handleMetalSwitch(m)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all select-none"
                  style={{
                    background: active ? dim : 'transparent',
                    border: `1.5px solid ${active ? border : C.border}`,
                    color: active ? color : '#666',
                  }}
                >
                  <span className="text-[10px]">{active ? '●' : '○'}</span>
                  {m === 'copper' ? 'CU-Copper' : 'Al-Aluminium'}
                </button>
              );
            })}
          </div>

          {/* ── Busbar render ─────────────────────────────────────── */}
          <div
            className={`rounded-2xl overflow-hidden select-none ${isDragging ? 'cursor-ew-resize' : 'cursor-grab'}`}
            style={{ background: C.inputBg, border: `1px solid ${C.border}`, padding: '20px 16px 12px' }}
            onPointerDown={onViewerPointerDown}
            onPointerMove={onViewerPointerMove}
            onPointerUp={onViewerPointerUp}
            onPointerCancel={onViewerPointerUp}
          >
            <BusbarRender width={size.width} thickness={size.thickness} metal={metalType} />
            <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>
                {size.width} × {size.thickness} mm
              </span>
              <span style={{ color: '#333', fontSize: '0.5rem' }}>·</span>
              <span className="font-mono text-xs" style={{ color: '#555' }}>{size.width * size.thickness} mm²</span>
              {isIecStd && (
                <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                  IEC STD
                </span>
              )}
            </div>
            <p className="text-center text-[9px] tracking-widest mt-1.5" style={{ color: '#333', opacity: isDragging ? 0 : 1, transition: 'opacity 0.15s' }}>
              ← DRAG TO RESIZE →
            </p>
          </div>

          {/* ── Dimensions ────────────────────────────────────────── */}
          <div>
            <SectionLabel icon="i">Dimensions in mm</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <FigmaInput
                placeholder="Width"
                value={widthStr}
                suffix="↔"
                onChange={raw => { const v = parseFloat(raw); setWidthStr(!isNaN(v) && v > 100000 ? '100000' : raw); }}
                onBlur={v => { const n = Math.round(parseFloat(v)); setWidthStr(String(!isNaN(n) ? Math.max(1, Math.min(100000, n)) : 60)); }}
              />
              <FigmaInput
                placeholder="Height"
                value={thickStr}
                suffix="mm"
                onChange={raw => { const v = parseFloat(raw); setThickStr(!isNaN(v) && v > 100000 ? '100000' : raw); }}
                onBlur={v => { const n = Math.round(parseFloat(v)); setThickStr(String(!isNaN(n) ? Math.max(1, Math.min(100000, n)) : 8)); }}
              />
            </div>
            <FigmaInput
              placeholder="Length"
              value={lengthStr}
              suffix="mm"
              onChange={raw => { const v = parseFloat(raw); setLengthStr(!isNaN(v) && v > 100000 ? '100000' : raw); }}
              onBlur={v => { const n = Math.round(parseFloat(v)); setLengthStr(String(!isNaN(n) ? Math.max(1, Math.min(100000, n)) : 1000)); }}
            />

            {/* Quick dimension presets */}
            <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {quickPresets.map(p => {
                const active = widthStr === p.w && thickStr === p.t;
                return (
                  <button key={`${p.w}x${p.t}`}
                    onClick={() => { setWidthStr(p.w); setThickStr(p.t); }}
                    className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full flex-shrink-0 transition-all"
                    style={{
                      background: active ? accentDim : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? accentBorder : 'rgba(255,255,255,0.07)'}`,
                      color: active ? accentColor : '#444',
                    }}>
                    {p.w}×{p.t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Currency Conversion ───────────────────────────────── */}
          <div>
            <SectionLabel icon="$">Currency Conversion</SectionLabel>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {ALL_CURRENCIES.map(c => {
                const active = c.code === currCode;
                return (
                  <button key={c.code} onClick={() => setCurrCode(c.code)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full flex-shrink-0 transition-all"
                    style={{
                      background: active ? accentDim : C.inputBg,
                      border: `1px solid ${active ? accentBorder : C.border}`,
                      color: active ? '#fff' : '#666',
                    }}>
                    <img
                      src={`${FLAG_CDN}/${c.flag}.png`}
                      width={20} height={20} alt={c.name}
                      className="rounded-full flex-shrink-0 object-cover"
                      style={{ width: 20, height: 20 }}
                    />
                    <span className="text-sm font-medium whitespace-nowrap">{c.name}</span>
                  </button>
                );
              })}
            </div>
            {currCode !== 'USD' && fx && (
              <p className="text-[11px] mt-2 font-mono" style={{ color: '#444' }}>
                1 USD = {fxRate.toFixed(4)} {currCode}
              </p>
            )}
          </div>

          {/* ── Grade ─────────────────────────────────────────────── */}
          <div>
            <SectionLabel icon="▤">
              Grade of {metalType === 'copper' ? 'Copper' : 'Aluminum'}
            </SectionLabel>
            <div className="flex gap-2 flex-wrap">
              {currentGrades.map(g => {
                const active = g.id === grade.id;
                return (
                  <button key={g.id} onClick={() => setGrade(g)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: active ? accentDim : C.inputBg,
                      border: `1px solid ${active ? accentBorder : C.border}`,
                      color: active ? '#fff' : '#666',
                    }}>
                    {g.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] mt-2 font-mono" style={{ color: '#444' }}>
              {(grade.purity * 100).toFixed(2)}% purity · ρ {grade.density} g/cm³
            </p>
          </div>

          {/* ── Manual price toggle ───────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: '#555' }}>
                {metalType === 'copper' ? 'Copper' : 'Aluminum'} Price / kg
              </span>
              <button onClick={() => { setUM(v => !v); setMan(''); }}
                className="text-xs px-3 py-1 rounded-full transition-all"
                style={{
                  background: useMan ? accentDim : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${useMan ? accentBorder : C.border}`,
                  color: useMan ? accentColor : '#555',
                }}>
                {useMan ? '⟳ Use Live' : '✎ Manual'}
              </button>
            </div>
            <AnimatePresence>
              {useMan && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-2"
                       style={{ background: C.inputBg, border: `1px solid ${accentBorder}`, borderRadius: 12, padding: '12px 16px' }}>
                    <span className="font-mono font-semibold" style={{ color: '#555' }}>$</span>
                    <input type="text" inputMode="decimal"
                      className="flex-1 bg-transparent outline-none font-mono text-white text-base"
                      placeholder="Enter price per kg" value={manual}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = raw.split('.');
                        setMan(parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : raw);
                      }} />
                    <span className="text-xs font-mono" style={{ color: '#444' }}>USD / kg</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Total Cost card ───────────────────────────────────── */}
          <motion.div
            style={{
              background: result ? 'rgba(232,115,26,0.06)' : C.inputBg,
              border: `1.5px solid ${result ? accentBorder : C.border}`,
              borderRadius: 16,
              padding: '16px 20px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: result ? accentColor : '#444' }}>
              Total Cost — {lengthStr || '1000'} mm
            </p>
            <p className="text-4xl font-bold font-mono leading-none" style={{ color: accentColor }}>
              {result
                ? <AnimNumber val={totalCostLocal} fn={v => fmtCurrency(v, currMeta)} />
                : activeLoading
                  ? <span className="animate-pulse text-2xl" style={{ color: '#333' }}>···</span>
                  : <span style={{ color: '#333' }}>—</span>
              }
            </p>
            {result && currCode !== 'USD' && (
              <p className="text-xs font-mono mt-2" style={{ color: '#555' }}>
                <AnimNumber val={result.costPerMeter * qty} fn={v => fmtUSD(v)} />
              </p>
            )}
          </motion.div>

          {/* ── Calculation Result section ────────────────────────── */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Section header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-semibold" style={{ color: accentColor }}>
                    Calculation Result
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {activeLive?.isFallback ? 'Cached' : 'Live'}
                  </span>
                </div>

                {/* 2 × 2 result grid */}
                <div className="grid grid-cols-2 gap-3">
                  <CalcCard
                    label="Weight"
                    value={weightPerBar >= 10000 ? fmtCompact(weightPerBar) : fmt(weightPerBar, 2)}
                    unit="Kg / Bar"
                    delay={0}
                  />
                  <CalcCard
                    label="Material"
                    value={<AnimNumber val={materialCost} fn={v => fmtCurrency(v, currMeta)} /> as unknown as string}
                    unit={`${metalType === 'copper' ? 'Copper' : 'Aluminum'} Cost`}
                    delay={0.06}
                  />
                  <CalcCard
                    label="Total / Bar"
                    value={<AnimNumber val={fabricationCost} fn={v => fmtCurrency(v, currMeta)} /> as unknown as string}
                    unit="Incl. fabrication"
                    highlight
                    delay={0.12}
                  />
                  <CalcCard
                    label="Current Cap"
                    value={`${currentCap.toLocaleString()}A`}
                    unit="IEC Std."
                    delay={0.18}
                  />
                </div>

                {/* Copy button */}
                <motion.button onClick={handleCopy}
                  whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.975 }}
                  className="w-full mt-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${C.border}`,
                    color: copied ? '#22c55e' : '#555',
                  }}>
                  <AnimatePresence mode="wait">
                    <motion.span key={copied ? 'ok' : 'cp'}
                      initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 3 }}
                      className="flex items-center gap-2">
                      {copied
                        ? <><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Copied to clipboard</>
                        : <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-50"><rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 5v9a1.5 1.5 0 001.5 1.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> Copy Results</>
                      }
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                {calcCount > 1 && (
                  <p className="text-center text-[10px] mt-2 font-mono" style={{ color: '#333' }}>
                    calculation #{calcCount.toLocaleString()}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>{/* /padding */}
      </div>{/* /card */}

      {/* Milestone toast */}
      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap flex items-center gap-2.5 px-5 py-2.5 rounded-2xl"
            style={{
              background: C.card,
              border: `1px solid ${C.orangeBorder}`,
              boxShadow: '0 16px 50px rgba(0,0,0,0.8)',
            }}>
            <span>🎉</span>
            <div>
              <p className="text-white text-xs font-bold leading-none">Milestone!</p>
              <p className="text-[10px] mt-0.5 font-mono" style={{ color: C.orange }}>{milestone}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
