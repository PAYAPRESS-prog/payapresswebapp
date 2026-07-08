'use client';

import dynamic from 'next/dynamic';

// Client-only load, mirroring DynamicRoadmap: framer-motion scroll hooks
// need the browser, and a dark placeholder avoids any flash.
export const WhitepaperClient = dynamic(
  () => import('./WhitepaperClient'),
  {
    ssr: false,
    loading: () => (
      <div style={{ background: '#0b0d10', minHeight: '100svh' }} />
    ),
  },
);
