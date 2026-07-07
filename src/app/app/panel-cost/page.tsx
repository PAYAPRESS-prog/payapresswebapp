import type { Metadata } from 'next';
import Link from 'next/link';
import { PanelCostTool } from '@/components/panel/PanelCostTool';
import { fetchCopperPrice, fetchAluminumPrice } from '@/lib/serverPrices';

export const metadata: Metadata = { title: 'Panel Cost (EPLAN)' };

export default async function PanelCostRoute() {
  const [copper, aluminum] = await Promise.allSettled([
    fetchCopperPrice(),
    fetchAluminumPrice(),
  ]);
  return (
    <main className="pnl-page">
      <Link href="/app" className="pnl-back">← Menu</Link>
      <h1 className="pnl-page-title">Electrical Panel Busbar Cost</h1>
      <p className="pnl-page-sub">Import your EPLAN busbar list — get net weight, waste and live cost.</p>
      <PanelCostTool
        copperPricePerKg={copper.status === 'fulfilled' ? copper.value.pricePerKg : null}
        aluminumPricePerKg={aluminum.status === 'fulfilled' ? aluminum.value.pricePerKg : null}
      />
    </main>
  );
}
