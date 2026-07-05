import { BusbarLogo } from './FxIcons';

/* App footer — the original Figma design: brand logo, one-line mission
   text, Copper / Aluminum bullets and the "All Rights reserved" rule.
   (Restored after being dropped in the swipe-shell page rebuild.) */
export function FxFooter() {
  return (
    <footer className="fx-footer">
      <BusbarLogo height={28} />

      <div className="fx-footer-text">
        Professional copper and aluminum busbar sizing with live market pricing.
        Accurate weight, current capacity, and cost calculations for electrical
        engineers and panel fabricators worldwide.
      </div>

      <div className="fx-footer-bullet">
        <ul><li className="copper">Copper</li></ul>
      </div>
      <div className="fx-footer-bullet">
        <ul><li>Aluminum</li></ul>
      </div>

      <div className="fx-footer-divider">
        <span>All Rights reserved</span>
      </div>
    </footer>
  );
}
