import { NextResponse } from 'next/server';

const FALLBACK = { EUR: 0.92, GBP: 0.79, CAD: 1.36, AED: 3.67 };

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 }, // refresh every hour
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json({
      EUR: data.rates.EUR,
      GBP: data.rates.GBP,
      CAD: data.rates.CAD,
      AED: data.rates.AED,
      isFallback: false,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ ...FALLBACK, isFallback: true, updatedAt: new Date().toISOString() });
  }
}
