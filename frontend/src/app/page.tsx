import { Header } from '@/components/Header';
import { CopperCalculator } from '@/components/CopperCalculator';
import { ComingSoonSection } from '@/components/ComingSoonSection';
import { ParticleBackground } from '@/components/ParticleBackground';

// framer-motion server-component wrappers need 'use client' — use a thin wrapper
import { HeroSection } from '@/components/HeroSection';

export default function HomePage() {
  return (
    <div className="grid-bg min-h-screen relative">
      <div className="bg-radial-pulse" />
      <ParticleBackground />

      <div className="relative z-10">
        <Header />

        <main className="max-w-3xl mx-auto px-4 pt-10 pb-16">
          <HeroSection />
          <CopperCalculator />
          <ComingSoonSection />

          <footer className="text-center text-zinc-800 text-xs mt-8">
            <p>
              PAYAPRESS PRO · Open Source ·{' '}
              <a
                href="https://github.com/PAYAPRESS-prog/payapresswebapp"
                className="hover:text-copper-700 transition-colors"
                target="_blank" rel="noopener noreferrer"
              >
                GitHub
              </a>
            </p>
            <p className="mt-1 text-zinc-900">
              Prices from COMEX HG=F via Yahoo Finance · For reference only.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
