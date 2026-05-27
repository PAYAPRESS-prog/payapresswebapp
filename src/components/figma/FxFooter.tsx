import { PayapressLogo } from './FxIcons';

export function FxFooter() {
  return (
    <footer className="fx-footer">
      <PayapressLogo height={28} />

      <div className="fx-footer-text">
        PayaPress delivers precision-engineered copper and aluminum busbars
        for modern electrical systems. Built with industrial expertise,
        reliable performance, and a commitment to quality for projects worldwide.
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
