import { FxSwipeApp } from '@/components/figma/FxSwipeApp';
import { FxDesktopLanding } from '@/components/figma/FxDesktopLanding';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { fetchCopperPrice, fetchAluminumPrice, fetchFxRates } from '@/lib/serverPrices';

export default async function CalculatorPage() {
  const [copper, aluminum, fx] = await Promise.allSettled([
    fetchCopperPrice(),
    fetchAluminumPrice(),
    fetchFxRates(),
  ]);

  const copperVal   = copper.status   === 'fulfilled' ? copper.value   : null;
  const aluminumVal = aluminum.status === 'fulfilled' ? aluminum.value : null;

  const initialData = {
    copper:   copperVal,
    aluminum: aluminumVal,
    fx:       fx.status === 'fulfilled' ? fx.value : null,
  };

  return (
    <SectionErrorBoundary>
      {/* Desktop-only landing (Figma page 114:299) — hidden below 1024px */}
      <FxDesktopLanding />
      <div id="fx-app-anchor">
        <FxSwipeApp
          initialData={initialData}
          copperPrice={copperVal?.pricePerKg ?? null}
          aluminumPrice={aluminumVal?.pricePerKg ?? null}
        />
      </div>
    </SectionErrorBoundary>
  );
}
