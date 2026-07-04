import { NextResponse } from 'next/server';

// Google Search Console ownership verification.
// The GSC property was registered with the URL prefix
// https://calculator.payapress.com/busbar-calculator/ so Google fetches
// the token file UNDER that path; public/ only serves from the root,
// hence this dedicated route. Do not delete — GSC re-checks periodically.
export function GET() {
  return new NextResponse('google-site-verification: googlee26e9f9d29e8ef08.html', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
