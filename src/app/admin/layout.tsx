import type { Metadata } from 'next';

// Private surface: never indexed, never described.
export const metadata: Metadata = {
  title: 'Not Found',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
