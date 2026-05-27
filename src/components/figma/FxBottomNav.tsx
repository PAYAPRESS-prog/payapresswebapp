'use client';

import { CalculatorIcon, LayersIcon, HistoryIcon } from './FxIcons';

export function FxBottomNav() {
  return (
    <nav className="fx-bottom-nav" aria-label="Primary">
      <button type="button" className="fx-bottom-tab active" aria-current="page">
        <CalculatorIcon className="fx-bottom-tab-icon" />
        <span className="fx-bottom-tab-label">Calculator</span>
      </button>

      <button type="button" className="fx-bottom-tab" disabled title="Coming soon">
        <LayersIcon className="fx-bottom-tab-icon" />
        <span className="fx-bottom-tab-label">Material</span>
      </button>

      <button type="button" className="fx-bottom-tab" disabled title="Coming soon">
        <HistoryIcon className="fx-bottom-tab-icon" />
        <span className="fx-bottom-tab-label">History</span>
      </button>
    </nav>
  );
}
