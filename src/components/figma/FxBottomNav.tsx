'use client';

import Link from 'next/link';
import { CalculatorIcon, HistoryIcon, UserIcon } from './FxIcons';

type Tab = 'calculator' | 'history' | 'profile';

export function FxBottomNav({ active = 'calculator' }: { active?: Tab }) {
  return (
    <nav className="fx-bottom-nav" aria-label="Primary">
      <Link
        href="/busbar-calculator"
        className={`fx-bottom-tab${active === 'calculator' ? ' active' : ''}`}
        aria-current={active === 'calculator' ? 'page' : undefined}
      >
        <CalculatorIcon className="fx-bottom-tab-icon" width={24} height={24} />
      </Link>

      <Link
        href="/app/history"
        className={`fx-bottom-tab${active === 'history' ? ' active' : ''}`}
        aria-current={active === 'history' ? 'page' : undefined}
      >
        <HistoryIcon className="fx-bottom-tab-icon" width={24} height={24} />
      </Link>

      <Link
        href="/app/profile"
        className={`fx-bottom-tab${active === 'profile' ? ' active' : ''}`}
        aria-current={active === 'profile' ? 'page' : undefined}
      >
        <UserIcon className="fx-bottom-tab-icon" width={24} height={24} />
      </Link>
    </nav>
  );
}
