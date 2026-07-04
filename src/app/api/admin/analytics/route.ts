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
  const maxDay = Math.max(1, ...s.byDay.map(d => d.views));
  const bars = s.byDay.map(d =>
    `<div class="bar" title="${d.day}: ${d.views} views, ${d.visitors} visitors">
       <span style="height:${Math.round((d.views / maxDay) * 100)}%"></span>
       <em>${d.day.slice(5)}</em>
     </div>`).join('');
  const rows = (arr: Array<Record<string, unknown>>, k: string, v: string) =>
    arr.map(r => `<tr><td>${esc(String(r[k]))}</td><td>${r[v]}</td></tr>`).join('') || '<tr><td colspan="2">No data yet</td></tr>';

  return `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>Analytics — Busbar Calculator</title>
<style>
  body{margin:0;background:#0d0e10;color:#f5f7fa;font:14px/1.5 -apple-system,system-ui,sans-serif;padding:24px;}
  h1{font-size:20px;margin:0 0 4px}.sub{color:#8b909a;margin:0 0 24px;font-size:13px}
  .kpis{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:28px}
  .kpi{background:#16181d;border:1px solid #24262c;border-radius:12px;padding:16px 20px;min-width:130px}
  .kpi b{display:block;font-size:28px;color:#f7941d}.kpi span{color:#8b909a;font-size:12px}
  .chart{display:flex;align-items:flex-end;gap:3px;height:130px;background:#16181d;border:1px solid #24262c;border-radius:12px;padding:14px;margin-bottom:28px;overflow-x:auto}
  .bar{flex:1;min-width:8px;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end}
  .bar span{width:70%;background:linear-gradient(#f7941d,#e8531f);border-radius:3px 3px 0 0;min-height:2px}
  .bar em{font-size:8px;color:#6b7280;margin-top:4px;font-style:normal;white-space:nowrap}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  @media(max-width:640px){.grid{grid-template-columns:1fr}}
  table{width:100%;border-collapse:collapse;background:#16181d;border:1px solid #24262c;border-radius:12px;overflow:hidden}
  th{text-align:left;color:#8b909a;font-size:12px;padding:10px 14px;border-bottom:1px solid #24262c}
  td{padding:9px 14px;border-bottom:1px solid #1d1f24;word-break:break-all}
  td:last-child{text-align:right;color:#f7941d;font-weight:600;white-space:nowrap}
  h2{font-size:13px;color:#8b909a;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px}
</style></head><body>
<h1>📊 Busbar Calculator — Analytics</h1>
<p class="sub">Last ${s.rangeDays} days · cookieless, first-party</p>
<div class="kpis">
  <div class="kpi"><b>${s.totalViews.toLocaleString()}</b><span>Page views</span></div>
  <div class="kpi"><b>${s.uniqueVisitors.toLocaleString()}</b><span>Unique visitors</span></div>
</div>
<h2>Daily views</h2><div class="chart">${bars || '<span style="color:#6b7280">No data yet</span>'}</div>
<div class="grid">
  <div><h2>Top pages</h2><table><tr><th>Path</th><th>Views</th></tr>${rows(s.topPages, 'path', 'views')}</table></div>
  <div><h2>Top referrers</h2><table><tr><th>Source</th><th>Views</th></tr>${rows(s.topReferrers, 'referrer', 'views')}</table></div>
  <div><h2>By device</h2><table><tr><th>Device</th><th>Views</th></tr>${rows(s.byDevice, 'device', 'views')}</table></div>
</div>
</body></html>`;
}
