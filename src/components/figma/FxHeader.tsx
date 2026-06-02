'use client';

import { BellIcon, HamburgerIcon } from './FxIcons';

export function FxHeader() {
  return (
    <header className="fx-header">
      <div className="fx-header-row">
        <button
          type="button"
          className="fx-icon-btn"
          aria-label="Notifications (coming soon)"
          title="Coming soon"
          disabled
        >
          <BellIcon width={24} height={24} />
        </button>
        <span className="fx-header-title">Busbar Calculator</span>
        <button
          type="button"
          className="fx-icon-btn"
          aria-label="Menu (coming soon)"
          title="Coming soon"
          disabled
        >
          <HamburgerIcon width={24} height={24} />
        </button>
      </div>
    </header>
  );
}
