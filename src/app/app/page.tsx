import type { Metadata } from 'next';
import { FxAppMenu } from '@/components/figma/FxAppMenu';

export const metadata: Metadata = {
  title: 'Menu',
};

export default function AppMenuPage() {
  return <FxAppMenu />;
}
