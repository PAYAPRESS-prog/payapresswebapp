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
        <div className="w-full max-w-2xl lg:max-w-[92vw] 2xl:max-w-[1440px]
                        mx-auto
                        px-4 sm:px-6 lg:px-8
                        pt-8 sm:pt-10 lg:pt-14
                        pb-8 sm:pb-12">

          <SectionErrorBoundary>
            <HeroSection />
          </SectionErrorBoundary>

          <SectionErrorBoundary>
            <CopperCalculator initialData={initialData} />
          </SectionErrorBoundary>

          <div className="mt-12 sm:mt-16 lg:mt-20">
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
