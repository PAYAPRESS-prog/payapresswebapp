import type { Metadata } from 'next';
import { FxHistoryPage } from '@/components/figma/FxHistoryPage';
import { fetchCopperPrice, fetchAluminumPrice } from '@/lib/serverPrices';

export const metadata: Metadata = { title: 'History' };

export default async function HistoryPageRoute() {
  const [copper, aluminum] = await Promise.allSettled([
    fetchCopperPrice(),
    fetchAluminumPrice(),
  ]);
  return (
    <FxHistoryPage
      copperPrice={copper.status === 'fulfilled' ? copper.value.pricePerKg : null}
      aluminumPrice={aluminum.status === 'fulfilled' ? aluminum.value.pricePerKg : null}
    />
  );
}
