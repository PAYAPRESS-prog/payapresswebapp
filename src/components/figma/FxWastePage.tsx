'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MATERIAL_GRADES, DEFAULT_GRADE } from '@/lib/copperData';
import { ALUMINUM_GRADES, DEFAULT_ALUMINUM_GRADE } from '@/lib/aluminumData';
import { ArrowLeftIcon, ShareIcon } from './FxIcons';

interface Props {
  copperPricePerKg: number | null;
  aluminumPricePerKg: number | null;
}

type Metal = 'copper' | 'aluminum';

function fmtW(n: number): string {
  if (n === 0) return '0';
  if (n < 0.0001) return n.toExponential(2);
  if (n < 0.01) return n.toFixed(5);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function FxWastePage({ copperPricePerKg, aluminumPricePerKg }: Props) {
  const router = useRouter();

  const [metal, setMetal]     = useState<Metal>('copper');
  const [gradeIdx, setGradeIdx] = useState(0);
  const [wVal, setWVal]       = useState('');
  const [tVal, setTVal]       = useState('');
  const [bladeDia, setBladeDia] = useState('');
  const [punchDia, setPunchDia] = useState('');

  const grades        = metal === 'copper' ? MATERIAL_GRADES : ALUMINUM_GRADES;
  const grade         = grades[gradeIdx] ?? (metal === 'copper' ? DEFAULT_GRADE : DEFAULT_ALUMINUM_GRADE);
  const spotPrice     = metal === 'copper' ? copperPricePerKg : aluminumPricePerKg;
  const pricePerKgUSD = spotPrice ? spotPrice * (1 + grade.busbarPremium) : null;
  const metalColor    = metal === 'copper' ? '#e8731a' : '#6fb3e0';

  const w  = parseFloat(wVal);
  const t  = parseFloat(tVal);
  const bd = parseFloat(bladeDia);
  const pd = parseFloat(punchDia);

  const hasSection = !isNaN(w) && w > 0 && !isNaN(t) && t > 0;
  const price      = pricePerKgUSD ?? 0;

  // ── Blade kerf ────────────────────────────────────────────────
  // kerf ≈ 1.5% of blade diameter (typical cold-saw; min 0.5mm)
  const kerfMm   = hasSection && !isNaN(bd) && bd > 0 ? Math.max(0.5, bd * 0.015) : 0;
  const kerfVol  = kerfMm * w * t;                  // mm³ per cut
  const kerfKg   = kerfVol * grade.density / 1_000_000;
  const kerfCost = kerfKg * price;

  // ── Punch-out ─────────────────────────────────────────────────
  const punchArea = hasSection && !isNaN(pd) && pd > 0 ? Math.PI * (pd / 2) ** 2 : 0; // mm²
  const punchVol  = punchArea * t;                  // mm³ per punch
  const punchKg   = punchVol * grade.density / 1_000_000;
  const punchCost = punchKg * price;

  function handleShare() {
    const metalName = metal === 'copper' ? 'Copper' : 'Aluminum';
    const section   = hasSection ? `${w}×${t} mm` : '—';
    const parts: string[] = [
      `✂️ ${metalName} Busbar Waste — ${grade.label}`,
      `📐 Cross-section: ${section}`,
    ];
    if (bd > 0 && kerfKg > 0) {
      parts.push(`Blade Ø${bd} mm → kerf ${kerfMm.toFixed(1)} mm`);
      parts.push(`  Waste/cut: ${fmtW(kerfKg)} kg · $${fmtW(kerfCost)} USD`);
    }
    if (pd > 0 && punchKg > 0) {
      parts.push(`Punch Ø${pd} mm → area ${(punchArea / 100).toFixed(2)} cm²`);
      parts.push(`  Waste/punch: ${fmtW(punchKg)} kg · $${fmtW(punchCost)} USD`);
    }
    parts.push('', 'Calculated with PAYAPRESS Waste Calculator');
    const appUrl = 'https://calculator.payapress.com';
    const txt = parts.join('\n');
    if (navigator.share) {
      navigator.share({ title: 'Busbar Waste Calculation', text: txt, url: appUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${txt}\n${appUrl}`).catch(() => {});
    }
  }

  const hasAnyResult = (bd > 0 && kerfKg > 0) || (pd > 0 && punchKg > 0);

  return (
    <div className="fx-waste-page-root">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="fx-waste-page-header">
        <button type="button" className="fx-waste-page-back" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeftIcon width={20} height={20} />
          <span>Go back</span>
        </button>
        <h1 className="fx-waste-page-heading">Waste Calculator</h1>
        <div className="fx-waste-page-header-end" />
      </header>

      <div className="fx-waste-page-scroll">

        {/* ── Metal toggle ────────────────────────────────── */}
        <div className="fx-metal-toggle" role="group" aria-label="Select metal">
          <button
            type="button"
            className={`fx-metal-btn${metal === 'copper' ? ' active' : ''}`}
            onClick={() => { setMetal('copper'); setGradeIdx(0); }}
          >Copper</button>
          <button
            type="button"
            className={`fx-metal-btn al${metal === 'aluminum' ? ' active' : ''}`}
            onClick={() => { setMetal('aluminum'); setGradeIdx(0); }}
          >Aluminum</button>
        </div>

        {/* ── Grade pills ─────────────────────────────────── */}
        <div className={`fx-grade-pills${metal === 'aluminum' ? ' al' : ''}`}>
          {grades.map((g, i) => (
            <button
              key={g.id}
              type="button"
              className={`fx-grade-pill${gradeIdx === i ? ' active' : ''}`}
              onClick={() => setGradeIdx(i)}
            >
              <span className="fx-grade-pill-label">{g.label}</span>
              <span className="fx-grade-pill-purity">{(g.purity * 100).toFixed(2)}%</span>
            </button>
          ))}
        </div>

        {/* ── Busbar cross-section ─────────────────────────── */}
        <div className="fx-waste-page-card">
          <div className="fx-waste-section-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="8" width="16" height="8" rx="2" stroke={metalColor} strokeWidth="1.8"/>
              <path d="M8 8V6M16 8V6" stroke="rgba(245,247,250,0.5)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Busbar Cross-Section
          </div>
          <div className="fx-waste-page-dims">
            <div className="fx-waste-page-dim-col">
              <span className="fx-waste-page-dim-lbl">Width (W)</span>
              <div className="fx-waste-input-wrap">
                <input
                  type="text"
                  inputMode="decimal"
                  className="fx-waste-input"
                  value={wVal}
                  placeholder="50"
                  onChange={e => setWVal(e.target.value.replace(/[^0-9.]/g, ''))}
                />
                <span className="fx-waste-unit">mm</span>
              </div>
            </div>
            <div className="fx-waste-page-dim-col">
              <span className="fx-waste-page-dim-lbl">Thickness (T)</span>
              <div className="fx-waste-input-wrap">
                <input
                  type="text"
                  inputMode="decimal"
                  className="fx-waste-input"
                  value={tVal}
                  placeholder="6"
                  onChange={e => setTVal(e.target.value.replace(/[^0-9.]/g, ''))}
                />
                <span className="fx-waste-unit">mm</span>
              </div>
            </div>
          </div>
          {hasSection && (
            <p className="fx-waste-page-dim-info" style={{ color: metalColor }}>
              {metal === 'copper' ? 'Copper' : 'Aluminum'} · {grade.label} · ρ = {grade.density} g/cm³
            </p>
          )}
        </div>

        {/* ── Blade Kerf ───────────────────────────────────── */}
        <div className="fx-waste-page-card">
          <div className="fx-waste-section-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="rgba(245,247,250,0.4)" strokeWidth="1.8"/>
              <path d="M12 3 A9 9 0 0 1 21 12" stroke={metalColor} strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="rgba(245,247,250,0.55)" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="12" y1="8" x2="12" y2="16" stroke="rgba(245,247,250,0.55)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Blade Kerf Waste
          </div>
          <div className="fx-waste-input-row">
            <label className="fx-waste-input-label">Blade diameter</label>
            <div className="fx-waste-input-wrap">
              <input
                type="text"
                inputMode="decimal"
                className="fx-waste-input"
                value={bladeDia}
                placeholder="200"
                onChange={e => setBladeDia(e.target.value.replace(/[^0-9.]/g, ''))}
              />
              <span className="fx-waste-unit">mm</span>
            </div>
          </div>
          {bd > 0 && hasSection && (
            <div className="fx-waste-results">
              <div className="fx-waste-result-row">
                <span className="fx-waste-result-label">Est. kerf width</span>
                <span className="fx-waste-result-val">
                  {kerfMm.toFixed(1)}<span className="fx-waste-result-unit"> mm</span>
                </span>
              </div>
              <div className="fx-waste-result-row">
                <span className="fx-waste-result-label">Waste per cut</span>
                <span className="fx-waste-result-val">
                  {fmtW(kerfKg)}<span className="fx-waste-result-unit"> kg</span>
                </span>
              </div>
              <div className="fx-waste-result-row fx-waste-result-highlight">
                <span className="fx-waste-result-label">Waste cost / cut</span>
                <span className="fx-waste-result-val" style={{ color: metalColor }}>
                  {fmtW(kerfCost)}<span className="fx-waste-result-unit"> USD</span>
                </span>
              </div>
            </div>
          )}
          {bd > 0 && !hasSection && (
            <p className="fx-waste-page-hint">Enter busbar width and thickness above first</p>
          )}
        </div>

        {/* ── Punch-out ────────────────────────────────────── */}
        <div className="fx-waste-page-card">
          <div className="fx-waste-section-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="rgba(245,247,250,0.4)" strokeWidth="1.8"/>
              <circle cx="12" cy="12" r="4" stroke={metalColor} strokeWidth="1.8"/>
            </svg>
            Punch-out Waste
          </div>
          <div className="fx-waste-input-row">
            <label className="fx-waste-input-label">Punch diameter</label>
            <div className="fx-waste-input-wrap">
              <input
                type="text"
                inputMode="decimal"
                className="fx-waste-input"
                value={punchDia}
                placeholder="14"
                onChange={e => setPunchDia(e.target.value.replace(/[^0-9.]/g, ''))}
              />
              <span className="fx-waste-unit">mm</span>
            </div>
          </div>
          {pd > 0 && hasSection && (
            <div className="fx-waste-results">
              <div className="fx-waste-result-row">
                <span className="fx-waste-result-label">Punch area</span>
                <span className="fx-waste-result-val">
                  {(punchArea / 100).toFixed(2)}<span className="fx-waste-result-unit"> cm²</span>
                </span>
              </div>
              <div className="fx-waste-result-row">
                <span className="fx-waste-result-label">Waste per punch</span>
                <span className="fx-waste-result-val">
                  {fmtW(punchKg)}<span className="fx-waste-result-unit"> kg</span>
                </span>
              </div>
              <div className="fx-waste-result-row fx-waste-result-highlight">
                <span className="fx-waste-result-label">Waste cost / punch</span>
                <span className="fx-waste-result-val" style={{ color: metalColor }}>
                  {fmtW(punchCost)}<span className="fx-waste-result-unit"> USD</span>
                </span>
              </div>
            </div>
          )}
          {pd > 0 && !hasSection && (
            <p className="fx-waste-page-hint">Enter busbar width and thickness above first</p>
          )}
        </div>

        {/* ── Formula note ─────────────────────────────────── */}
        <div className="fx-waste-page-note">
          <strong>Formula:</strong> Waste kg = Volume (mm³) × ρ (g/cm³) ÷ 1,000,000
          <br/>Kerf: <em>kerf_width × W × T</em> &nbsp;|&nbsp; Punch: <em>π × (d/2)² × T</em>
          <br/>Both methods use the same density and price — equal volumes give equal cost.
        </div>

        {/* ── Share ────────────────────────────────────────── */}
        {hasAnyResult && pricePerKgUSD && (
          <button
            type="button"
            className="fx-results-share-btn"
            style={{ marginTop: 4 }}
            onClick={handleShare}
          >
            <ShareIcon width={18} height={18} />
            Share result
          </button>
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
