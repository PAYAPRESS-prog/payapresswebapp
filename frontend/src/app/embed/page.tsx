import { CopperCalculator } from '@/components/CopperCalculator';

// Minimal layout for WordPress iframe embed
export default function EmbedPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] p-4">
      <CopperCalculator />
      <p className="text-center text-zinc-700 text-[0.65rem] mt-3">
        Powered by{' '}
        <a href="https://payapress.com" className="hover:text-copper-600 transition-colors">
          PAYAPRESS
        </a>
      </p>
    </div>
  );
}
