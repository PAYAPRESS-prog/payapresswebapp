'use client';

import Link from 'next/link';
import { CalculatorIcon, HistoryIcon, UserIcon } from './FxIcons';

type Tab = 'calculator' | 'history' | 'profile';

// Tab order: History (0) · Calculator (1) · Profile (2)
const TABS: { tab: Tab; href: string; Icon: React.FC<{ className?: string; width?: number; height?: number }> }[] = [
  { tab: 'history',    href: '/app/history',      Icon: HistoryIcon },
  { tab: 'calculator', href: '/busbar-calculator', Icon: CalculatorIcon },
  { tab: 'profile',    href: '/app/profile',       Icon: UserIcon },
];

export function FxBottomNav({
  active = 'calculator',
  onTabChange,
}: {
  active?: Tab;
  /** When provided, renders buttons instead of Links (embedded swipe mode). */
  onTabChange?: (idx: number) => void;
}) {
  return (
    <nav className="fx-bottom-nav" aria-label="Primary">
      {TABS.map(({ tab, href, Icon }, idx) => {
        const isActive = active === tab;
        const cls = `fx-bottom-tab${isActive ? ' active' : ''}`;
        if (onTabChange) {
          return (
            <button
              key={tab}
              type="button"
              className={cls}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(idx)}
            >
              <Icon className="fx-bottom-tab-icon" width={24} height={24} />
            </button>
          );
        }
        return (
          <Link
            key={tab}
            href={href}
            className={cls}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="fx-bottom-tab-icon" width={24} height={24} />
          </Link>
        );
      })}
    </nav>
  );
}
