import type { Metadata } from 'next';
import { FxWastePage } from '@/components/figma/FxWastePage';
import { fetchCopperPrice, fetchAluminumPrice } from '@/lib/serverPrices';

export const metadata: Metadata = { title: 'Waste Calculator' };

export default async function WastePageRoute() {
  const [copper, aluminum] = await Promise.allSettled([
    fetchCopperPrice(),
    fetchAluminumPrice(),
  ]);
  return (
    <FxWastePage
      copperPricePerKg={copper.status === 'fulfilled' ? copper.value.pricePerKg : null}
      aluminumPricePerKg={aluminum.status === 'fulfilled' ? aluminum.value.pricePerKg : null}
    />
  );
}
