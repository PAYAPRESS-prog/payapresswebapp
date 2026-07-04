import { NextRequest, NextResponse } from 'next/server';
import { getPool, isDbConfigured } from '@/lib/db';
import { listHistory } from '@/lib/history';
import { fetchCopperPrice, fetchAluminumPrice } from '@/lib/serverPrices';
import { sendMail, isMailerConfigured, dailyPriceReportEmail, type DigestItem } from '@/lib/mailer';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// One digest run can take a while on shared hosting — allow up to 5 min.
export const maxDuration = 300;

const DENSITY = { copper: 8.96, aluminum: 2.7 } as const;

// ── Daily price digest sender ────────────────────────────────────────────────
// Triggered once a day by the hosting cron:
//   curl -s "https://calculator.payapress.com/api/cron/daily-digest?key=$ADMIN_KEY"
//
// For every bell subscriber (email_subscriptions):
//   - if they have an account, their saved configurations are re-priced at
//     today's COMEX/LME spot rates
//   - the dailyPriceReportEmail template is sent (bulk category → proper
//     List-Unsubscribe headers)
// Same opaque-404 ADMIN_KEY gate as the other owner endpoints.

export async function GET(req: NextRequest) {
  const adminKey = process.env.ADMIN_KEY;
  const provided =
    req.headers.get('x-admin-key') ?? req.nextUrl.searchParams.get('key') ?? '';
  if (!adminKey || adminKey.length < 16 || provided !== adminKey) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  if (!isMailerConfigured()) {
    return NextResponse.json({ error: 'Mailer not configured' }, { status: 503 });
  }

  try {
    const [copper, aluminum] = await Promise.all([
      fetchCopperPrice(),
      fetchAluminumPrice(),
    ]);

    const pool = getPool();
    const [subs] = await pool.query<RowDataPacket[]>(
      'SELECT email FROM email_subscriptions ORDER BY created_at ASC LIMIT 500',
    );

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of subs) {
      const email = String(sub.email);
      try {
        // Saved configurations, re-priced at today's spot rates
        let items: DigestItem[] = [];
        const [userRows] = await pool.query<RowDataPacket[]>(
          'SELECT id FROM users WHERE email = ? LIMIT 1',
          [email],
        );
        if (userRows[0]) {
          const history = await listHistory(Number(userRows[0].id), 20);
          items = history.map(h => {
            const metal = h.metal === 'aluminum' ? 'aluminum' : 'copper';
            const kg = (h.width * h.thickness * h.length * DENSITY[metal]) / 1_000_000;
            const perKg = metal === 'copper' ? copper.pricePerKg : aluminum.pricePerKg;
            const usd = kg * perKg;
            return {
              name: h.name || `${metal} ${h.width}×${h.thickness}×${h.length}`,
              metal,
              dims: `${h.length}×${h.width}×${h.thickness} mm`,
              price: `${usd.toLocaleString('en', { maximumFractionDigits: 2 })} USD`,
            };
          });
        }

        const mail = dailyPriceReportEmail(email, copper.pricePerKg, aluminum.pricePerKg, items);
        await sendMail({
          to: email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          category: 'bulk',
        });
        sent++;
      } catch (err) {
        failed++;
        if (errors.length < 5) errors.push(`${email}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      ok: true,
      subscribers: subs.length,
      sent,
      failed,
      pricesUsed: {
        copperPerKg: copper.pricePerKg,
        aluminumPerKg: aluminum.pricePerKg,
        copperIsFallback: copper.isFallback,
        aluminumIsFallback: aluminum.isFallback,
      },
      ...(errors.length ? { sampleErrors: errors } : {}),
      ranAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/daily-digest]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
