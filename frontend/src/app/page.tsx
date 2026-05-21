import { Header } from '@/components/Header';
import { CopperCalculator } from '@/components/CopperCalculator';
import { ComingSoonSection } from '@/components/ComingSoonSection';
import { ParticleBackground } from '@/components/ParticleBackground';
import { HeroSection } from '@/components/HeroSection';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="bg-radial-pulse" />
      <ParticleBackground />

      {/* Header outside any overflow container — fixes sticky on iOS Safari */}
      <Header />

      <main className="relative z-10">
        <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto
                        px-4 sm:px-6 lg:px-8
                        pt-8 sm:pt-10 lg:pt-14
                        pb-8 sm:pb-12">

          <HeroSection />
          <CopperCalculator />
          <ComingSoonSection />
        </div>
      </main>

      <InstallPrompt />
      <Footer />
    </div>
  );
}
