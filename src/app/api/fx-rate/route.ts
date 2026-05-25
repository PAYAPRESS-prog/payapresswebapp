import { NextResponse } from 'next/server';
import { fetchFxRates } from '@/lib/serverPrices';

export async function GET() {
  const data = await fetchFxRates();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': data.isFallback
        ? 'public, s-maxage=3600, stale-while-revalidate=600'
        : 'public, s-maxage=21600, stale-while-revalidate=3600',
    },
  });
}
