'use client';

import dynamic from 'next/dynamic';

export const RoadmapClient = dynamic(
  () => import('./RoadmapClient'),
  {
    ssr: false,
    loading: () => (
      <div style={{ background: '#060608', minHeight: '100svh' }} />
    ),
  },
);
