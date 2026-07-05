'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

/* Busbar Admin — back-office shell. One client island: left sidebar
   (bottom tabs under 768px) + six sections fetching /api/admin/*.
   Charts are hand-rolled SVG in the same style as the app. */

type Section = 'overview' | 'analytics' | 'users' | 'monitor' | 'broadcast' | 'settings';

const SECTIONS: Array<{ id: Section; label: string; icon: string }> = [
  { id: 'overview',  label: 'Overview',  icon: '◫' },
  { id: 'analytics', label: 'Analytics', icon: '∿' },
  { id: 'users',     label: 'Users',     icon: '◉' },
  { id: 'monitor',   label: 'Monitor',   icon: '♥' },
  { id: 'broadcast', label: 'Broadcast', icon: '➤' },
  { id: 'settings',  label: 'Settings',  icon: '⚙' },
];

/* ── tiny utils ─────────────────────────────────────────────── */

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function exact(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}
function fmtN(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(n) >= 10_000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
}
function csv(rows: Array<Record<string, unknown>>, name: string) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const body = [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${name}.csv`; a.click();
  URL.revokeObjectURL(url);
}

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

/* ── tiny SVG charts (brand style) ──────────────────────────── */

function Spark({ data, color = '#f7941d' }: { data: number[]; color?: string }) {
  if (data.length < 2) return <svg className="bcadm-spark" viewBox="0 0 96 28" />;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * 92 + 2},${26 - (v / max) * 22}`).join(' ');
  return (
    <svg className="bcadm-spark" viewBox="0 0 96 28" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

function AreaChart({ series }: { series: Array<{ day: string; views: number; visitors: number }> }) {
  const W = 720, H = 200, PL = 36, PB = 24;
  if (series.length < 2) return <div className="bcadm-empty">Not enough data yet</div>;
  const max = Math.max(...series.map(d => d.views), 1);
  const x = (i: number) => PL + (i / (series.length - 1)) * (W - PL - 8);
  const y = (v: number) => 8 + (1 - v / max) * (H - PB - 16);
  const line = series.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.views).toFixed(1)}`).join(' ');
  const area = `${line} L${x(series.length - 1)},${H - PB} L${PL},${H - PB} Z`;
  const vline = series.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`).join(' ');
  const ticks = [0, Math.round(series.length / 2), series.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bcadm-area" role="img" aria-label="Traffic chart">
      <defs>
        <linearGradient id="bcadm_fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7941d" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f7941d" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <g key={f}>
          <line x1={PL} x2={W - 8} y1={8 + (1 - f) * (H - PB - 16)} y2={8 + (1 - f) * (H - PB - 16)}
            stroke="rgba(255,255,255,0.06)" strokeDasharray="3,5" />
          <text x={PL - 6} y={12 + (1 - f) * (H - PB - 16)} textAnchor="end" fontSize="9" fill="#6b7280">
            {fmtN(Math.round(max * f))}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#bcadm_fill)" />
      <path d={line} fill="none" stroke="#f7941d" strokeWidth="2" strokeLinejoin="round" />
      <path d={vline} fill="none" stroke="#6fb3e0" strokeWidth="1.4" strokeDasharray="4,3" opacity="0.8" />
      {ticks.map(i => series[i] && (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#6b7280">
          {series[i].day.slice(5)}
        </text>
      ))}
    </svg>
  );
}

/* ── shared widgets ─────────────────────────────────────────── */

function Panel({ title, action, children }: {
  title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="bcadm-panel">
      <header className="bcadm-panel-head">
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function StatusView({ state, error, retry }: { state: 'loading' | 'error'; error?: string; retry?: () => void }) {
  if (state === 'loading') {
    return (
      <div className="bcadm-skeleton-grid" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="bcadm-skeleton" />)}
      </div>
    );
  }
  return (
    <div className="bcadm-error" role="alert">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mr-busbar.png" alt="" width={44} height={126} />
      <p>Could not load this section{error ? ` (${error})` : ''}.</p>
      {retry && <button type="button" className="bcadm-btn" onClick={retry}>Retry</button>}
    </div>
  );
}

