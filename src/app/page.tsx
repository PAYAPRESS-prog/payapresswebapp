import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { FxWelcome } from '@/components/figma/FxWelcome';

import type { Metadata } from 'next';

// Target keyword: "busbar price calculator" (the primary "busbar calculator"
// head term is owned by /busbar-calculator — kept distinct to avoid
// cannibalization).
export const metadata: Metadata = {
  title: { absolute: 'Busbar Price Calculator — Live Copper & Aluminum Rates | Busbar Calculator' },
  description:
    'Start the free busbar price calculator — size copper & aluminum busbars to IEC ' +
    'standards and price them with live COMEX/LME rates in 17 currencies.',
  keywords: [
    'busbar price calculator', 'copper busbar price', 'aluminum busbar price',
    'busbar cost', 'live copper price', 'busbar sizing',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Busbar Price Calculator — Live Copper & Aluminum Rates',
    description:
      'Size copper & aluminum busbars to IEC standards and price them with live COMEX/LME rates in 17 currencies — free.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Busbar Price Calculator — Live Copper & Aluminum Rates',
    description:
      'Size copper & aluminum busbars to IEC standards and price them live in 17 currencies.',
  },
};


// The welcome screen reads the session cookie, so it must be dynamic.
export const dynamic = 'force-dynamic';

export default async function WelcomePage() {
  // If the visitor already has a valid session, skip the welcome gate
  // entirely and drop them straight onto the app menu (second screen).
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && (await verifySessionToken(token))) {
    redirect('/app');
  }

  return <FxWelcome />;
}
