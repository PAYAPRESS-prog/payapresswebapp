'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FxHeader } from './FxHeader';
import { FxBottomNav } from './FxBottomNav';

interface HistoryItem {
  id: number;
  name?: string;
  metal: 'copper' | 'aluminum';
  width: number;
  thickness: number;
  length: number;
  price?: number | string | null;
  currency?: string | null;
  created_at: string;
}

const DENSITY = { copper: 8.96, aluminum: 2.70 };
const CURRENT_DENSITY = { copper: 2.5, aluminum: 1.5 };

function calcWeight(item: HistoryItem): number {
  return (item.width * item.thickness * item.length * DENSITY[item.metal]) / 1_000_000;
}

function relTime(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60)      return 'just now';
  if (sec < 3600)    return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86_400)  return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86_400)}d ago`;
}

function fmt(n: number, d = 2) {
  return n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Compact price for very large totals (e.g. IRR in billions)
function fmtPrice(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (a >= 1_000_000)     return (n / 1_000_000).toFixed(2) + 'M';
  return fmt(n);
}

export function FxHistoryPage({
  copperPrice,
  aluminumPrice,
}: {
  copperPrice: number | null;
  aluminumPrice: number | null;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // Mirror of items for use inside pointer handlers (avoids stale closures)
  const itemsRef = useRef<HistoryItem[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // DOM node refs per card, for hit-testing during drag
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    fetch('/api/history')
      .then(r => {
        if (r.status === 401) throw new Error('not_logged_in');
        return r.json();
      })
      .then(data => { setItems(data); setLoading(false); })
      .catch(err => {
        setError(err.message === 'not_logged_in' ? 'not_logged_in' : 'error');
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: number) {
    setDeleting(id);
    await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setItems(prev => prev.filter(i => i.id !== id));
    setDeleting(null);
  }

  // ── Drag-to-reorder (pointer based, works on touch + mouse) ──
  function startDrag(e: React.PointerEvent, id: number) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  }

  function onDragMove(e: React.PointerEvent) {
    if (draggingId == null) return;
    const y = e.clientY;
    setItems(prev => {
      const fromIdx = prev.findIndex(i => i.id === draggingId);
      if (fromIdx === -1) return prev;
      let target = prev.length - 1;
      for (let idx = 0; idx < prev.length; idx++) {
        const el = cardRefs.current.get(prev[idx].id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (y < r.top + r.height / 2) { target = idx; break; }
      }
      if (target === fromIdx) return prev;
      const next = prev.slice();
      const [moved] = next.splice(fromIdx, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  function endDrag(e: React.PointerEvent) {
    if (draggingId == null) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    setDraggingId(null);
    const order = itemsRef.current.map(i => i.id);
    fetch('/api/history', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    }).catch(() => { /* best-effort; order is already applied locally */ });
  }

  function getLivePrice(item: HistoryItem): number {
    const pricePerKg = item.metal === 'copper'
      ? (copperPrice ?? 0)
      : (aluminumPrice ?? 0);
    return calcWeight(item) * pricePerKg;
  }

  function savedPriceLabel(item: HistoryItem): string {
    const p = item.price != null ? Number(item.price) : NaN;
    if (!Number.isNaN(p) && p > 0) {
      return `${fmtPrice(p)} ${item.currency ?? ''}`.trim();
    }
    const live = getLivePrice(item);
    return live > 0 ? `$${fmt(live)}` : '—';
  }

  return (
    <div className="fx-app">
      <FxHeader />
      <main style={{ paddingBottom: 100 }}>
        <div className="fx-content">
          <div className="fx-history-header">
            <h2 className="fx-history-title">History</h2>
            {items.length > 0 && (
              <span className="fx-history-count">{items.length} saved</span>
            )}
          </div>

          {loading && (
            <div className="fx-history-empty">Loading…</div>
          )}

          {!loading && error === 'not_logged_in' && (
            <div className="fx-history-empty">
              <p>Sign in to view your saved calculations.</p>
              <Link href="/signup" className="fx-history-signin-btn">Sign In</Link>
            </div>
          )}

          {!loading && error === 'error' && (
            <div className="fx-history-empty">Failed to load history.</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="fx-history-empty">
              <p>No saved calculations yet.</p>
              <p style={{ marginTop: 6, fontSize: 13, color: 'var(--fx-text-3)' }}>
                Use the calculator and bookmark results to save them here.
              </p>
              <Link href="/busbar-calculator" className="fx-history-signin-btn" style={{ marginTop: 16 }}>
                Go to Calculator
              </Link>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <p className="fx-history-hint">Drag <span className="fx-history-hint-grip">⠿</span> to reorder · tap a card for details</p>
          )}

          {!loading && !error && items.map(item => {
            const livePrice = getLivePrice(item);
            const weight = calcWeight(item);
            const isCu = item.metal === 'copper';
            const isOpen = expandedId === item.id;
            const isDragging = draggingId === item.id;
            const ratedCurrent = Math.round(item.width * item.thickness * CURRENT_DENSITY[item.metal]);

            return (
              <div
                key={item.id}
                ref={el => { if (el) cardRefs.current.set(item.id, el); else cardRefs.current.delete(item.id); }}
                className={`fx-history-card${isOpen ? ' open' : ''}${isDragging ? ' dragging' : ''}`}
              >
                {/* ── Preview row: grip · name+price · chevron ── */}
                <div
                  className="fx-history-preview"
                  onClick={() => setExpandedId(prev => (prev === item.id ? null : item.id))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(prev => (prev === item.id ? null : item.id)); } }}
                  aria-expanded={isOpen}
                >
                  <button
                    type="button"
                    className="fx-history-grip"
                    aria-label="Drag to reorder"
                    onClick={e => e.stopPropagation()}
                    onPointerDown={e => startDrag(e, item.id)}
                    onPointerMove={onDragMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  >
                    ⠿
                  </button>

                  <div className="fx-history-preview-main">
                    <span className="fx-history-name">{item.name || 'Untitled'}</span>
                    <span className="fx-history-preview-sub">
                      <span className={`fx-history-metal-badge ${isCu ? 'copper' : 'aluminum'}`}>
                        {isCu ? 'Copper' : 'Aluminum'}
                      </span>
                      <span className="fx-history-time">{relTime(item.created_at)}</span>
                    </span>
                  </div>

                  <div className="fx-history-preview-price">
                    <span className={`fx-history-price-value ${isCu ? 'cu' : 'al'}`}>{savedPriceLabel(item)}</span>
                  </div>

                  <span className={`fx-history-chevron${isOpen ? ' open' : ''}`} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </span>
                </div>

                {/* ── Expanded details ── */}
                {isOpen && (
                  <div className="fx-history-details">
                    <div className="fx-history-dims">
                      {item.length} × {item.width} × {item.thickness} mm
                    </div>

                    <div className="fx-history-stats">
                      <div className="fx-history-stat">
                        <div className="fx-history-stat-label">WEIGHT</div>
                        <div className="fx-history-stat-value">{fmt(weight)} kg</div>
                      </div>
                      <div className="fx-history-stat-divider" />
                      <div className="fx-history-stat">
                        <div className="fx-history-stat-label">LIVE PRICE</div>
                        <div className={`fx-history-stat-value live ${isCu ? 'cu' : 'al'}`}>
                          {livePrice > 0 ? `$${fmt(livePrice)}` : '—'}
                        </div>
                      </div>
                      <div className="fx-history-stat-divider" />
                      <div className="fx-history-stat">
                        <div className="fx-history-stat-label">AREA</div>
                        <div className="fx-history-stat-value">{(item.width * item.thickness).toLocaleString()} mm²</div>
                      </div>
                      <div className="fx-history-stat-divider" />
                      <div className="fx-history-stat">
                        <div className="fx-history-stat-label">CURRENT</div>
                        <div className="fx-history-stat-value">{ratedCurrent.toLocaleString()} A</div>
                      </div>
                    </div>

                    <div className="fx-history-details-foot">
                      <span className="fx-history-saved-at">Saved {relTime(item.created_at)}</span>
                      <button
                        type="button"
                        className="fx-history-delete-btn"
                        onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                        disabled={deleting === item.id}
                        aria-label="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <FxBottomNav active="history" />
    </div>
  );
}