function TopList({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  const max = Math.max(...rows.map(r => r[1]), 1);
  return (
    <div className="bcadm-toplist">
      <h3>{title}</h3>
      {rows.length === 0 && <div className="bcadm-empty">No data</div>}
      {rows.map(([label, value]) => (
        <div key={label} className="bcadm-toplist-row">
          <span className="bcadm-toplist-label" title={label}>{label || '—'}</span>
          <span className="bcadm-toplist-bar"><i style={{ width: `${(value / max) * 100}%` }} /></span>
          <span className="bcadm-toplist-val">{fmtN(value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══ Section: Overview ═════════════════════════════════════ */

interface OverviewData {
  summary: {
    rangeDays: number; totalViews: number; uniqueVisitors: number; sessions: number;
    bounceRate: number; avgSessionSec: number; realtimeActive: number;
    newVisitors: number; returningVisitors: number;
    byDay: Array<{ day: string; views: number; visitors: number; sessions: number }>;
    topPages: Array<{ path: string; views: number }>;
    topReferrers: Array<{ referrer: string; views: number }>;
    byChannel: Array<{ channel: string; sessions: number }>;
    byCountry: Array<{ country: string; visitors: number }>;
    events: Array<{ event: string; count: number }>;
  };
  totals: { users: number; usersLast7d: number; subscribers: number; bookmarks: number };
  recent: Array<{ event: string; path: string; country: string; device: string; created_at: string }>;
}

function Overview() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<OverviewData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    setErr(null);
    getJson<OverviewData>(`/api/admin/overview?days=${days}`).then(setData).catch(e => setErr(e.message));
  }, [days]);

  useEffect(() => { setData(null); load(); }, [load]);
  useEffect(() => { const id = setInterval(load, 30_000); return () => clearInterval(id); }, [load]);

  if (err) return <StatusView state="error" error={err} retry={load} />;
  if (!data) return <StatusView state="loading" />;
  const s = data.summary;
  const sparks = {
    views: s.byDay.map(d => d.views),
    visitors: s.byDay.map(d => d.visitors),
    sessions: s.byDay.map(d => d.sessions),
  };
  const calc = s.events.find(e => e.event === 'calculate')?.count ?? 0;
  const kpis: Array<[string, string, number[] | null, string?]> = [
    ['Visitors', fmtN(s.uniqueVisitors), sparks.visitors],
    ['Sessions', fmtN(s.sessions), sparks.sessions],
    ['Pageviews', fmtN(s.totalViews), sparks.views],
    ['Bounce', `${s.bounceRate}%`, null],
    ['Avg session', `${Math.floor(s.avgSessionSec / 60)}m ${s.avgSessionSec % 60}s`, null],
    ['Calculates', fmtN(calc), null],
    ['Users', fmtN(data.totals.users), null, `+${data.totals.usersLast7d} this week`],
    ['Active now', String(s.realtimeActive), null, 'last 5 min'],
  ];
  return (
    <>
      <div className="bcadm-rangebar">
        {[7, 30, 90].map(d => (
          <button key={d} type="button" className={`bcadm-chip${days === d ? ' active' : ''}`}
            onClick={() => setDays(d)}>{d}d</button>
        ))}
        <span className="bcadm-live-dot" /> auto-refresh 30s
      </div>
      <div className="bcadm-kpis">
        {kpis.map(([label, value, spark, sub]) => (
          <div key={label} className="bcadm-kpi">
            <span className="bcadm-kpi-label">{label}</span>
            <span className="bcadm-kpi-value">{value}</span>
            {spark ? <Spark data={spark} /> : sub ? <span className="bcadm-kpi-sub">{sub}</span> : null}
          </div>
        ))}
      </div>
      <Panel title={`Traffic — last ${days} days`}>
        <AreaChart series={s.byDay} />
        <div className="bcadm-legend">
          <span><i style={{ background: '#f7941d' }} /> views</span>
          <span><i style={{ background: '#6fb3e0' }} /> visitors</span>
        </div>
      </Panel>
      <div className="bcadm-grid4">
        <TopList title="Top pages" rows={s.topPages.slice(0, 8).map(r => [r.path, r.views])} />
        <TopList title="Referrers" rows={s.topReferrers.slice(0, 8).map(r => [r.referrer, r.views])} />
        <TopList title="Channels" rows={s.byChannel.slice(0, 8).map(r => [r.channel, r.sessions])} />
        <TopList title="Countries" rows={s.byCountry.slice(0, 8).map(r => [r.country, r.visitors])} />
      </div>
      <Panel title="Latest activity">
        <div className="bcadm-scroll">
        <table className="bcadm-table">
          <thead><tr><th>Event</th><th>Path</th><th>Country</th><th>Device</th><th>When</th></tr></thead>
          <tbody>
            {data.recent.map((r, i) => (
              <tr key={i}>
                <td><span className="bcadm-tag">{r.event}</span></td>
                <td className="bcadm-mono">{r.path}</td>
                <td>{r.country || '—'}</td><td>{r.device || '—'}</td>
                <td title={exact(r.created_at)}>{timeAgo(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Panel>
    </>
  );
}

/* ═══ Section: Analytics explorer ═══════════════════════════ */

interface EventsData {
  rows: Array<Record<string, string | number | null>>;
  byEvent: Array<{ event: string; count: number; sessions: number }>;
  funnel: { visit: number; calc: number; signup: number; engaged: number } | null;
}

function Analytics() {
  const [days, setDays] = useState(30);
  const [f, setF] = useState({ event: '', device: '', browser: '', os: '', country: '', q: '' });
  // Filters only hit the API when applied — not on every keystroke.
  const [applied, setApplied] = useState(f);
  const [data, setData] = useState<EventsData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    setErr(null); setData(null);
    const p = new URLSearchParams({ days: String(days) });
    Object.entries(applied).forEach(([k, v]) => v && p.set(k, v));
    getJson<EventsData>(`/api/admin/events?${p}`).then(setData).catch(e => setErr(e.message));
  }, [days, applied]);
  useEffect(() => { load(); }, [load]);

  const funnel = data?.funnel;
  const steps = funnel ? [
    ['Visit', funnel.visit], ['Calculate', funnel.calc],
    ['Engage (save/share/compare/waste)', funnel.engaged], ['Sign up', funnel.signup],
  ] as Array<[string, number]> : [];

  return (
    <>
      <div className="bcadm-rangebar">
        {[7, 30, 90].map(d => (
          <button key={d} type="button" className={`bcadm-chip${days === d ? ' active' : ''}`}
            onClick={() => setDays(d)}>{d}d</button>
        ))}
        {(['event', 'device', 'browser', 'os', 'country'] as const).map(k => (
          <input key={k} className="bcadm-input bcadm-input-sm" placeholder={k}
            value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && setApplied(f)} />
        ))}
        <input className="bcadm-input bcadm-input-sm" placeholder="path contains…"
          value={f.q} onChange={e => setF({ ...f, q: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && setApplied(f)} />
        <button type="button" className="bcadm-btn" onClick={() => setApplied(f)}>Apply</button>
      </div>

      {err && <StatusView state="error" error={err} retry={load} />}
      {!err && !data && <StatusView state="loading" />}
      {data && (
        <>
          {funnel && (
            <Panel title="Conversion funnel (sessions)">
              <div className="bcadm-funnel">
                {steps.map(([label, v], i) => (
                  <div key={label} className="bcadm-funnel-step">
                    <div className="bcadm-funnel-bar"
                      style={{ width: `${(v / Math.max(steps[0][1], 1)) * 100}%` }} />
                    <span>{label}</span>
                    <b>{fmtN(v)}{i > 0 && steps[0][1] > 0 &&
                      <em> · {((v / steps[0][1]) * 100).toFixed(1)}%</em>}</b>
                  </div>
                ))}
              </div>
            </Panel>
          )}
          <Panel title="Events breakdown"
            action={<button type="button" className="bcadm-btn"
              onClick={() => csv(data.byEvent, 'events-breakdown')}>CSV</button>}>
            <div className="bcadm-scroll">
            <table className="bcadm-table">
              <thead><tr><th>Event</th><th>Count</th><th>Sessions</th></tr></thead>
              <tbody>{data.byEvent.map(r => (
                <tr key={r.event}>
                  <td><span className="bcadm-tag">{r.event}</span></td>
                  <td>{fmtN(r.count)}</td><td>{fmtN(r.sessions)}</td>
                </tr>))}
              </tbody>
            </table>
            </div>
          </Panel>
          <Panel title={`Raw events (${data.rows.length}${data.rows.length === 500 ? ', capped' : ''})`}
            action={<button type="button" className="bcadm-btn"
              onClick={() => csv(data.rows, 'events')}>CSV</button>}>
            <div className="bcadm-scroll">
              <table className="bcadm-table">
                <thead><tr><th>Event</th><th>Path</th><th>Referrer</th><th>Geo</th>
                  <th>Client</th><th>When</th></tr></thead>
                <tbody>{data.rows.map((r, i) => (
                  <tr key={i}>
                    <td><span className="bcadm-tag">{r.event}</span></td>
                    <td className="bcadm-mono">{r.path}</td>
                    <td className="bcadm-dim">{String(r.referrer ?? '') || '—'}</td>
                    <td>{[r.city, r.country].filter(Boolean).join(', ') || '—'}</td>
                    <td className="bcadm-dim">{[r.browser, r.os, r.device].filter(Boolean).join(' · ')}</td>
                    <td title={exact(String(r.created_at))}>{timeAgo(String(r.created_at))}</td>
                  </tr>))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}

/* ═══ Section: Users CRM ════════════════════════════════════ */

interface CrmList {
  rows: Array<{ id: number; email: string; is_google: number; opt_in: number;
    created_at: string; saves: number; last_save: string | null; subscribed: number }>;
  total: number; page: number; per: number;
  deleted: Array<{ original_uid: number; email: string; history_count: number; registered_at: string; deleted_at: string }>;
  subscribers: Array<{ email: string; created_at: string }>;
}
interface CrmDetail {
  user: { id: number; email: string; is_google: number; has_password: number;
    opt_in: number; created_at: string; first_name?: string; last_name?: string; company?: string; phone?: string };
  history: Array<{ name: string; metal: string; width: number; thickness: number;
    length: number; price: number | null; currency: string | null; created_at: string }>;
  subscribed: boolean;
}

function Users() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CrmList | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<CrmDetail | null>(null);
  const [compose, setCompose] = useState({ subject: '', message: '' });
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    setErr(null);
    getJson<CrmList>(`/api/admin/crm?page=${page}&q=${encodeURIComponent(q)}`)
      .then(setData).catch(e => setErr(e.message));
  }, [page, q]);
  useEffect(() => { load(); }, [load]);

  function note(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function openUser(id: number) {
    setDetail(null); setBusy('detail');
    try { setDetail(await getJson<CrmDetail>(`/api/admin/crm?id=${id}`)); }
    catch { note('Could not load user'); }
    setBusy('');
  }
  async function act(body: Record<string, unknown>, done: string) {
    setBusy(String(body.action));
    try {
      const r = await fetch('/api/admin/crm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || r.status);
      note(done); load();
      if (detail) openUser(detail.user.id);
    } catch (e) { note(String(e instanceof Error ? e.message : e)); }
    setBusy('');
  }
  async function removeUser(id: number, email: string) {
    if (!window.confirm(`Archive & delete ${email}?`)) return;
    if (!window.confirm('This removes the account and their saved history from the live tables (an audit copy is kept). Continue?')) return;
    setBusy('delete');
    try {
      const r = await fetch(`/api/admin/crm?id=${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(String(r.status));
      note('Account archived & deleted'); setDetail(null); load();
    } catch { note('Delete failed'); }
    setBusy('');
  }

  return (
    <>
      {toast && <div className="bcadm-toast">{toast}</div>}
      <div className="bcadm-rangebar">
        <input className="bcadm-input" placeholder="Search email…" value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }} />
        {data && <span className="bcadm-dim">{fmtN(data.total)} users</span>}
        {data && <button type="button" className="bcadm-btn"
          onClick={() => csv(data.rows, 'users')}>CSV</button>}
      </div>
      {err && <StatusView state="error" error={err} retry={load} />}
      {!err && !data && <StatusView state="loading" />}
      {data && (
        <>
          <Panel title="Users">
            <div className="bcadm-scroll">
              <table className="bcadm-table bcadm-click">
                <thead><tr><th>#</th><th>Email</th><th>Auth</th><th>Opt-in</th>
                  <th>Bell</th><th>Saves</th><th>Last save</th><th>Joined</th></tr></thead>
                <tbody>{data.rows.map(u => (
                  <tr key={u.id} onClick={() => openUser(u.id)}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.is_google
                      ? <span className="bcadm-tag bcadm-tag-blue">Google</span>
                      : <span className="bcadm-tag">Password</span>}</td>
                    <td>{u.opt_in ? '✓' : '—'}</td>
                    <td>{u.subscribed ? '🔔' : '—'}</td>
                    <td>{u.saves}</td>
                    <td title={exact(u.last_save)}>{timeAgo(u.last_save)}</td>
                    <td title={exact(u.created_at)}>{timeAgo(u.created_at)}</td>
                  </tr>))}
                </tbody>
              </table>
              {data.rows.length === 0 && <div className="bcadm-empty">No users match</div>}
            </div>
            {data.total > data.per && (
              <div className="bcadm-pager">
                <button type="button" className="bcadm-btn" disabled={page <= 1}
                  onClick={() => setPage(page - 1)}>‹ Prev</button>
                <span>Page {page} / {Math.ceil(data.total / data.per)}</span>
                <button type="button" className="bcadm-btn" disabled={page >= Math.ceil(data.total / data.per)}
                  onClick={() => setPage(page + 1)}>Next ›</button>
              </div>
            )}
          </Panel>

          {page === 1 && !q && (
            <div className="bcadm-grid2">
              <Panel title={`Bell subscribers (${data.subscribers.length})`}>
                <div className="bcadm-scroll bcadm-scroll-sm">
                  <table className="bcadm-table">
                    <thead><tr><th>Email</th><th>Since</th><th /></tr></thead>
                    <tbody>{data.subscribers.map(s => (
                      <tr key={s.email}>
                        <td>{s.email}</td>
                        <td title={exact(s.created_at)}>{timeAgo(s.created_at)}</td>
                        <td><button type="button" className="bcadm-btn bcadm-btn-danger"
                          disabled={busy === 'toggle-sub'}
                          onClick={() => act({ action: 'toggle-sub', email: s.email }, 'Unsubscribed')}>
                          Remove</button></td>
                      </tr>))}
                    </tbody>
                  </table>
                  {data.subscribers.length === 0 && <div className="bcadm-empty">No subscribers yet</div>}
                </div>
              </Panel>
              <Panel title={`Deleted accounts archive (${data.deleted.length})`}>
                <div className="bcadm-scroll bcadm-scroll-sm">
                  <table className="bcadm-table">
                    <thead><tr><th>Email</th><th>Saves</th><th>Lived</th><th>Deleted</th></tr></thead>
                    <tbody>{data.deleted.map(d => (
                      <tr key={`${d.original_uid}-${d.deleted_at}`}>
                        <td>{d.email}</td><td>{d.history_count}</td>
                        <td title={exact(d.registered_at)}>{timeAgo(d.registered_at)}</td>
                        <td title={exact(d.deleted_at)}>{timeAgo(d.deleted_at)}</td>
                      </tr>))}
                    </tbody>
                  </table>
                  {data.deleted.length === 0 && <div className="bcadm-empty">Nothing here — good sign</div>}
                </div>
              </Panel>
            </div>
          )}
        </>
      )}

      {/* Row drawer */}
      {(detail || busy === 'detail') && (
        <div className="bcadm-drawer-veil" onClick={() => setDetail(null)}>
          <aside className="bcadm-drawer" onClick={e => e.stopPropagation()}>
            {!detail ? <div className="bcadm-skeleton" style={{ height: 120 }} /> : (
              <>
                <header className="bcadm-drawer-head">
                  <div>
                    <h2>{detail.user.email}</h2>
                    <p className="bcadm-dim">
                      #{detail.user.id} · joined {timeAgo(detail.user.created_at)} ·{' '}
                      {detail.user.is_google ? 'Google account' : 'password account'}
                      {detail.subscribed ? ' · 🔔 subscribed' : ''}
                    </p>
                  </div>
                  <button type="button" className="bcadm-btn" onClick={() => setDetail(null)}>✕</button>
                </header>

                <h3>Saved calculations ({detail.history.length})</h3>
                <div className="bcadm-scroll bcadm-scroll-sm">
                  <table className="bcadm-table">
                    <thead><tr><th>Name</th><th>Spec</th><th>Price</th><th>When</th></tr></thead>
                    <tbody>{detail.history.map((h, i) => (
                      <tr key={i}>
                        <td>{h.name || '—'}</td>
                        <td className="bcadm-mono">{h.metal} {h.width}×{h.thickness}×{h.length}</td>
                        <td>{h.price != null ? `${Number(h.price).toLocaleString()} ${h.currency ?? ''}` : '—'}</td>
                        <td title={exact(h.created_at)}>{timeAgo(h.created_at)}</td>
                      </tr>))}
                    </tbody>
                  </table>
                  {detail.history.length === 0 && <div className="bcadm-empty">No saved calculations</div>}
                </div>

                <h3>Send email</h3>
                <input className="bcadm-input" placeholder="Subject" value={compose.subject}
                  onChange={e => setCompose({ ...compose, subject: e.target.value })} />
                <textarea className="bcadm-input bcadm-textarea" placeholder="Message…" rows={5}
                  value={compose.message}
                  onChange={e => setCompose({ ...compose, message: e.target.value })} />
                <div className="bcadm-row">
                  <button type="button" className="bcadm-btn bcadm-btn-primary"
                    disabled={busy === 'email' || !compose.subject.trim() || !compose.message.trim()}
                    onClick={() => act({ action: 'email', email: detail.user.email, ...compose }, 'Email sent')}>
                    {busy === 'email' ? 'Sending…' : 'Send branded email'}
                  </button>
                  <button type="button" className="bcadm-btn"
                    disabled={busy === 'toggle-sub'}
                    onClick={() => act({ action: 'toggle-sub', email: detail.user.email },
                      detail.subscribed ? 'Unsubscribed' : 'Subscribed')}>
                    {detail.subscribed ? 'Disable bell' : 'Enable bell'}
                  </button>
                  <button type="button" className="bcadm-btn bcadm-btn-danger"
                    disabled={busy === 'delete'}
                    onClick={() => removeUser(detail.user.id, detail.user.email)}>
                    Delete account
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

/* ═══ Section: Monitor ══════════════════════════════════════ */

interface MonitorData {
  dbLatencyMs: number | null;
  feeds: {
    copper: { pricePerKg: number; isFallback: boolean; updatedAt: string } | null;
    aluminum: { pricePerKg: number; isFallback: boolean; updatedAt: string } | null;
    fx: { eur: number | null; ok: boolean } | null;
  };
  cronRuns: Array<{ name: string; detail: string; created_at: string }>;
  errors: Array<{ route: string; message: string; hits: number; last_seen: string }>;
  env: Array<{ name: string; present: boolean }>;
  smtpConfigured: boolean;
}

function Monitor() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mailState, setMailState] = useState('');

  const load = useCallback(() => {
    setErr(null);
    getJson<MonitorData>('/api/admin/monitor').then(setData).catch(e => setErr(e.message));
  }, []);
  useEffect(() => { load(); const id = setInterval(load, 60_000); return () => clearInterval(id); }, [load]);

  async function testMail() {
    setMailState('sending');
    try {
      const r = await fetch('/api/admin/monitor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-mail' }),
      });
      const d = await r.json().catch(() => ({}));
      setMailState(r.ok ? `Sent to ${d.to}` : (d.error || 'failed'));
    } catch { setMailState('failed'); }
  }

  if (err) return <StatusView state="error" error={err} retry={load} />;
  if (!data) return <StatusView state="loading" />;

  const feedCard = (label: string, f: { pricePerKg: number; isFallback: boolean; updatedAt: string } | null) => (
    <div className={`bcadm-kpi ${f && !f.isFallback ? 'ok' : 'warn'}`}>
      <span className="bcadm-kpi-label">{label}</span>
      <span className="bcadm-kpi-value">{f ? `$${f.pricePerKg.toFixed(2)}` : '—'}</span>
      <span className="bcadm-kpi-sub">
        {f ? (f.isFallback ? '⚠ estimated fallback' : '● live') : 'unreachable'}
        {f && <> · <span title={exact(f.updatedAt)}>{timeAgo(f.updatedAt)}</span></>}
      </span>
    </div>
  );

  return (
    <>
      <div className="bcadm-kpis">
        {feedCard('Copper feed', data.feeds.copper)}
        {feedCard('Aluminum feed', data.feeds.aluminum)}
        <div className={`bcadm-kpi ${data.feeds.fx?.ok ? 'ok' : 'warn'}`}>
          <span className="bcadm-kpi-label">FX rates</span>
          <span className="bcadm-kpi-value">{data.feeds.fx?.ok ? `€${Number(data.feeds.fx.eur).toFixed(3)}` : '—'}</span>
          <span className="bcadm-kpi-sub">{data.feeds.fx?.ok ? '● live' : 'unreachable'}</span>
        </div>
        <div className={`bcadm-kpi ${data.dbLatencyMs != null ? 'ok' : 'warn'}`}>
          <span className="bcadm-kpi-label">Database</span>
          <span className="bcadm-kpi-value">{data.dbLatencyMs != null ? `${data.dbLatencyMs}ms` : 'down'}</span>
          <span className="bcadm-kpi-sub">SELECT 1 round-trip</span>
        </div>
        <div className={`bcadm-kpi ${data.smtpConfigured ? 'ok' : 'warn'}`}>
          <span className="bcadm-kpi-label">SMTP</span>
          <span className="bcadm-kpi-value">{data.smtpConfigured ? 'configured' : 'missing'}</span>
          <button type="button" className="bcadm-btn" onClick={testMail}
            disabled={mailState === 'sending' || !data.smtpConfigured}>
            {mailState === 'sending' ? 'Sending…' : 'Send test mail'}
          </button>
          {mailState && mailState !== 'sending' && <span className="bcadm-kpi-sub">{mailState}</span>}
        </div>
      </div>
      <div className="bcadm-grid2">
        <Panel title="Cron runs (daily digest)">
          <div className="bcadm-scroll bcadm-scroll-sm">
          <table className="bcadm-table">
            <thead><tr><th>Job</th><th>Detail</th><th>When</th></tr></thead>
            <tbody>{data.cronRuns.map((c, i) => (
              <tr key={i}><td>{c.name}</td><td className="bcadm-dim">{c.detail}</td>
                <td title={exact(c.created_at)}>{timeAgo(c.created_at)}</td></tr>))}
            </tbody>
          </table>
          </div>
          {data.cronRuns.length === 0 &&
            <div className="bcadm-empty">No runs recorded yet — the digest logs here from its next run</div>}
        </Panel>
        <Panel title="Application errors">
          <div className="bcadm-scroll bcadm-scroll-sm">
            <table className="bcadm-table">
              <thead><tr><th>Route</th><th>Message</th><th>Hits</th><th>Last</th></tr></thead>
              <tbody>{data.errors.map((e, i) => (
                <tr key={i}><td className="bcadm-mono">{e.route}</td>
                  <td className="bcadm-dim">{e.message}</td><td>{e.hits}</td>
                  <td title={exact(e.last_seen)}>{timeAgo(e.last_seen)}</td></tr>))}
              </tbody>
            </table>
          </div>
          {data.errors.length === 0 && <div className="bcadm-empty">No errors logged 🎉</div>}
        </Panel>
      </div>
    </>
  );
}

/* ═══ Section: Broadcast ════════════════════════════════════ */

function Broadcast() {
  const [audience, setAudience] = useState<'subscribers' | 'optin' | 'all'>('subscribers');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [state, setState] = useState<'idle' | 'counting' | 'sending' | 'done' | 'error'>('idle');
  const [result, setResult] = useState('');

  useEffect(() => {
    setCount(null); setState('counting');
    fetch('/api/admin/broadcast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audience, subject: 'x', message: 'x', dryRun: true }),
    }).then(r => r.json()).then(d => { setCount(d.recipients ?? null); setState('idle'); })
      .catch(() => setState('idle'));
  }, [audience]);

  async function send() {
    if (!subject.trim() || !message.trim()) return;
    if (!window.confirm(`Send "${subject}" to ${count ?? '?'} recipients (${audience})?`)) return;
    setState('sending'); setResult('');
    try {
      const r = await fetch('/api/admin/broadcast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, subject, message }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || r.status);
      setResult(`Sent ${d.sent}/${d.total}${d.failed ? ` — ${d.failed} failed` : ''}`);
      setState('done');
    } catch (e) {
      setResult(String(e instanceof Error ? e.message : e)); setState('error');
    }
  }

  return (
    <div className="bcadm-grid2">
      <Panel title="Compose announcement">
        <div className="bcadm-row">
          {(['subscribers', 'optin', 'all'] as const).map(a => (
            <button key={a} type="button" className={`bcadm-chip${audience === a ? ' active' : ''}`}
              onClick={() => setAudience(a)}>
              {a === 'subscribers' ? 'Bell subscribers' : a === 'optin' ? 'Opt-in users' : 'All users'}
            </button>
          ))}
          <span className="bcadm-dim">
            {state === 'counting' ? 'counting…' : count != null ? `${count} recipients` : ''}
          </span>
        </div>
        <input className="bcadm-input" placeholder="Subject" value={subject}
          onChange={e => setSubject(e.target.value)} maxLength={160} />
        <textarea className="bcadm-input bcadm-textarea" rows={10}
          placeholder={'Message…\n\nBlank line = new paragraph.'}
          value={message} onChange={e => setMessage(e.target.value)} />
        <div className="bcadm-row">
          <button type="button" className="bcadm-btn bcadm-btn-primary"
            disabled={state === 'sending' || !subject.trim() || !message.trim()}
            onClick={send}>
            {state === 'sending' ? 'Sending in batches of 20…' : 'Send broadcast'}
          </button>
          {result && <span className={state === 'error' ? 'bcadm-err-text' : 'bcadm-ok-text'}>{result}</span>}
        </div>
      </Panel>
      <Panel title="Preview">
        <div className="bcadm-preview">
          <div className="bcadm-preview-head">Busbar Calculator</div>
          <div className="bcadm-preview-body">
            <h4>{subject || 'Subject preview'}</h4>
            {(message || 'Your message shows here exactly as recipients read it.')
              .split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            <span className="bcadm-preview-btn">Open Busbar Calculator</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ═══ Section: Settings ═════════════════════════════════════ */

function Settings() {
  const [monitor, setMonitor] = useState<MonitorData | null>(null);
  const [rows, setRows] = useState<Array<{ action: string; target: string; ip: string; created_at: string }> | null>(null);
  const [filter, setFilter] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    setErr(null);
    Promise.all([
      getJson<MonitorData>('/api/admin/monitor'),
      getJson<{ rows: Array<{ action: string; target: string; ip: string; created_at: string }> }>(
        `/api/admin/audit${filter ? `?action=${encodeURIComponent(filter)}` : ''}`),
    ]).then(([m, a]) => { setMonitor(m); setRows(a.rows); }).catch(e => setErr(e.message));
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => {});
    window.location.reload();
  }

  if (err) return <StatusView state="error" error={err} retry={load} />;
  if (!monitor || !rows) return <StatusView state="loading" />;

  return (
    <>
      <div className="bcadm-grid2">
        <Panel title="Environment (names only — values never leave the server)">
          <div className="bcadm-envgrid">
            {monitor.env.map(e => (
              <span key={e.name} className={`bcadm-tag ${e.present ? 'bcadm-tag-ok' : 'bcadm-tag-bad'}`}>
                {e.present ? '✓' : '✕'} {e.name}
              </span>
            ))}
          </div>
          <p className="bcadm-dim" style={{ marginTop: 12 }}>
            To rotate ADMIN_KEY: set the new value in the Hostinger panel, restart the app,
            then log in here again. Sessions expire after 12 hours.
          </p>
          <div className="bcadm-row">
            <a className="bcadm-btn" href="https://search.google.com/search-console" target="_blank" rel="noreferrer">Search Console ↗</a>
            <a className="bcadm-btn" href="https://analytics.google.com" target="_blank" rel="noreferrer">GA4 ↗</a>
            <a className="bcadm-btn" href="/api/admin/analytics?format=html" target="_blank" rel="noreferrer">Legacy report ↗</a>
            <button type="button" className="bcadm-btn bcadm-btn-danger" onClick={logout}>Log out</button>
          </div>
        </Panel>
        <Panel title="Audit log"
          action={
            <input className="bcadm-input bcadm-input-sm" placeholder="filter action…"
              value={filter} onChange={e => setFilter(e.target.value)} />
          }>
          <div className="bcadm-scroll">
            <table className="bcadm-table">
              <thead><tr><th>Action</th><th>Target</th><th>IP</th><th>When</th></tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={i}>
                  <td><span className="bcadm-tag">{r.action}</span></td>
                  <td className="bcadm-dim">{r.target}</td>
                  <td className="bcadm-mono">{r.ip}</td>
                  <td title={exact(r.created_at)}>{timeAgo(r.created_at)}</td>
                </tr>))}
              </tbody>
            </table>
            {rows.length === 0 && <div className="bcadm-empty">No audit entries</div>}
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ═══ Shell ═════════════════════════════════════════════════ */

export function AdminShell() {
  const [section, setSection] = useState<Section>('overview');
  const body = useMemo(() => {
    switch (section) {
      case 'overview':  return <Overview />;
      case 'analytics': return <Analytics />;
      case 'users':     return <Users />;
      case 'monitor':   return <Monitor />;
      case 'broadcast': return <Broadcast />;
      case 'settings':  return <Settings />;
    }
  }, [section]);

  return (
    <div className="bcadm">
      <aside className="bcadm-side">
        <div className="bcadm-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mr-busbar.png" alt="" width={26} height={75} />
          <div>
            <strong>Busbar Admin</strong>
            <span>back-office</span>
          </div>
        </div>
        <nav aria-label="Admin sections">
          {SECTIONS.map(s => (
            <button key={s.id} type="button"
              className={`bcadm-nav${section === s.id ? ' active' : ''}`}
              onClick={() => setSection(s.id)}>
              <i aria-hidden>{s.icon}</i>{s.label}
            </button>
          ))}
        </nav>
        <a className="bcadm-side-foot" href="/busbar-calculator">← Open the app</a>
      </aside>
      <main className="bcadm-main">
        <h1 className="bcadm-title">{SECTIONS.find(s => s.id === section)?.label}</h1>
        {body}
      </main>
    </div>
  );
}
