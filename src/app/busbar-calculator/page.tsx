import { FxHeader } from '@/components/figma/FxHeader';
import { FxBottomNav } from '@/components/figma/FxBottomNav';
import { FxCalculator } from '@/components/figma/FxCalculator';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { fetchCopperPrice, fetchAluminumPrice, fetchFxRates } from '@/lib/serverPrices';

export default async function CalculatorPage() {
  const [copper, aluminum, fx] = await Promise.allSettled([
    fetchCopperPrice(),
    fetchAluminumPrice(),
    fetchFxRates(),
  ]);

  const initialData = {
    copper:   copper.status   === 'fulfilled' ? copper.value   : null,
    aluminum: aluminum.status === 'fulfilled' ? aluminum.value : null,
    fx:       fx.status       === 'fulfilled' ? fx.value       : null,
  };

  return (
    <div className="fx-app">
      <SectionErrorBoundary>
        <FxHeader />
      </SectionErrorBoundary>

      <main>
        <SectionErrorBoundary>
          <FxCalculator initialData={initialData} />
        </SectionErrorBoundary>
      </main>

      <SectionErrorBoundary>
        <FxBottomNav />
      </SectionErrorBoundary>
    </div>
  );
}
