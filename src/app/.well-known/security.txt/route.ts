import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/siteUrl';

// RFC 9116 responsible-disclosure contact.
export const dynamic = 'force-static';

export function GET() {
  const body = [
    'Contact: mailto:info@calculator.payapress.com',
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    'Preferred-Languages: en',
    'Expires: 2027-12-31T23:59:59.000Z',
  ].join('\n') + '\n';
  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
