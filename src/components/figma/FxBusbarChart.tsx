'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Metal = 'copper' | 'aluminum';
type ChartRange = '1D' | '7D' | '1M' | '1Y';

interface ChartData {
  timestamps: number[];
  pricesPerKg: number[];
}

interface Props {
  metal: Metal;
  weightKg: number;
  fxRate: number;
  currLabel: string;
  pricePerKgUSD: number;
  busbarPremium: number;
  updatedLabel: string;
}

// SVG viewBox: "0 0 340 185"
const PL = 54;   // left edge of plot area
const PR = 332;  // right edge
const PT = 10;   // top
const PB = 162;  // bottom
const CW = PR - PL;
const CH = PB - PT;

function niceTicks(lo: number, hi: number, n = 4): number[] {
  let span = hi - lo;
  if (span <= 0) { const p = Math.abs(lo) * 0.05 || 1; lo -= p; hi += p; span = hi - lo; }
  const raw  = span / n;
  const mag  = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 2.5, 5, 10].map(v => v * mag).find(v => v >= raw)) ?? mag * 10;
  const start = Math.ceil(lo / step) * step;
  const ticks: number[] = [];
  for (let v = start; ticks.length < n + 2 && v <= hi + step * 0.01; v = parseFloat((v + step).toPrecision(12)))
    if (v >= lo - step * 0.01) ticks.push(v);
  return ticks;
}

