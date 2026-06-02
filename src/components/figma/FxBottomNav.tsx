'use client';

import { CalculatorIcon, HistoryIcon, UserIcon } from './FxIcons';

export function FxBottomNav() {
  return (
    <nav className="fx-bottom-nav" aria-label="Primary">
      <button type="button" className="fx-bottom-tab active" aria-current="page">
        <span className="fx-bottom-tab-icon-circle">
          <CalculatorIcon className="fx-bottom-tab-icon" width={22} height={22} />
        </span>
      </button>

      <button type="button" className="fx-bottom-tab" disabled title="Coming soon">
        <HistoryIcon className="fx-bottom-tab-icon" width={22} height={22} />
      </button>

      <button type="button" className="fx-bottom-tab" disabled title="Coming soon">
        <UserIcon className="fx-bottom-tab-icon" width={22} height={22} />
      </button>
    </nav>
  );
}
