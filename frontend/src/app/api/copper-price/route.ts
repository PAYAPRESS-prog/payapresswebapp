import { NextResponse } from 'next/server';

// COMEX Copper Futures via Yahoo Finance (server-side, no CORS issues)
const YAHOO_URL =
  'https://query1.finance.yahoo.com/v8/finance/chart/HG=F?interval=1d&range=1d';

// Fallback: approximate LME copper price (update periodically)
const FALLBACK_PER_LB = 4.45;

export async function GET() {
  try {
    const res = await fetch(YAHOO_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) throw new Error(`Yahoo ${res.status}`);

    const json = await res.json();
    const pricePerLb: number | undefined =
      json?.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (!pricePerLb || pricePerLb <= 0) throw new Error('bad data');

    const pricePerKg = pricePerLb * 2.20462;

    return NextResponse.json({
      pricePerLb: +pricePerLb.toFixed(4),
      pricePerKg: +pricePerKg.toFixed(3),
      pricePerMT: +pricePerKg.toFixed(0) * 1000,
      currency: 'USD',
      source: 'COMEX HG=F',
      isFallback: false,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    const pricePerKg = FALLBACK_PER_LB * 2.20462;
    return NextResponse.json({
      pricePerLb: FALLBACK_PER_LB,
      pricePerKg: +pricePerKg.toFixed(3),
      pricePerMT: +pricePerKg.toFixed(0) * 1000,
      currency: 'USD',
      source: 'estimated',
      isFallback: true,
      updatedAt: new Date().toISOString(),
    });
  }
}
