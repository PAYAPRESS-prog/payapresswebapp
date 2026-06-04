import type { Metadata } from 'next';
import { FxProfilePage } from '@/components/figma/FxProfilePage';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfilePageRoute() {
  return <FxProfilePage />;
}
