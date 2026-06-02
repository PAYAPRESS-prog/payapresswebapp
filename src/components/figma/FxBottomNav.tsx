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
        <span className={active === 'calculator' ? 'fx-bottom-tab-icon-circle' : undefined}>
          <CalculatorIcon className="fx-bottom-tab-icon" width={22} height={22} />
        </span>
      </Link>

      <Link
        href="/app/history"
        className={`fx-bottom-tab${active === 'history' ? ' active' : ''}`}
        aria-current={active === 'history' ? 'page' : undefined}
      >
        <span className={active === 'history' ? 'fx-bottom-tab-icon-circle' : undefined}>
          <HistoryIcon className="fx-bottom-tab-icon" width={22} height={22} />
        </span>
      </Link>

      <button type="button" className="fx-bottom-tab" disabled title="Coming soon">
        <UserIcon className="fx-bottom-tab-icon" width={22} height={22} />
      </button>
    </nav>
  );
}
