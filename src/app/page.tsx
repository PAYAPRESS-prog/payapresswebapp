import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { HeroSection } from '@/components/HeroSection';
import { ComingSoonSection } from '@/components/ComingSoonSection';
import { Footer } from '@/components/Footer';
import { InstallPrompt } from '@/components/InstallPrompt';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { CopperCalculator } from '@/components/DynamicPage';
import { fetchCopperPrice, fetchAluminumPrice, fetchFxRates } from '@/lib/serverPrices';

export default async function HomePage() {
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
    <div className="grid-bg min-h-screen">
      <div className="bg-radial-pulse" />
      <SectionErrorBoundary>
        <ParticleBackground />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <Header />
      </SectionErrorBoundary>

      <main className="relative z-10">
        <div className="w-full max-w-2xl mx-auto
                        px-4 sm:px-6
                        pt-6 sm:pt-10
                        pb-10 sm:pb-14">

          <SectionErrorBoundary>
            <HeroSection />
          </SectionErrorBoundary>

          <SectionErrorBoundary>
            <CopperCalculator initialData={initialData} />
          </SectionErrorBoundary>

          <div className="mt-10 sm:mt-14">
            <SectionErrorBoundary>
              <ComingSoonSection />
            </SectionErrorBoundary>
          </div>
        </div>
      </main>

      <SectionErrorBoundary>
        <InstallPrompt />
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <Footer />
      </SectionErrorBoundary>
    </div>
  );
}
