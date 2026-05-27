import { BusbarMock } from './FxIcons';

export function FxHero() {
  return (
    <section className="fx-hero">
      <div className="fx-hero-img">
        {/* Stack of three busbars, sized to fill the slot */}
        <svg viewBox="0 0 200 160" width="100%" height="100%" aria-hidden="true">
          <defs>
            <linearGradient id="hero-cu-top" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f0b486" />
              <stop offset="100%" stopColor="#b87333" />
            </linearGradient>
            <linearGradient id="hero-cu-side" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a8632a" />
              <stop offset="100%" stopColor="#5c2e16" />
            </linearGradient>
            <linearGradient id="hero-al-top" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e7ecf0" />
              <stop offset="100%" stopColor="#a8b1b9" />
            </linearGradient>
            <linearGradient id="hero-al-side" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8e9aa3" />
              <stop offset="100%" stopColor="#535b62" />
            </linearGradient>
          </defs>
          {/* aluminum bar (back) */}
          <polygon points="40,40 170,10 195,18 60,52"   fill="url(#hero-al-top)" />
          <polygon points="170,10 195,18 195,32 170,24" fill="#4a5258" />
          <polygon points="60,52 195,18 195,32 60,66"   fill="url(#hero-al-side)" />
          {/* copper bar (mid) */}
          <polygon points="22,72 160,38 195,48 60,82"   fill="url(#hero-cu-top)" />
          <polygon points="160,38 195,48 195,64 160,54" fill="#5c2e16" />
          <polygon points="60,82 195,48 195,64 60,96"   fill="url(#hero-cu-side)" />
          {/* copper bar (front) */}
          <polygon points="5,102 150,68 195,80 50,114"  fill="url(#hero-cu-top)" />
          <polygon points="150,68 195,80 195,98 150,86" fill="#5c2e16" />
          <polygon points="50,114 195,80 195,98 50,132" fill="url(#hero-cu-side)" />
        </svg>
      </div>

      <h1 className="fx-hero-title">
        BusBar price<br />Calculator
      </h1>
      <p className="fx-hero-sub">
        Calculate Copper &amp; Aluminum<br />price instantly
      </p>
    </section>
  );
}
