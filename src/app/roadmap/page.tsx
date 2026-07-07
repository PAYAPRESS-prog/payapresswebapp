import type { Metadata } from 'next';
import { RoadmapClient } from '@/components/DynamicRoadmap';

// Target keyword: "busbar calculator roadmap" (brand/navigational).
export const metadata: Metadata = {
  alternates: { canonical: '/roadmap' },
  title: 'Product Roadmap — What’s Next for the Busbar Calculator',
  description:
    'Busbar Calculator development roadmap — from the free copper & aluminum ' +
    'busbar cost calculator to EPLAN panel costing, price alerts and a full ' +
    'industrial intelligence suite.',
  keywords: ['busbar calculator roadmap', 'busbar software', 'copper price tools'],
  openGraph: {
    type: 'website',
    url: '/roadmap',
    title: 'Busbar Calculator — Product Roadmap',
    description:
      'Where the free busbar cost calculator is headed: EPLAN panel costing, price alerts and more.',
  },
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
