import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'PAYAPRESS — Copper Busbar Cost Calculator',
  description:
    'Professional real-time copper busbar cost calculator for electrical panel fabricators. Live COMEX pricing, IEC/DIN standards.',
  keywords: 'copper busbar, cost calculator, electrical panel, IEC 60317, Cu-ETP, live copper price',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#cd7f32',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
