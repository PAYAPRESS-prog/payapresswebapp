import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { CopperCalculator } from '@/components/CopperCalculator';
import { HeroSection } from '@/components/HeroSection';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ParticleBackground } from '@/components/ParticleBackground';

const ComingSoonSection = dynamic(
  () => import('@/components/ComingSoonSection').then(m => ({ default: m.ComingSoonSection })),
);

const Footer = dynamic(
  () => import('@/components/Footer').then(m => ({ default: m.Footer })),
);

export default function HomePage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="bg-radial-pulse" />
      <ParticleBackground />

      {/* Header outside any overflow container — fixes sticky on iOS Safari */}
      <Header />

      <main className="relative z-10">
        {/* Mobile: full bleed · Desktop: centred with generous max-width */}
        <div className="w-full max-w-2xl lg:max-w-[92vw] 2xl:max-w-[1440px]
                        mx-auto
                        px-4 sm:px-6 lg:px-8
                        pt-8 sm:pt-10 lg:pt-14
                        pb-8 sm:pb-12">

          <HeroSection />
          <CopperCalculator />
          <div className="mt-12 sm:mt-16 lg:mt-20">
            <ComingSoonSection />
          </div>
        </div>
      </main>

      <InstallPrompt />
      <Footer />
    </div>
  );
}
