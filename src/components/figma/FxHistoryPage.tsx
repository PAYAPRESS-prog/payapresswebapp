'use client';

import { useEffect, useState } from 'react';
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
  created_at: string;
}

const DENSITY = { copper: 8.96, aluminum: 2.70 };

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

  function getLivePrice(item: HistoryItem): number {
    const pricePerKg = item.metal === 'copper'
      ? (copperPrice ?? 0)
      : (aluminumPrice ?? 0);
    return calcWeight(item) * pricePerKg;
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

          {!loading && !error && items.map(item => {
            const livePrice = getLivePrice(item);
            const weight = calcWeight(item);
            const isCu = item.metal === 'copper';

            return (
              <div key={item.id} className="fx-history-card">
                <div className="fx-history-card-top">
                  <div className="fx-history-meta">
                    <span className={`fx-history-metal-badge ${isCu ? 'copper' : 'aluminum'}`}>
                      {isCu ? 'Copper' : 'Aluminum'}
                    </span>
                    <span className="fx-history-time">{relTime(item.created_at)}</span>
                  </div>
                  <button
                    type="button"
                    className="fx-history-delete-btn"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    aria-label="Delete"
                  >
                    ×
                  </button>
                </div>

                {item.name && item.name !== 'Untitled' && (
                  <div className="fx-history-name">{item.name}</div>
                )}

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
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <FxBottomNav active="history" />
    </div>
  );
}
