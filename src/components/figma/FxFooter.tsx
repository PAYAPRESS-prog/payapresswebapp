import { PayapressLogo } from './FxIcons';

export function FxFooter() {
  return (
    <footer className="fx-footer">
      <PayapressLogo height={28} />

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
