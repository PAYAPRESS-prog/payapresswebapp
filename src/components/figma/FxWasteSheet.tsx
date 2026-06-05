'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  metal: 'copper' | 'aluminum';
  w: number;
  t: number;
  L: number;
  pricePerKgUSD: number;
  fxRate: number;
  currLabel: string;
  density: number;
}

function fmtWaste(n: number): string {
  if (n === 0) return '0';
  if (n < 0.0001) return n.toExponential(2);
  if (n < 0.01) return n.toFixed(5);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function FxWasteSheet({
  open, onClose, metal, w, t, L, pricePerKgUSD, fxRate, currLabel, density,
}: Props) {
  const [bladeDia, setBladeDia] = useState('');
  const [punchDia, setPunchDia] = useState('');
  const [leaving,  setLeaving]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      onClose();
    }, 320);
  }, [onClose]);

  // Reset inputs when opened
  useEffect(() => {
    if (open) { setBladeDia(''); setPunchDia(''); }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!mounted || (!open && !leaving)) return null;

  const metalColor = metal === 'copper' ? '#e8731a' : '#6fb3e0';
  const totalKg    = w * t * L * density / 1_000_000;

  // Blade kerf calculation
  // Standard circular saw blades: kerf ≈ 1.5% of blade diameter
  const bd       = parseFloat(bladeDia);
  const kerfMm   = (!isNaN(bd) && bd > 0) ? Math.max(0.5, bd * 0.015) : 0;
  const kerfVol  = kerfMm * w * t;          // mm³ per cut
  const kerfKg   = kerfVol * density / 1_000_000;
  const kerfCost = kerfKg * pricePerKgUSD * fxRate;

  // Punch-out calculation
  const pd         = parseFloat(punchDia);
  const punchArea  = (!isNaN(pd) && pd > 0) ? Math.PI * (pd / 2) ** 2 : 0; // mm²
  const punchVol   = punchArea * t;         // mm³ per punch
  const punchKg    = punchVol * density / 1_000_000;
  const punchCost  = punchKg * pricePerKgUSD * fxRate;

  return createPortal(
    <div className={`fx-waste-portal${leaving ? ' is-leaving' : ''}`}>
      <div className="fx-waste-overlay" onClick={close} />
      <div className="fx-waste-sheet" role="dialog" aria-modal="true" aria-label="محاسبه ضایعات">
        <div className="fx-waste-handle" />
        <button type="button" className="fx-waste-close" onClick={close} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="fx-waste-body">
          {/* Header */}
          <div className="fx-waste-header">
            <h2 className="fx-waste-title">محاسبه ضایعات</h2>
            <p className="fx-waste-meta">
              <span style={{ color: metalColor }}>{metal === 'copper' ? 'Copper' : 'Aluminum'}</span>
              {' · '}{L}×{w}×{t} mm · {totalKg.toFixed(3)} kg
            </p>
          </div>

          {/* ── Blade kerf section ─────────────────────── */}
          <div className="fx-waste-section">
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

            {bd > 0 && (
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
                    {fmtWaste(kerfKg)}<span className="fx-waste-result-unit"> kg</span>
                  </span>
                </div>
                <div className="fx-waste-result-row fx-waste-result-highlight">
                  <span className="fx-waste-result-label">Waste cost / cut</span>
                  <span className="fx-waste-result-val" style={{ color: metalColor }}>
                    {fmtWaste(kerfCost)}<span className="fx-waste-result-unit"> {currLabel}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Punch-out section ──────────────────────── */}
          <div className="fx-waste-section">
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

            {pd > 0 && (
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
                    {fmtWaste(punchKg)}<span className="fx-waste-result-unit"> kg</span>
                  </span>
                </div>
                <div className="fx-waste-result-row fx-waste-result-highlight">
                  <span className="fx-waste-result-label">Waste cost / punch</span>
                  <span className="fx-waste-result-val" style={{ color: metalColor }}>
                    {fmtWaste(punchCost)}<span className="fx-waste-result-unit"> {currLabel}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
