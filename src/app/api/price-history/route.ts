import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RANGE_CFG = {
  '1D': { interval: '5m',  yahooRange: '1d'  },
  '7D': { interval: '60m', yahooRange: '7d'  },
  '1M': { interval: '1d',  yahooRange: '1mo' },
  '1Y': { interval: '1wk', yahooRange: '1y'  },
} as const;

type Range = keyof typeof RANGE_CFG;

const SYMBOLS = { copper: 'HG=F', aluminum: 'ALI=F' } as const;

async function fetchYahoo(symbol: string, interval: string, range: string) {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=${interval}&range=${range}&includePrePost=false&events=`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);

  const j = await res.json();
  const result = j?.chart?.result?.[0];
  if (!result) throw new Error('No result in Yahoo response');

  const timestamps: number[]        = result.timestamp ?? [];
  const closes: (number | null)[]   = result.indicators?.quote?.[0]?.close ?? [];

  if (timestamps.length === 0) throw new Error('Empty timestamp array');
  return { timestamps, closes };
}

export async function GET(req: NextRequest) {
  const sp       = new URL(req.url).searchParams;
  const metal    = sp.get('metal') === 'aluminum' ? 'aluminum' : 'copper';
  const rangeKey = (sp.get('range') ?? '1M') as Range;
  const range    = rangeKey in RANGE_CFG ? rangeKey : ('1M' as Range);

  const cfg = RANGE_CFG[range];

  try {
    const { timestamps, closes } = await fetchYahoo(SYMBOLS[metal], cfg.interval, cfg.yahooRange);

    // Zip and filter out null / zero closes
    const pairs = timestamps
      .map((ts, i) => ({ ts, c: closes[i] }))
      .filter((p): p is { ts: number; c: number } =>
        p.c != null && isFinite(p.c) && p.c > 0,
      );

    if (pairs.length < 3) {
      return NextResponse.json({ error: 'Insufficient data points' }, { status: 503 });
    }

    // Convert raw exchange price → USD / kg
    const pricesPerKg = pairs.map(({ c }) => {
      if (metal === 'copper') {
        // HG=F quotes in USD / troy-lb  →  × 2.20462 = USD / kg
        return c * 2.20462;
      } else {
        // ALI=F quotes in USD / MT  →  ÷ 1 000 = USD / kg
        // Occasionally quoted in USD / lb if value < 10
        return c > 10 ? c / 1000 : c * 2.20462;
      }
    });

    return NextResponse.json(
      {
        timestamps: pairs.map(p => p.ts),
        pricesPerKg,
        isFallback: false,
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${cfg.yahooRange === '1d' ? 300 : cfg.yahooRange === '7d' ? 1800 : 3600}, stale-while-revalidate=60`,
        },
      },
    );
  } catch (err) {
    console.error('[price-history]', err);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 503 });
  }
}
