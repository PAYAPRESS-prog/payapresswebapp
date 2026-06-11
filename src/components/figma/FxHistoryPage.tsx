'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FxHeader } from './FxHeader';
import { FxBottomNav } from './FxBottomNav';
import { BusbarMock } from './FxIcons';
import { FLAGS } from './FxFlags';

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

function calcWeight(item: HistoryItem) {
  return (item.width * item.thickness * item.length * DENSITY[item.metal]) / 1_000_000;
}
function relTime(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60)     return 'just now';
  if (sec < 3600)   return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86_400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86_400)}d ago`;
}
function fmt(n: number, d = 2) {
  return n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function fmtPrice(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (a >= 1_000_000)     return (n / 1_000_000).toFixed(2) + 'M';
  return fmt(n);
}

// ── Spring easing for FLIP neighbor animation ──
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const SPRING_MS = 300;

export function FxHistoryPage({
  copperPrice,
  aluminumPrice,
  embedded,
}: {
  copperPrice: number | null;
  aluminumPrice: number | null;
  embedded?: boolean;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // ── Stable refs shared across pointer event handlers ──
  const itemsRef     = useRef<HistoryItem[]>([]);
  const draggingRef  = useRef<number | null>(null);   // id of card being dragged
  const dragOffset   = useRef(0);                      // pointer Y − card layoutTop at drag start
  const latestPtrY   = useRef(0);                      // latest pointer clientY
  const cardRefs     = useRef<Map<number, HTMLElement>>(new Map());

  // ── FLIP state ──
  const preFlipY  = useRef<Map<number, number>>(new Map());
  const needsFlip = useRef(false);

  useEffect(() => { itemsRef.current = items; }, [items]);

  // ── FLIP + dragged-card re-sync after every React render ──
  useLayoutEffect(() => {
    if (!needsFlip.current) return;
    needsFlip.current = false;
    const dragging = draggingRef.current;

    // 1. Re-sync the dragging card to follow the pointer
    if (dragging != null) {
      const el = cardRefs.current.get(dragging);
      if (el) {
        // Temporarily strip the transform to get the card's layout position
        el.style.transition = 'none';
        el.style.transform = 'none';
        const layoutTop = el.getBoundingClientRect().top;
        const dy = latestPtrY.current - dragOffset.current - layoutTop;
        el.style.transform = `translateY(${dy}px) scale(1.05) rotate(1.8deg)`;
      }
    }

    // 2. FLIP-animate every other card from its old position to the new one
    for (const [id, el] of cardRefs.current) {
      if (id === dragging) continue;
      const before = preFlipY.current.get(id);
      if (before == null) continue;
      const after = el.getBoundingClientRect().top;
      const delta = before - after;
      if (Math.abs(delta) < 1) continue;

      // Invert: jump to old position instantly
      el.style.transition = 'none';
      el.style.transform = `translateY(${delta}px)`;
      void el.getBoundingClientRect(); // force reflow so browser sees the initial state

      // Play: spring to natural position
      el.style.transition = `transform ${SPRING_MS}ms ${SPRING}`;
      el.style.transform = '';
    }
    preFlipY.current.clear();
  });

  useEffect(() => {
    fetch('/api/history')
      .then(r => {
        if (r.status === 401) throw new Error('not_logged_in');
        if (!r.ok) throw new Error('error');
        return r.json();
      })
      .then(data => {
        // Guard: a non-array body (offline JSON, proxy error page) would
        // crash items.map() and take the page down with it.
        if (!Array.isArray(data)) throw new Error('error');
        setItems(data); setLoading(false);
      })
      .catch(err => {
        setError(err.message === 'not_logged_in' ? 'not_logged_in' : 'error');
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      // Only remove locally when the server actually deleted it —
      // otherwise the row reappears on next load and the user is confused.
      if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
    } catch { /* network error — keep the row */ } finally {
      setDeleting(null);
    }
  }

  // ── Pointer drag handlers ──────────────────────────────────────

  function startDrag(e: React.PointerEvent, id: number) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const el = cardRefs.current.get(id);
    if (el) {
      // Record pointer offset from card's layout top
      el.style.transition = 'none';
      el.style.transform = 'none';
      const layoutTop = el.getBoundingClientRect().top;
      dragOffset.current = e.clientY - layoutTop;
      latestPtrY.current = e.clientY;
      // Immediately lift the card
      const dy = e.clientY - dragOffset.current - layoutTop;
      el.style.transform = `translateY(${dy}px) scale(1.05) rotate(1.8deg)`;
    }

    draggingRef.current = id;
    setDraggingId(id);
    setExpandedId(null); // close any open card when drag begins
  }

  function onDragMove(e: React.PointerEvent) {
    const dragging = draggingRef.current;
    if (dragging == null) return;
    latestPtrY.current = e.clientY;

    // ── A: track dragging card directly — no React render needed ──
    const dragEl = cardRefs.current.get(dragging);
    if (dragEl) {
      // Strip transform briefly to read layout position
      dragEl.style.transition = 'none';
      dragEl.style.transform = 'none';
      const layoutTop = dragEl.getBoundingClientRect().top;
      const dy = e.clientY - dragOffset.current - layoutTop;
      dragEl.style.transform = `translateY(${dy}px) scale(1.05) rotate(1.8deg)`;
    }

    // ── B: check if the card crossed into a new slot ──
    const current = itemsRef.current;
    const fromIdx = current.findIndex(i => i.id === dragging);
    if (fromIdx === -1) return;

    // Count how many *other* cards have their midpoint above the pointer.
    // The dragging card is excluded — its lifted transform would otherwise
    // pollute the measurement and block downward reordering.
    let target = 0;
    for (let idx = 0; idx < current.length; idx++) {
      if (current[idx].id === dragging) continue;
      const el = cardRefs.current.get(current[idx].id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top + r.height / 2 < latestPtrY.current) target++;
    }
    // `target` is the insertion index within the list minus the dragging card.
    // When it equals fromIdx the order is unchanged.
    if (target === fromIdx) return;

    // Slot changed → capture FLIP positions then reorder via React
    preFlipY.current = new Map();
    for (const [id, el] of cardRefs.current) {
      if (id === dragging) continue;
      preFlipY.current.set(id, el.getBoundingClientRect().top);
    }
    needsFlip.current = true;

    const next = current.filter(i => i.id !== dragging);
    next.splice(target, 0, current[fromIdx]);
    setItems(next);
  }

  function endDrag(e: React.PointerEvent) {
    const dragging = draggingRef.current;
    if (dragging == null) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }

    // Spring the card back to its natural position
    const el = cardRefs.current.get(dragging);
    if (el) {
      el.style.transition = `transform ${SPRING_MS}ms ${SPRING}, box-shadow 0.25s ease`;
      el.style.transform = '';
    }

    draggingRef.current = null;
    setDraggingId(null);

    // Persist order
    const order = itemsRef.current.map(i => i.id);
    fetch('/api/history', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    }).catch(() => {});
  }

  function getLivePrice(item: HistoryItem): number {
    const pricePerKg = item.metal === 'copper' ? (copperPrice ?? 0) : (aluminumPrice ?? 0);
    return calcWeight(item) * pricePerKg;
  }

  function savedPriceLabel(item: HistoryItem): string {
    const p = item.price != null ? Number(item.price) : NaN;
    if (!Number.isNaN(p) && p > 0) return `${fmtPrice(p)} ${item.currency ?? ''}`.trim();
    const live = getLivePrice(item);
    return live > 0 ? `$${fmt(live)}` : '—';
  }

  return (
    <div className={embedded ? 'fx-embed-wrap' : 'fx-app'}>
      {!embedded && <FxHeader />}
      <main>
        <div className="fx-content fx-content-single">
          <div className="fx-history-header">
            <h2 className="fx-history-title">History</h2>
            {items.length > 0 && (
              <span className="fx-history-count">{items.length} saved</span>
            )}
          </div>

          {loading && <div className="fx-history-empty">Loading…</div>}

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
              <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--fx-text-3)' }}>
                Use the calculator and bookmark results to save them here.
              </p>
              <Link href="/busbar-calculator" className="fx-history-signin-btn" style={{ marginTop: 16 }}>
                Go to Calculator
              </Link>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <p className="fx-history-hint">
              Hold <span className="fx-history-hint-grip">⠿</span> and drag to reorder
            </p>
          )}

          {/* ── Card list ── */}
          <div className={`fx-history-list${draggingId != null ? ' drag-active' : ''}`}>
            {!loading && !error && items.map(item => {
              const livePrice   = getLivePrice(item);
              const weight      = calcWeight(item);
              const isCu        = item.metal === 'copper';
              const isOpen      = expandedId === item.id;
              const isDragging  = draggingId === item.id;
              const ratedCurrent = Math.round(item.width * item.thickness * CURRENT_DENSITY[item.metal]);

              return (
                <div
                  key={item.id}
                  ref={el => { if (el) cardRefs.current.set(item.id, el); else cardRefs.current.delete(item.id); }}
                  className={`fx-history-card${isOpen ? ' open' : ''}${isDragging ? ' dragging' : ''}`}
                >
                  {/* ── Preview row ── */}
                  <div
                    className="fx-history-preview"
                    onClick={() => !isDragging && setExpandedId(prev => (prev === item.id ? null : item.id))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedId(prev => (prev === item.id ? null : item.id));
                      }
                    }}
                    aria-expanded={isOpen}
                  >
                    {/* Drag grip */}
                    <button
                      type="button"
                      className="fx-history-grip"
                      aria-label="Hold to drag and reorder"
                      onClick={e => e.stopPropagation()}
                      onPointerDown={e => startDrag(e, item.id)}
                      onPointerMove={onDragMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                    >
                      ⠿
                    </button>

                    {/* Name + meta */}
                    <div className="fx-history-preview-main">
                      <span className="fx-history-name">{item.name || 'Untitled'}</span>
                      <span className="fx-history-preview-sub">
                        <span className={`fx-history-metal-badge ${isCu ? 'copper' : 'aluminum'}`}>
                          {isCu ? 'Copper' : 'Aluminum'}
                        </span>
                        <span className="fx-history-time">{relTime(item.created_at)}</span>
                      </span>
                    </div>

                    {/* Saved price */}
                    <div className="fx-history-preview-price">
                      <span className={`fx-history-price-value ${isCu ? 'cu' : 'al'}`}>
                        {savedPriceLabel(item)}
                      </span>
                    </div>

                    {/* Chevron */}
                    <span className={`fx-history-chevron${isOpen ? ' open' : ''}`} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>

                  {/* ── Expanded details — Figma layout ── */}
                  {isOpen && (
                    <div className="fx-history-details">
                      {/* Metal header */}
                      <div className="fx-history-detail-metal">
                        <BusbarMock metal={item.metal} width={36} height={26} />
                        <span className={`fx-history-detail-metal-name${isCu ? '' : ' al'}`}>
                          {isCu ? 'Copper' : 'Aluminum'}
                        </span>
                      </div>

                      {/* 3-column dimensions */}
                      <div className="fx-history-detail-dims-row">
                        <div className="fx-history-detail-dim">
                          <span className="fx-history-detail-dim-label">Length</span>
                          <span className="fx-history-detail-dim-val">{item.length}</span>
                        </div>
                        <div className="fx-history-detail-dim">
                          <span className="fx-history-detail-dim-label">Width</span>
                          <span className="fx-history-detail-dim-val">{item.width}</span>
                        </div>
                        <div className="fx-history-detail-dim">
                          <span className="fx-history-detail-dim-label">Thickness</span>
                          <span className="fx-history-detail-dim-val">{item.thickness}</span>
                        </div>
                      </div>

                      {/* Currency row — orange border, like results card */}
                      {(() => {
                        const code = (item.currency ?? 'USD').toUpperCase();
                        const Flag = FLAGS[code as keyof typeof FLAGS];
                        const p = item.price != null ? Number(item.price) : (livePrice > 0 ? livePrice : null);
                        if (p == null) return null;
                        return (
                          <div className="fx-history-curr-row">
                            {Flag && <Flag className="fx-history-curr-flag" width={28} height={28} />}
                            <span className="fx-history-curr-code">{code}</span>
                            <span className="fx-history-curr-value">{fmtPrice(p)}</span>
                          </div>
                        );
                      })()}

                      {/* Footer */}
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
        </div>
      </main>
      {!embedded && <FxBottomNav active="history" />}
    </div>
  );
}
