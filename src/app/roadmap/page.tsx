import type { Metadata } from 'next';
import { RoadmapClient } from '@/components/DynamicRoadmap';

export const metadata: Metadata = {
  alternates: { canonical: '/roadmap' },
  title: 'Roadmap',
  description: 'Busbar Calculator development roadmap — from copper busbar calculator to a full industrial intelligence suite.',
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
