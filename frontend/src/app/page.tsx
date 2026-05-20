import { Header } from '@/components/Header';
import { CopperCalculator } from '@/components/CopperCalculator';
import { ComingSoonSection } from '@/components/ComingSoonSection';

export default function HomePage() {
  return (
    <div className="grid-bg min-h-screen">
      <Header />

      <main className="max-w-3xl mx-auto px-4 pt-12 pb-16">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-[0.7rem] font-bold tracking-[0.3em] text-copper-600 uppercase mb-3">
            Electrical Panel Fabrication Tools
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Copper Busbar
            <br />
            <span className="text-copper-gradient">Cost Calculator</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            Real-time COMEX copper pricing · IEC &amp; DIN standard sizes ·
            Instant cost per meter and per m²
          </p>
        </div>

        {/* Calculator */}
        <CopperCalculator />

        {/* Coming soon */}
        <ComingSoonSection />

        {/* Footer */}
        <footer className="text-center text-zinc-700 text-xs mt-4">
          <p>
            PAYAPRESS PRO · Open Source ·{' '}
            <a
              href="https://github.com/PAYAPRESS-prog/payapresswebapp"
              className="hover:text-copper-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
          <p className="mt-1 text-zinc-800">
            Prices sourced from COMEX HG=F via Yahoo Finance. For reference only.
          </p>
        </footer>
      </main>
    </div>
  );
}
