import type { Metadata } from 'next';
import { RoadmapClient } from '@/components/DynamicRoadmap';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'PAYAPRESS development roadmap — from copper busbar calculator to a full industrial intelligence suite.',
  robots: { index: false, follow: false },
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
