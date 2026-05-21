import { NextResponse } from 'next/server';

// Hardcoded pegged / stable rates (USD-based)
// ECB doesn't carry these, so we always use fixed values
const PEGGED: Record<string, number> = {
  AED: 3.6725, // UAE Central Bank USD peg (fixed)
  SAR: 3.7500, // Saudi Arabia USD peg
  QAR: 3.6400, // Qatar USD peg
  KWD: 0.3075, // Kuwait managed float (stable)
  BHD: 0.3760, // Bahrain USD peg
};

// Static fallback if Frankfurter fails
const FALLBACK: Record<string, number> = {
  EUR: 0.92,  GBP: 0.79,  CHF: 0.89,  JPY: 149.50, CAD: 1.36,
  AUD: 1.53,  CNY: 7.24,  INR: 83.12, SGD: 1.34,   KRW: 1325.0,
  TRY: 32.10, BRL: 4.97,  MXN: 17.15, NOK: 10.55,  SEK: 10.42,
  ZAR: 18.63,
  ...PEGGED,
};

// Currencies we want from the ECB/Frankfurter feed
const WANTED = [
  'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'SGD',
  'KRW', 'TRY', 'BRL', 'MXN', 'NOK', 'SEK', 'ZAR',
];

export async function GET() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD', {
      next: { revalidate: 21600 }, // refresh every 6 hours
    });
    if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
    const data = await res.json() as { rates: Record<string, number>; date: string };

    const rates: Record<string, number> = {};

    // Pull ECB-available currencies from Frankfurter, fall back to static if missing
    for (const code of WANTED) {
      rates[code] = typeof data.rates[code] === 'number'
        ? data.rates[code]
        : FALLBACK[code];
    }

    // Always override with pegged rates (ECB doesn't carry Gulf currencies)
    Object.assign(rates, PEGGED);

    return NextResponse.json(
      { ...rates, isFallback: false, source: 'ECB via Frankfurter', updatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' } },
    );
  } catch {
    return NextResponse.json(
      { ...FALLBACK, isFallback: true, source: 'static fallback', updatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' } },
    );
  }
}
