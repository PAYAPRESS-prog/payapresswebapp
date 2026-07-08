import type { Metadata } from 'next';
import { WhitepaperClient } from '@/components/DynamicWhitepaper';

// Target keywords: "busbar calculation formula", "busbar weight formula" —
// the methodology content answers these informational queries.
export const metadata: Metadata = {
  alternates: { canonical: '/whitepaper' },
  title: 'Whitepaper — Busbar Calculation Formulas & Methodology',
  description:
    'How the Busbar Calculator works under the hood: busbar weight and cost ' +
    'formulas, ampacity methodology, live COMEX/LME price pipeline, kerf & ' +
    'punch-out waste math, architecture and technology stack.',
  keywords: [
    'busbar calculation formula', 'busbar weight formula', 'busbar ampacity',
    'copper density calculation', 'busbar engineering methodology',
  ],
  openGraph: {
    type: 'article',
    url: '/whitepaper',
    title: 'Busbar Calculation Formulas & Methodology — Whitepaper',
    description:
      'Weight, cost and waste formulas, ampacity methodology and the live price pipeline behind the Busbar Calculator.',
  },
};

export default function WhitepaperPage() {
  return <WhitepaperClient />;
}
