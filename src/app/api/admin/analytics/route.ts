import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { getSummary } from '@/lib/analytics';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Owner-only analytics summary. Same ADMIN_KEY gate + opaque 404 as the
// other admin endpoints.  /api/admin/analytics?key=...&days=30
export async function GET(req: NextRequest) {
  if (!checkRateLimit(`admin-an:${getClientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const adminKey = process.env.ADMIN_KEY;
  const provided = req.headers.get('x-admin-key') ?? req.nextUrl.searchParams.get('key') ?? '';
  if (!adminKey || adminKey.length < 16 || provided !== adminKey) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const days = Number(req.nextUrl.searchParams.get('days') ?? '30');
    const summary = await getSummary(days);

    // ?format=html → a tiny at-a-glance dashboard; default is JSON.
    if (req.nextUrl.searchParams.get('format') === 'html') {
      return new NextResponse(renderHtml(summary), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return NextResponse.json({ ...summary, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[admin/analytics]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function renderHtml(s: Awaited<ReturnType<typeof getSummary>>): string {
  const esc = (v: string) => v.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
  const fmt = (n: number) => n.toLocaleString('en');
  const dur = (sec: number) => sec >= 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`;
  const maxDay = Math.max(1, ...s.byDay.map(d => d.views));
  const bars = s.byDay.map(d =>
    `<div class="bar" title="${d.day} — ${d.views} views · ${d.visitors} visitors · ${d.sessions} sessions">
       <span style="height:${Math.round((d.views / maxDay) * 100)}%"></span><em>${d.day.slice(5)}</em></div>`).join('');
  const tbl = (title: string, arr: Array<Record<string, unknown>>, k: string, v: string, unit = '') => {
    const max = Math.max(1, ...arr.map(r => Number(r[v])));
    const rows = arr.map(r => {
      const val = Number(r[v]);
      return `<tr><td><span class="track" style="width:${Math.round((val / max) * 100)}%"></span>${esc(String(r[k]))}</td><td>${fmt(val)}${unit}</td></tr>`;
    }).join('') || '<tr><td colspan="2" class="empty">No data yet</td></tr>';
    return `<div class="card"><h2>${title}</h2><table>${rows}</table></div>`;
  };

  return `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="robots" content="noindex"/>
<title>Analytics — Busbar Calculator</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#0b0c0e;color:#f5f7fa;font:14px/1.5 -apple-system,system-ui,sans-serif;padding:22px;max-width:1100px;margin:0 auto}
  h1{font-size:20px;margin:0 0 2px}.sub{color:#8b909a;margin:0 0 20px;font-size:13px}
  .rt{display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,.14);color:#4ade80;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;margin-left:8px}
  .rt i{width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;animation:p 1.4s infinite}
  @keyframes p{0%,100%{opacity:.4}50%{opacity:1}}
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px}
  .kpi{background:#15171b;border:1px solid #24262c;border-radius:12px;padding:14px 16px}
  .kpi b{display:block;font-size:26px;color:#f7941d;line-height:1.1}.kpi span{color:#8b909a;font-size:12px}
  .chart{display:flex;align-items:flex-end;gap:3px;height:140px;background:#15171b;border:1px solid #24262c;border-radius:12px;padding:14px;margin-bottom:24px;overflow-x:auto}
  .bar{flex:1;min-width:9px;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end}
  .bar span{width:72%;background:linear-gradient(#f7941d,#e8531f);border-radius:3px 3px 0 0;min-height:2px}
  .bar em{font-size:8px;color:#6b7280;margin-top:4px;font-style:normal;white-space:nowrap}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
  .card{background:#15171b;border:1px solid #24262c;border-radius:12px;padding:14px 16px}
  h2{font-size:12px;color:#8b909a;text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px}
  table{width:100%;border-collapse:collapse}
  td{padding:7px 0;border-bottom:1px solid #1c1e23;position:relative;font-size:13px}
  td:first-child{padding-left:8px;overflow:hidden;text-overflow:ellipsis;max-width:230px;white-space:nowrap}
  td:last-child{text-align:right;color:#f7941d;font-weight:600;white-space:nowrap;width:70px}
  tr:last-child td{border-bottom:none}
  .track{position:absolute;left:0;top:4px;bottom:4px;background:rgba(247,148,29,.10);border-radius:4px;z-index:0}
  .empty{color:#6b7280;text-align:center}
</style></head><body>
<h1>📊 Busbar Calculator — Analytics <span class="rt"><i></i>${s.realtimeActive} active now</span></h1>
<p class="sub">Last ${s.rangeDays} days · first-party · cookieless · unsampled</p>
<div class="kpis">
  <div class="kpi"><b>${fmt(s.totalViews)}</b><span>Page views</span></div>
  <div class="kpi"><b>${fmt(s.uniqueVisitors)}</b><span>Unique visitors</span></div>
  <div class="kpi"><b>${fmt(s.sessions)}</b><span>Sessions</span></div>
  <div class="kpi"><b>${s.bounceRate}%</b><span>Bounce rate</span></div>
  <div class="kpi"><b>${dur(s.avgSessionSec)}</b><span>Avg. session</span></div>
  <div class="kpi"><b>${s.viewsPerSession}</b><span>Views / session</span></div>
  <div class="kpi"><b>${fmt(s.newVisitors)} / ${fmt(s.returningVisitors)}</b><span>New / returning</span></div>
</div>
<div class="chart">${bars || '<span style="color:#6b7280">No data yet</span>'}</div>
<div class="grid">
  ${tbl('Top pages', s.topPages, 'path', 'views')}
  ${tbl('Entry pages', s.entryPages, 'path', 'sessions')}
  ${tbl('Referrers', s.topReferrers, 'referrer', 'views')}
  ${tbl('Channels', s.byChannel, 'channel', 'sessions')}
  ${tbl('Countries', s.byCountry, 'country', 'visitors')}
  ${tbl('Conversions & events', s.events, 'event', 'count')}
  ${tbl('Browsers', s.byBrowser, 'browser', 'views')}
  ${tbl('Operating systems', s.byOS, 'os', 'views')}
  ${tbl('Devices', s.byDevice, 'device', 'views')}
</div>
<p class="sub" style="margin-top:20px">Auto-refreshes every 60s.</p>
<script>setTimeout(()=>location.reload(),60000)</script>
</body></html>`;
}