function fmtYLabel(v: number): string {
  const a = Math.abs(v);
  if (a >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (a >= 10_000)    return (v / 1_000).toFixed(0) + 'k';
  if (a >= 1_000)     return (v / 1_000).toFixed(1) + 'k';
  if (a >= 100)       return v.toFixed(1);
  return v.toFixed(2);
}

function fmtBig(v: number): string {
  const a = Math.abs(v);
  if (a >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (a >= 1_000)     return v.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v.toFixed(2);
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function fmtTs(ts: number, range: ChartRange): string {
  const d = new Date(ts * 1000);
  switch (range) {
    case '1D': return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    case '7D': return DAYS[d.getDay()];
    case '1M': return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
    case '1Y': return MONTHS[d.getMonth()];
  }
}

// Full date + time label for tooltip
function fmtTooltipDate(ts: number, range: ChartRange): string {
  const d = new Date(ts * 1000);
  const day  = d.getDate().toString().padStart(2,'0');
  const mon  = MONTHS[d.getMonth()];
  const yr   = d.getFullYear();
  const hh   = d.getHours().toString().padStart(2,'0');
  const mm   = d.getMinutes().toString().padStart(2,'0');
  if (range === '1D') return `${hh}:${mm}`;
  if (range === '7D') return `${DAYS[d.getDay()]} ${hh}:${mm}`;
  return `${day} ${mon} ${yr}`;
}

function catmullRomPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function thin<T>(arr: T[], max: number): T[] {
  if (arr.length <= max || max < 2) return arr;
  return Array.from({ length: max }, (_, i) => arr[Math.round(i * (arr.length - 1) / (max - 1))]);
}

export function FxBusbarChart({ metal, weightKg, fxRate, currLabel, pricePerKgUSD, busbarPremium, updatedLabel }: Props) {
  const [range,    setRange]    = useState<ChartRange>('1M');
  const [raw,      setRaw]      = useState<ChartData | null>(null);
  const [busy,     setBusy]     = useState(true);
  const [err,      setErr]      = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let alive = true;
    setBusy(true); setErr(false); setHoverIdx(null);
    fetch(`/api/price-history?metal=${metal}&range=${range}`)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(d  => {
        if (!alive) return;
        // Validate the shape — a 200 with an unexpected body (proxy error
        // page, offline JSON, captive portal) must NEVER crash the render:
        // a throw here unmounts the whole app, not just the chart.
        if (d && Array.isArray(d.timestamps) && Array.isArray(d.pricesPerKg)
              && d.timestamps.length === d.pricesPerKg.length) {
          setRaw(d); setBusy(false);
        } else {
          setErr(true); setBusy(false);
        }
      })
      .catch(() => { if (alive) { setErr(true); setBusy(false); } });
    return () => { alive = false; };
  }, [metal, range]);

  const color = metal === 'copper' ? '#f7941d' : '#6fb3e0';
  const uid   = `bch_${metal}`;

  const chart = useMemo(() => {
    if (!raw || !Array.isArray(raw.timestamps) || !Array.isArray(raw.pricesPerKg)
             || raw.timestamps.length < 3) return null;

    const busbarPrices = raw.pricesPerKg.map(p => p * (1 + busbarPremium) * weightKg * fxRate);
    const maxPts = 60;
    const ts  = thin(raw.timestamps, maxPts);
    const bps = thin(busbarPrices,   maxPts);

    const minP = Math.min(...bps);
    const maxP = Math.max(...bps);
    const pad  = (maxP - minP) * 0.14 || Math.abs(maxP) * 0.06 || 1;
    const yLo  = minP - pad;
    const yHi  = maxP + pad;

    const xOf = (i: number) => PL + (i / (ts.length - 1)) * CW;
    const yOf = (p: number) => PT + CH - ((p - yLo) / (yHi - yLo)) * CH;

    const pts: [number, number][] = bps.map((p, i) => [xOf(i), yOf(p)]);
    const line = catmullRomPath(pts);
    const last = pts[pts.length - 1];
    const area = `${line} L${last[0].toFixed(1)},${PB} L${pts[0][0].toFixed(1)},${PB} Z`;

    const yTicks = niceTicks(yLo, yHi, 4);
    const xTicks = Array.from({ length: 5 }, (_, i) => Math.round(i * (ts.length - 1) / 4));

    const minIdx = bps.indexOf(Math.min(...bps));
    const maxIdx = bps.indexOf(Math.max(...bps));

    const firstP = bps[0];
    const lastP  = bps[bps.length - 1];
    const pctChg = ((lastP - firstP) / firstP) * 100;
    const absChg = lastP - firstP;

    return { pts, line, area, last, yTicks, xTicks, ts, bps, minIdx, maxIdx, firstP, lastP, pctChg, absChg, xOf, yOf };
  }, [raw, weightKg, fxRate, busbarPremium]);

  // Convert a pointer/touch event X (in screen px) to the nearest chart index
  function nearestIdx(clientX: number): number | null {
    if (!chart || !svgRef.current) return null;
    const rect   = svgRef.current.getBoundingClientRect();
    const svgW   = rect.width;
    const svgX   = clientX - rect.left;
    // Map screen X → viewBox X
    const vbX    = (svgX / svgW) * 340;
    // Clamp to plot area
    const plotX  = Math.max(PL, Math.min(PR, vbX));
    const frac   = (plotX - PL) / CW;
    const rawIdx = frac * (chart.pts.length - 1);
    return Math.max(0, Math.min(chart.pts.length - 1, Math.round(rawIdx)));
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const idx = nearestIdx(e.clientX);
    if (idx !== null) setHoverIdx(idx);
  }

  function handleTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const idx = nearestIdx(e.touches[0].clientX);
      if (idx !== null) setHoverIdx(idx);
    }
  }

  function handlePointerLeave() { setHoverIdx(null); }

  const currPrefix   = currLabel === 'USD' ? '$' : `${currLabel} `;
  const currentPrice = pricePerKgUSD * weightKg * fxRate;

  // Header shows hovered point's price, or latest price
  const activeIdx    = hoverIdx ?? (chart ? chart.pts.length - 1 : null);
  const displayPrice = chart && activeIdx !== null ? chart.bps[activeIdx] : currentPrice;
  const displayDate  = chart && activeIdx !== null ? fmtTooltipDate(chart.ts[activeIdx], range) : null;

  // Tooltip bubble positioning
  const tooltipPt = chart && activeIdx !== null ? chart.pts[activeIdx] : null;

  return (
    <div className="fx-card fx-busbar-chart-card">

      {/* ── Header ─────────────────────────── */}
      <div className="fx-card-head">
        <div className="fx-card-head-label">
          <svg className="fx-card-head-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          <span className="fx-card-head-title">
            {metal === 'copper' ? 'Copper' : 'Aluminum'} Price Trend
          </span>
        </div>
        <div className="fx-tab-group">
          {(['1D', '7D', '1M', '1Y'] as const).map(r => (
            <button key={r} type="button" className={`fx-tab${range === r ? ' active' : ''}`} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Price info ─────────────────────── */}
      <div className="fx-busbar-chart-info">
        <div>
          <div className="fx-chart-current-label">
            {hoverIdx !== null && displayDate ? displayDate : 'Busbar Price'}
          </div>
          <div className="fx-chart-current-price" style={{ color }}>
            {currPrefix}{fmtBig(displayPrice)}
          </div>
          {chart && hoverIdx === null && (
            <div className={`fx-chart-change${chart.pctChg >= 0 ? ' up' : ' down'}`}>
              {chart.pctChg >= 0 ? '▲' : '▼'}&nbsp;
              {Math.abs(chart.pctChg).toFixed(2)}%
              &nbsp;({chart.pctChg >= 0 ? '+' : '-'}{fmtBig(Math.abs(chart.absChg))})
            </div>
          )}
        </div>
        <div className="fx-chart-update">Updated: {updatedLabel}</div>
      </div>

      {/* ── Chart area ─────────────────────── */}
      <div className="fx-busbar-chart-wrap">
        {busy && <div className="fx-busbar-chart-loading"><div className="fx-busbar-chart-skeleton" /></div>}
        {err && !busy && <div className="fx-busbar-chart-error">Historical data unavailable</div>}

        {chart && !busy && (
          <svg
            ref={svgRef}
            viewBox="0 0 340 185"
            width="100%" height="100%"
            style={{ display: 'block', touchAction: 'none' }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handlePointerLeave}
          >
            <defs>
              <linearGradient id={`${uid}_fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
                <stop offset="75%"  stopColor={color} stopOpacity="0.05" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
              <filter id={`${uid}_glow`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Grid lines + Y labels */}
            {chart.yTicks.map(tick => {
              const y = chart.yOf(tick);
              if (y < PT - 4 || y > PB + 4) return null;
              return (
                <g key={tick}>
                  <line x1={PL} x2={PR} y1={y} y2={y} stroke="rgba(255,255,255,0.055)" strokeWidth="0.5" strokeDasharray="3,5" />
                  <text x={PL - 5} y={y + 3.5} textAnchor="end" fontSize="8.5" fill="#6b7280" fontFamily="'Roboto Mono','Courier New',monospace">
                    {fmtYLabel(tick)}
                  </text>
                </g>
              );
            })}

            {/* X axis baseline */}
            <line x1={PL} x2={PR} y1={PB} y2={PB} stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />

            {/* X labels */}
            {chart.xTicks.map(idx => (
              <text key={idx} x={chart.xOf(idx)} y={PB + 14} textAnchor="middle" fontSize="8.5" fill="#6b7280">
                {fmtTs(chart.ts[idx], range)}
              </text>
            ))}

            {/* Gradient fill */}
            <path d={chart.area} fill={`url(#${uid}_fill)`} />

            {/* Curve */}
            <path d={chart.line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Min marker */}
            {chart.minIdx !== chart.maxIdx && (() => {
              const [mx, my] = chart.pts[chart.minIdx];
              const labelY = my + 14 <= PB + 2 ? my + 13 : my - 6;
              return (
                <g>
                  <circle cx={mx} cy={my} r="2.5" fill="#111827" stroke={color} strokeWidth="1.2" />
                  <text x={mx} y={labelY} textAnchor="middle" fontSize="8" fill="#9ca3af">{fmtYLabel(chart.bps[chart.minIdx])}</text>
                </g>
              );
            })()}

            {/* Max marker */}
            {(() => {
              const [mx, my] = chart.pts[chart.maxIdx];
              const labelY = my - 8 >= PT ? my - 7 : my + 14;
              return (
                <g>
                  <circle cx={mx} cy={my} r="2.5" fill="#111827" stroke={color} strokeWidth="1.2" />
                  <text x={mx} y={labelY} textAnchor="middle" fontSize="8" fill="#9ca3af">{fmtYLabel(chart.bps[chart.maxIdx])}</text>
                </g>
              );
            })()}

            {/* Current price dot (shown only when not hovering) */}
            {hoverIdx === null && (() => {
              const [lx, ly] = chart.last;
              return (
                <g>
                  <circle cx={lx} cy={ly} r="8" fill={color} opacity="0.15" filter={`url(#${uid}_glow)`} />
                  <circle cx={lx} cy={ly} r="3.5" fill={color} />
                  <circle cx={lx} cy={ly} r="1.5" fill="white" />
                </g>
              );
            })()}

            {/* ── Interactive crosshair + tooltip ── */}
            {hoverIdx !== null && tooltipPt && (() => {
              const [hx, hy] = tooltipPt;
              const priceStr = `${currPrefix}${fmtBig(chart.bps[hoverIdx])}`;
              const dateStr  = fmtTooltipDate(chart.ts[hoverIdx], range);

              // Tooltip bubble size
              const tW = 80;
              const tH = 28;
              // Clamp bubble X so it stays inside the SVG
              const tX = Math.max(2, Math.min(340 - tW - 2, hx - tW / 2));
              // Show above or below the dot
              const tY = hy - tH - 10 >= PT ? hy - tH - 10 : hy + 14;

              return (
                <g>
                  {/* Vertical crosshair */}
                  <line x1={hx} y1={PT} x2={hx} y2={PB} stroke={color} strokeWidth="0.8" strokeDasharray="3,3" opacity="0.7" />

                  {/* Dot on curve */}
                  <circle cx={hx} cy={hy} r="4" fill={color} />
                  <circle cx={hx} cy={hy} r="2" fill="white" />

                  {/* Tooltip bubble */}
                  <rect x={tX} y={tY} width={tW} height={tH} rx="5" ry="5" fill="#1c1f2b" stroke={color} strokeWidth="0.8" opacity="0.97" />
                  <text x={tX + tW / 2} y={tY + 10} textAnchor="middle" fontSize="8.5" fill={color} fontWeight="600" fontFamily="'Inter',system-ui,sans-serif">
                    {priceStr}
                  </text>
                  <text x={tX + tW / 2} y={tY + 22} textAnchor="middle" fontSize="7.5" fill="rgba(245,247,250,0.6)" fontFamily="'Inter',system-ui,sans-serif">
                    {dateStr}
                  </text>
                </g>
              );
            })()}

            {/* Invisible wide hit-area overlay for easy touch targeting */}
            <rect x={PL} y={PT} width={CW} height={CH + 20} fill="transparent" style={{ cursor: 'crosshair' }} />
          </svg>
        )}
      </div>
    </div>
  );
}
