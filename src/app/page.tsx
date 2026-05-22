import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import {
  HeroSection,
  CopperCalculator,
  ComingSoonSection,
  Footer,
  InstallPrompt,
} from '@/components/DynamicPage';

export default function HomePage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="bg-radial-pulse" />
      <SectionErrorBoundary>
        <ParticleBackground />
      </SectionErrorBoundary>

      {/* Header outside any overflow container — fixes sticky on iOS Safari */}
      <Header />

      <main className="relative z-10">
        {/* Mobile: full bleed · Desktop: centred with generous max-width */}
        <div className="w-full max-w-2xl lg:max-w-[92vw] 2xl:max-w-[1440px]
                        mx-auto
                        px-4 sm:px-6 lg:px-8
                        pt-8 sm:pt-10 lg:pt-14
                        pb-8 sm:pb-12">

          <SectionErrorBoundary>
            <HeroSection />
          </SectionErrorBoundary>

          <SectionErrorBoundary>
            <CopperCalculator />
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
