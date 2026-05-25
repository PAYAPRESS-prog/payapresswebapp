import { NextResponse } from 'next/server';
import { fetchCopperPrice } from '@/lib/serverPrices';

export async function GET() {
  const data = await fetchCopperPrice();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': data.isFallback
        ? 'public, s-maxage=60, stale-while-revalidate=30'
        : 'public, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
