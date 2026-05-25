import { NextResponse } from 'next/server';
import { fetchWithRetry } from '@/lib/fetchWithRetry';

// LME Aluminum Futures via Yahoo Finance (server-side, no CORS issues)
// ALI=F is quoted in USD/MT (metric ton), typical range 2000–3500
const YAHOO_URL =
  'https://query1.finance.yahoo.com/v8/finance/chart/ALI=F?interval=1d&range=1d';

// Fallback: approximate LME aluminum spot
const FALLBACK_PER_MT = 2500;

export async function GET() {
  try {
    const res = await fetchWithRetry(
      YAHOO_URL,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } },
    );

    const json = await res.json();
    const rawPrice: number | undefined =
      json?.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (!rawPrice || rawPrice <= 0) throw new Error('bad data');

    // ALI=F is quoted in USD/MT; guard against unexpected unit change
    let pricePerKg: number;
    if (rawPrice > 500) {
      pricePerKg = rawPrice / 1000;       // USD/MT → USD/kg
    } else if (rawPrice < 5) {
      pricePerKg = rawPrice * 2.20462;    // USD/lb → USD/kg (safety)
    } else {
      throw new Error('ambiguous price unit');
    }

    const pricePerMT = Math.round(pricePerKg * 1000);

    return NextResponse.json(
      {
        pricePerLb:  +(pricePerKg / 2.20462).toFixed(4),
        pricePerKg:  +pricePerKg.toFixed(4),
        pricePerMT,
        currency:    'USD',
        source:      'LME ALI=F',
        isFallback:  false,
        updatedAt:   new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } },
    );
  } catch {
    const pricePerKg = FALLBACK_PER_MT / 1000;
    return NextResponse.json(
      {
        pricePerLb:  +(pricePerKg / 2.20462).toFixed(4),
        pricePerKg:  +pricePerKg.toFixed(4),
        pricePerMT:  FALLBACK_PER_MT,
        currency:    'USD',
        source:      'estimated',
        isFallback:  true,
        updatedAt:   new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } },
    );
  }
}
