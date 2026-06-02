'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalculatorIcon,
  HistoryIcon,
  ChartUpIcon,
  MagicStickIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from './FxIcons';

type Item = {
  key: string;
  label: string;
  Icon: (p: { className?: string; width?: number; height?: number }) => React.ReactElement;
  href?: string;          // present → real route; absent → coming soon
};

const ITEMS: Item[] = [
  { key: 'calc',    label: 'Busbar Calculator',  Icon: CalculatorIcon, href: '/busbar-calculator' },
  { key: 'history', label: 'History',            Icon: HistoryIcon },
  { key: 'trends',  label: 'Current Trends',     Icon: ChartUpIcon },
  { key: 'future',  label: 'Future Projections', Icon: MagicStickIcon },
];

export function FxAppMenu() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss the "coming soon" toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const comingSoon = (label: string) => setToast(`${label} — Coming soon`);

  return (
    <div className="fx-menu">
      <div className="fx-menu-inner">
        <button
          type="button"
          className="fx-menu-back"
          onClick={() => router.push('/')}
        >
          <ArrowLeftIcon width={22} height={22} />
          <span>Go back</span>
        </button>

        <nav className="fx-menu-list" aria-label="Sections">
          {ITEMS.map(({ key, label, Icon, href }) =>
            href ? (
              <Link key={key} href={href} className="fx-menu-row">
                <Icon className="fx-menu-row-icon" width={28} height={28} />
                <span className="fx-menu-row-label">{label}</span>
                <ArrowRightIcon className="fx-menu-row-chevron" width={24} height={24} />
              </Link>
            ) : (
              <button
                key={key}
                type="button"
                className="fx-menu-row"
                onClick={() => comingSoon(label)}
              >
                <Icon className="fx-menu-row-icon" width={28} height={28} />
                <span className="fx-menu-row-label">{label}</span>
                <ArrowRightIcon className="fx-menu-row-chevron" width={24} height={24} />
              </button>
            ),
          )}
        </nav>
      </div>

      {toast && <div className="fx-menu-toast" role="status">{toast}</div>}
    </div>
  );
}
