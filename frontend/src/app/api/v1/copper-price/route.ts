import { NextRequest, NextResponse } from 'next/server';

const CORS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  try {
    const r    = await fetch(new URL('/api/copper-price', req.nextUrl.origin).toString(),
                             { next: { revalidate: 300 } });
    const data = await r.json();
    return NextResponse.json({ ...data, api_version: 'v1' }, { status: 200, headers: CORS });
  } catch {
    return NextResponse.json(
      { error: 'SERVICE_UNAVAILABLE', message: 'Failed to fetch copper price' },
      { status: 503, headers: CORS },
    );
  }
}
