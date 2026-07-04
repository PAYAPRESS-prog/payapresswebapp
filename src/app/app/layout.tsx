import type { Metadata } from 'next';

// Everything under /app is the signed-in application surface —
// keep it out of search engines (robots.txt also disallows /app/).
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
