import { Header } from '@/components/Header';
import { CopperCalculator } from '@/components/CopperCalculator';
import { ComingSoonSection } from '@/components/ComingSoonSection';
import { ParticleBackground } from '@/components/ParticleBackground';
import { HeroSection } from '@/components/HeroSection';

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
                        pb-16 sm:pb-20">

          <HeroSection />
          <CopperCalculator />
          <ComingSoonSection />

          <footer className="text-center text-zinc-700 text-[0.7rem] mt-10 space-y-1.5 pb-safe">
            <p>
              PAYAPRESS PRO &nbsp;·&nbsp; Open Source &nbsp;·&nbsp;{' '}
              <a href="https://github.com/PAYAPRESS-prog/payapresswebapp"
                 className="hover:text-copper-600 transition-colors underline underline-offset-2"
                 target="_blank" rel="noopener noreferrer">GitHub</a>
              &nbsp;·&nbsp;{' '}
              <a href="https://www.payapress.com"
                 className="hover:text-copper-600 transition-colors underline underline-offset-2"
                 target="_blank" rel="noopener noreferrer">payapress.com</a>
            </p>
            <p className="text-zinc-800">
              Prices from COMEX HG=F via Yahoo Finance &nbsp;·&nbsp; For reference only.
            </p>
            <p className="text-zinc-800">
              © 2025 PAYAP MACHINERY &nbsp;·&nbsp; Trading as PAYAPRESS
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
