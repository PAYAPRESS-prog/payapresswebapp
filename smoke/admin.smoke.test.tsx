/**
 * Busbar Admin smoke tests — gate opacity + shell rendering.
 */
import { render, screen } from '@testing-library/react';
import { AdminGate } from '@/components/admin/AdminGate';
import { AdminShell } from '@/components/admin/AdminShell';

beforeEach(() => {
  // Every admin API call gets a minimal, valid payload.
  global.fetch = jest.fn().mockImplementation((url: RequestInfo | URL) => {
    const u = String(url);
    const json = (body: unknown) =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response);
    if (u.includes('/api/admin/overview')) {
      return json({
        summary: {
          rangeDays: 30, totalViews: 120, uniqueVisitors: 40, sessions: 55,
          bounceRate: 33, avgSessionSec: 95, realtimeActive: 2,
          newVisitors: 30, returningVisitors: 10,
          byDay: [{ day: '2026-07-01', views: 10, visitors: 4, sessions: 5 },
                  { day: '2026-07-02', views: 20, visitors: 8, sessions: 9 }],
          topPages: [{ path: '/busbar-calculator', views: 90 }],
          topReferrers: [{ referrer: 'google.com', views: 30 }],
          byChannel: [{ channel: 'Organic Search', sessions: 20 }],
          byCountry: [{ country: 'Germany', visitors: 12 }],
          events: [{ event: 'calculate', count: 33 }],
        },
        totals: { users: 7, usersLast7d: 2, subscribers: 3, bookmarks: 11 },
        recent: [{ event: 'pageview', path: '/', country: 'DE', device: 'desktop',
                   created_at: new Date().toISOString() }],
      });
    }
    if (u.includes('/api/admin/broadcast')) return json({ recipients: 3 });
    return json({ rows: [], byEvent: [], funnel: null });
  }) as unknown as typeof fetch;
});

describe('AdminGate (opaque 404)', () => {
  it('looks like a 404 and never mentions logging in', () => {
    render(<AdminGate />);
    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText(/could not be found/i)).toBeTruthy();
    expect(document.body.textContent!.toLowerCase()).not.toContain('login');
    expect(document.body.textContent!.toLowerCase()).not.toContain('admin');
  });
});

describe('AdminShell', () => {
  it('renders sidebar sections and loads the overview', async () => {
    render(<AdminShell />);
    for (const label of ['Analytics', 'Users', 'Monitor', 'Broadcast', 'Settings']) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }
    // Overview KPI appears once the mocked fetch resolves
    expect(await screen.findByText('Pageviews')).toBeTruthy();
    expect(await screen.findByText('Top pages')).toBeTruthy();
  });
});
